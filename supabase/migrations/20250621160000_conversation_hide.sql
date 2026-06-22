-- Per-user chat deletion (hide from inbox; reappears when a newer message arrives).

alter table public.conversation_participants
  add column if not exists hidden_at timestamptz;

create index if not exists conversation_participants_user_hidden_idx
  on public.conversation_participants (user_id, hidden_at);

create or replace function public.hide_conversation(p_conversation_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_conversation_participant(p_conversation_id, auth.uid()) then
    raise exception 'Conversation not found';
  end if;

  update public.conversation_participants
  set hidden_at = now()
  where conversation_id = p_conversation_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.hide_conversation(uuid) to authenticated;

drop function if exists public.get_conversation_previews(uuid, int, timestamptz);

create or replace function public.get_conversation_previews(
  p_user_id uuid,
  p_limit int default 50,
  p_cursor timestamptz default null
)
returns table (
  id uuid,
  listing_id uuid,
  listing_title text,
  listing_image_url text,
  booking_id uuid,
  vehicle_title text,
  vehicle_image_path text,
  other_user_id uuid,
  other_user_display_name text,
  other_user_avatar_url text,
  other_user_preferred_lang text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.listing_id,
    l.title as listing_title,
    l.image_url as listing_image_url,
    c.booking_id,
    coalesce(v.title, l.title) as vehicle_title,
    coalesce(vp.storage_path, null) as vehicle_image_path,
    p.id as other_user_id,
    p.display_name as other_user_display_name,
    p.avatar_url as other_user_avatar_url,
    p.preferred_lang as other_user_preferred_lang,
    lm.body as last_message,
    coalesce(lm.created_at, c.updated_at) as last_message_at,
    coalesce(uc.cnt, 0) as unread_count
  from public.conversation_participants cp
  join public.conversations c on c.id = cp.conversation_id
  join public.conversation_participants ocp
    on ocp.conversation_id = c.id
    and ocp.user_id <> p_user_id
  join public.profiles p on p.id = ocp.user_id
  left join public.listings l on l.id = c.listing_id
  left join public.bookings b on b.id = c.booking_id
  left join public.vehicles v on v.id = b.vehicle_id
  left join lateral (
    select vp_inner.storage_path
    from public.vehicle_photos vp_inner
    where vp_inner.vehicle_id = b.vehicle_id
    order by vp_inner.sort_order asc, vp_inner.created_at asc
    limit 1
  ) vp on true
  left join lateral (
    select m.body, m.created_at
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*)::bigint as cnt
    from public.messages m
    where m.conversation_id = c.id
      and m.created_at > cp.last_read_at
      and m.sender_id <> p_user_id
  ) uc on true
  where cp.user_id = p_user_id
    and auth.uid() = p_user_id
    and (
      cp.hidden_at is null
      or coalesce(lm.created_at, c.updated_at) > cp.hidden_at
    )
    and (
      p_cursor is null
      or coalesce(lm.created_at, c.updated_at) < p_cursor
    )
  order by coalesce(lm.created_at, c.updated_at) desc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

create or replace function public.get_unread_total(p_user_id uuid)
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(count(*)::bigint, 0)
  from public.conversation_participants cp
  join public.messages m on m.conversation_id = cp.conversation_id
  where cp.user_id = p_user_id
    and auth.uid() = p_user_id
    and m.created_at > cp.last_read_at
    and m.sender_id <> p_user_id
    and (
      cp.hidden_at is null
      or m.created_at > cp.hidden_at
    );
$$;

grant execute on function public.get_conversation_previews(uuid, int, timestamptz) to authenticated;
grant execute on function public.get_unread_total(uuid) to authenticated;
