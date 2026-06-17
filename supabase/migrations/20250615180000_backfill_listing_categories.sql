-- Backfill demo listing categories for browse/search screens

update public.listings
set category = 'electronics'
where id = 'a0000000-0000-4000-8000-000000000001';

update public.listings
set category = 'clothing'
where id = 'a0000000-0000-4000-8000-000000000002';

update public.listings
set category = 'home'
where id = 'a0000000-0000-4000-8000-000000000003';

update public.listings
set category = 'games'
where id = 'a0000000-0000-4000-8000-000000000004';

update public.listings
set category = 'electronics'
where id = 'a0000000-0000-4000-8000-000000000005';

update public.listings
set category = 'clothing'
where id = 'a0000000-0000-4000-8000-000000000006';

create index if not exists listings_category_status_created_at_idx
  on public.listings (category, status, created_at desc)
  where status = 'active';
