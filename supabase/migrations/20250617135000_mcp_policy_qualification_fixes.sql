-- Fix ambiguous RLS predicates detected during MCP verification.

drop policy if exists "Renters can create own booking requests" on public.bookings;
create policy "Renters can create own booking requests"
  on public.bookings for insert
  to authenticated
  with check (
    renter_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles v
      where v.id = bookings.vehicle_id
        and v.owner_id = bookings.owner_id
        and v.owner_id <> (select auth.uid())
        and v.status = 'active'
    )
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
