-- Single round-trip to open or create a buyer↔listing conversation (replaces 2–4 client requests).

create or replace function public.get_or_create_conversation(
  p_listing_id uuid,
  p_buyer_id uuid
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_listing_title text;
  v_listing_image_url text;
  v_conversation_id uuid;
  v_other_user public.profiles%rowtype;
begin
  if auth.uid() is distinct from p_buyer_id then
    raise exception 'Not authenticated';
  end if;

  select l.seller_id, l.title, l.image_url
  into v_seller_id, v_listing_title, v_listing_image_url
  from public.listings l
  where l.id = p_listing_id;

  if v_seller_id is null then
    raise exception 'Listing not found. It may have been removed.';
  end if;

  if v_seller_id = p_buyer_id then
    raise exception 'This is your listing. Use a buyer account to start a chat.';
  end if;

  select c.id
  into v_conversation_id
  from public.conversations c
  where c.listing_id = p_listing_id
    and c.buyer_id = p_buyer_id;

  if v_conversation_id is null then
    insert into public.conversations (listing_id, buyer_id)
    values (p_listing_id, p_buyer_id)
    returning id into v_conversation_id;

    insert into public.conversation_participants (conversation_id, user_id)
    values
      (v_conversation_id, p_buyer_id),
      (v_conversation_id, v_seller_id);
  end if;

  select *
  into v_other_user
  from public.profiles
  where id = v_seller_id;

  return jsonb_build_object(
    'id', v_conversation_id,
    'listing_id', p_listing_id,
    'listing_title', v_listing_title,
    'listing_image_url', v_listing_image_url,
    'other_user', jsonb_build_object(
      'id', v_other_user.id,
      'display_name', v_other_user.display_name,
      'avatar_url', v_other_user.avatar_url,
      'preferred_lang', v_other_user.preferred_lang
    )
  );
end;
$$;

grant execute on function public.get_or_create_conversation(uuid, uuid) to authenticated;
