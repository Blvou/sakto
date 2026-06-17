-- Allow anonymous browsing of active marketplace catalog (home/search on web without sign-in).

create policy "Anyone can view active listings"
  on public.listings for select
  to anon
  using (status = 'active');

create policy "Anyone can view active vehicles"
  on public.vehicles for select
  to anon
  using (status = 'active');

create policy "Anyone can view photos for active vehicles"
  on public.vehicle_photos for select
  to anon
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.status = 'active'
    )
  );
