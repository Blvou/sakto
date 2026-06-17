-- Booking-linked chat conversations between renter and vehicle owner.

alter table public.conversations
  add column if not exists booking_id uuid references public.bookings (id) on delete set null;

create unique index if not exists conversations_booking_id_unique
  on public.conversations (booking_id)
  where booking_id is not null;

create or replace function public.get_or_create_booking_conversation(p_booking_id uuid)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_renter_id uuid;
  v_owner_id uuid;
  v_vehicle_title text;
  v_vehicle_image_path text;
  v_conversation_id uuid;
  v_other_user_id uuid;
  v_other_user public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select b.renter_id, b.owner_id, v.title
  into v_renter_id, v_owner_id, v_vehicle_title
  from public.bookings b
  join public.vehicles v on v.id = b.vehicle_id
  where b.id = p_booking_id;

  if v_renter_id is null then
    raise exception 'Booking not found';
  end if;

  if auth.uid() not in (v_renter_id, v_owner_id) then
    raise exception 'Not allowed to open this booking chat';
  end if;

  select vp.storage_path
  into v_vehicle_image_path
  from public.vehicle_photos vp
  join public.bookings b on b.vehicle_id = vp.vehicle_id
  where b.id = p_booking_id
  order by vp.sort_order asc, vp.created_at asc
  limit 1;

  select c.id
  into v_conversation_id
  from public.conversations c
  where c.booking_id = p_booking_id;

  if v_conversation_id is null then
    insert into public.conversations (booking_id, buyer_id)
    values (p_booking_id, v_renter_id)
    returning id into v_conversation_id;

    insert into public.conversation_participants (conversation_id, user_id)
    values
      (v_conversation_id, v_renter_id),
      (v_conversation_id, v_owner_id);
  end if;

  v_other_user_id := case
    when auth.uid() = v_renter_id then v_owner_id
    else v_renter_id
  end;

  select *
  into v_other_user
  from public.profiles
  where id = v_other_user_id;

  return jsonb_build_object(
    'id', v_conversation_id,
    'booking_id', p_booking_id,
    'vehicle_title', v_vehicle_title,
    'vehicle_image_path', v_vehicle_image_path,
    'other_user', jsonb_build_object(
      'id', v_other_user.id,
      'display_name', v_other_user.display_name,
      'avatar_url', v_other_user.avatar_url,
      'preferred_lang', v_other_user.preferred_lang
    )
  );
end;
$$;

grant execute on function public.get_or_create_booking_conversation(uuid) to authenticated;

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
      p_cursor is null
      or coalesce(lm.created_at, c.updated_at) < p_cursor
    )
  order by coalesce(lm.created_at, c.updated_at) desc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

create or replace function public.get_thread_snapshot(
  p_conversation_id uuid,
  p_user_id uuid,
  p_message_limit int default 30
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_other_user public.profiles%rowtype;
  v_listing_title text;
  v_booking_id uuid;
  v_vehicle_title text;
  v_recipient_last_read timestamptz;
  v_messages jsonb;
  v_delivered_ids jsonb;
  v_limit int;
  v_recent_count int;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Not authenticated';
  end if;

  if not public.is_conversation_participant(p_conversation_id, p_user_id) then
    raise exception 'Conversation not found';
  end if;

  v_limit := greatest(coalesce(p_message_limit, 30), 1);

  select
    l.title,
    c.booking_id,
    v.title
  into v_listing_title, v_booking_id, v_vehicle_title
  from public.conversations c
  left join public.listings l on l.id = c.listing_id
  left join public.bookings b on b.id = c.booking_id
  left join public.vehicles v on v.id = b.vehicle_id
  where c.id = p_conversation_id;

  select p.*
  into v_other_user
  from public.conversation_participants cp
  join public.profiles p on p.id = cp.user_id
  where cp.conversation_id = p_conversation_id
    and cp.user_id <> p_user_id
  limit 1;

  if v_other_user.id is null then
    raise exception 'Conversation not found';
  end if;

  select cp.last_read_at
  into v_recipient_last_read
  from public.conversation_participants cp
  where cp.conversation_id = p_conversation_id
    and cp.user_id = v_other_user.id;

  with recent as (
    select id, conversation_id, sender_id, body, created_at
    from public.messages
    where conversation_id = p_conversation_id
    order by created_at desc
    limit v_limit + 1
  )
  select count(*)::int
  into v_recent_count
  from recent;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'conversation_id', m.conversation_id,
        'sender_id', m.sender_id,
        'body', m.body,
        'created_at', m.created_at
      )
      order by m.created_at asc
    ),
    '[]'::jsonb
  )
  into v_messages
  from (
    select id, conversation_id, sender_id, body, created_at
    from public.messages
    where conversation_id = p_conversation_id
    order by created_at desc
    limit v_limit
  ) m;

  select coalesce(jsonb_agg(mr.message_id), '[]'::jsonb)
  into v_delivered_ids
  from public.message_receipts mr
  where mr.user_id = v_other_user.id
    and mr.message_id in (
      select id
      from public.messages
      where conversation_id = p_conversation_id
      order by created_at desc
      limit v_limit
    );

  return jsonb_build_object(
    'other_user', jsonb_build_object(
      'id', v_other_user.id,
      'display_name', v_other_user.display_name,
      'avatar_url', v_other_user.avatar_url,
      'preferred_lang', v_other_user.preferred_lang
    ),
    'listing_title', coalesce(v_vehicle_title, v_listing_title),
    'booking_id', v_booking_id,
    'messages', v_messages,
    'has_more_messages', v_recent_count > v_limit,
    'recipient_last_read_at', v_recipient_last_read,
    'delivered_message_ids', v_delivered_ids
  );
end;
$$;

grant execute on function public.get_conversation_previews(uuid, int, timestamptz) to authenticated;
grant execute on function public.get_thread_snapshot(uuid, uuid, int) to authenticated;
