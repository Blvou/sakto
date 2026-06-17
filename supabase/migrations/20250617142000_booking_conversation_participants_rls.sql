-- Allow booking renter/owner to add the other party when opening booking chat.

drop policy if exists "Users can insert participants for own conversations" on public.conversation_participants;

create policy "Users can insert participants for own conversations"
  on public.conversation_participants for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.conversations c
      join public.listings l on l.id = c.listing_id
      where c.id = conversation_id
        and c.buyer_id = (select auth.uid())
        and l.seller_id = user_id
    )
    or exists (
      select 1
      from public.conversations c
      join public.bookings b on b.id = c.booking_id
      where c.id = conversation_id
        and (select auth.uid()) in (b.renter_id, b.owner_id)
        and user_id in (b.renter_id, b.owner_id)
    )
  );
