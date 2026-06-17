drop policy if exists "Authenticated users can view public profiles" on public.profiles;
create policy "Authenticated users can view public profiles"
  on public.profiles for select
  to authenticated
  using (true);
