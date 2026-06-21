-- Listing photo gallery: each row belongs to exactly one listing.

create table public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null check (char_length(url) between 8 and 2048),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (listing_id, sort_order)
);

create index listing_media_listing_id_sort_idx
  on public.listing_media (listing_id, sort_order, created_at);

alter table public.listing_media enable row level security;

create policy "Anyone can view media for active listings"
  on public.listing_media for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.seller_id = (select auth.uid()))
    )
  );

create policy "Sellers can insert own listing media"
  on public.listing_media for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can update own listing media"
  on public.listing_media for update
  to authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = (select auth.uid())
    )
  );

create policy "Sellers can delete own listing media"
  on public.listing_media for delete
  to authenticated
  using (
    exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.seller_id = (select auth.uid())
    )
  );

-- Keep legacy image_url in sync as cover photo (sort_order 0) when present.
insert into public.listing_media (listing_id, url, sort_order)
select l.id, l.image_url, 0
from public.listings l
where l.image_url is not null
  and char_length(l.image_url) > 0
on conflict (listing_id, sort_order) do update
  set url = excluded.url;
