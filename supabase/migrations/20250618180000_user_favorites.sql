-- User-saved marketplace listings (heart / favorites).
create table public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index user_favorites_user_created_idx
  on public.user_favorites (user_id, created_at desc);

create index user_favorites_listing_id_idx
  on public.user_favorites (listing_id);

alter table public.user_favorites enable row level security;

create policy "Users read own favorites"
  on public.user_favorites for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users insert own favorites"
  on public.user_favorites for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users delete own favorites"
  on public.user_favorites for delete
  to authenticated
  using (user_id = (select auth.uid()));
