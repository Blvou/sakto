-- Security baseline for MVP rental launch.

drop policy if exists "Authenticated users can view public profile fields" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can view profiles in shared conversations" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can view profiles in shared conversations"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversation_participants cp1
      join public.conversation_participants cp2
        on cp1.conversation_id = cp2.conversation_id
      where cp1.user_id = (select auth.uid())
        and cp2.user_id = profiles.id
    )
  );

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
  );

drop policy if exists "Participants can update translations" on public.message_translations;

create policy "Participants can update translations"
  on public.message_translations for update
  to authenticated
  using (
    exists (
      select 1
      from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id, (select auth.uid()))
    )
  )
  with check (
    exists (
      select 1
      from public.messages m
      where m.id = message_id
        and public.is_conversation_participant(m.conversation_id, (select auth.uid()))
    )
  );

drop policy if exists "Anyone authenticated can view listings" on public.listings;
drop policy if exists "Authenticated users can view active listings" on public.listings;
drop policy if exists "Sellers can view own listings" on public.listings;

create policy "Authenticated users can view active listings"
  on public.listings for select
  to authenticated
  using (status = 'active');

create policy "Sellers can view own listings"
  on public.listings for select
  to authenticated
  using ((select auth.uid()) = seller_id);
