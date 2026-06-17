-- Seed demo listings for the earliest registered profile (seller).
-- Apply after at least one user has signed up, or re-run this migration.
do $$
declare
  seller uuid;
begin
  select id into seller from public.profiles order by created_at asc limit 1;

  if seller is null then
    raise notice 'Skipping seed: no profiles found. Sign up first, then re-run this migration.';
    return;
  end if;

  insert into public.listings (id, seller_id, title, price, location) values
    ('a0000000-0000-4000-8000-000000000001', seller, 'iPhone 13 Pro 128GB — Space Gray', 25000, 'Makati'),
    ('a0000000-0000-4000-8000-000000000002', seller, 'Nike Air Max 90 — Size 42', 3500, 'Quezon City'),
    ('a0000000-0000-4000-8000-000000000003', seller, 'IKEA Kallax Shelf — White', 4500, 'Pasig'),
    ('a0000000-0000-4000-8000-000000000004', seller, 'PS5 DualSense Controller', 2200, 'Manila'),
    ('a0000000-0000-4000-8000-000000000005', seller, 'Samsung Galaxy A54 5G', 12000, 'Taguig'),
    ('a0000000-0000-4000-8000-000000000006', seller, 'Vintage Denim Jacket — M', 800, 'Cebu City')
  on conflict (id) do nothing;
end $$;
