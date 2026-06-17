-- Extend listings for marketplace + chat integration

alter table public.listings
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists status text not null default 'active'
    check (status in ('active', 'sold', 'archived'));

create index if not exists listings_created_at_idx
  on public.listings (created_at desc);

create index if not exists listings_status_created_at_idx
  on public.listings (status, created_at desc);
