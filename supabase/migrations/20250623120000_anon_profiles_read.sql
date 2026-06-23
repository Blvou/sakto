-- Allow anonymous users to see seller names on public listing detail pages.

create policy "Anyone can view public profiles"
  on public.profiles for select
  to anon
  using (true);
