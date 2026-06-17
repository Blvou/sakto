-- One round-trip for chat thread open: meta + recent messages + receipt state.

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
  v_recipient_last_read timestamptz;
  v_messages jsonb;
  v_total_messages bigint;
  v_delivered_ids jsonb;
  v_limit int;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'Not authenticated';
  end if;

  if not public.is_conversation_participant(p_conversation_id, p_user_id) then
    raise exception 'Conversation not found';
  end if;

  v_limit := greatest(coalesce(p_message_limit, 30), 1);

  select l.title
  into v_listing_title
  from public.conversations c
  left join public.listings l on l.id = c.listing_id
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

  select count(*)
  into v_total_messages
  from public.messages m
  where m.conversation_id = p_conversation_id;

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
  join public.messages m on m.id = mr.message_id
  where mr.user_id = v_other_user.id
    and m.conversation_id = p_conversation_id;

  return jsonb_build_object(
    'other_user', jsonb_build_object(
      'id', v_other_user.id,
      'display_name', v_other_user.display_name,
      'avatar_url', v_other_user.avatar_url,
      'preferred_lang', v_other_user.preferred_lang
    ),
    'listing_title', v_listing_title,
    'messages', v_messages,
    'has_more_messages', v_total_messages > v_limit,
    'recipient_last_read_at', v_recipient_last_read,
    'delivered_message_ids', v_delivered_ids
  );
end;
$$;

grant execute on function public.get_thread_snapshot(uuid, uuid, int) to authenticated;
