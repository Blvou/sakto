-- Single-query conversation previews and unread count (replaces N+1 client loops)

create or replace function public.get_conversation_previews(p_user_id uuid)
returns table (
  id uuid,
  listing_id uuid,
  listing_title text,
  listing_image_url text,
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
  order by coalesce(lm.created_at, c.updated_at) desc;
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
    and m.sender_id <> p_user_id;
$$;

grant execute on function public.get_conversation_previews(uuid) to authenticated;
grant execute on function public.get_unread_total(uuid) to authenticated;
