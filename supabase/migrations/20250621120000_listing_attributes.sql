-- Dynamic listing characteristics (Avito / eBay item specifics).

alter table public.listings
  add column if not exists attributes jsonb not null default '{}'::jsonb;

create index if not exists listings_attributes_gin_idx
  on public.listings using gin (attributes);

-- Backfill demo catalog with sample specs.
update public.listings
set attributes = case id
  when 'a0000000-0000-4000-8000-000000000001' then
    '{"condition":"Used — good","brand":"Apple","model":"iPhone 13 Pro","storage":"128 GB","color":"Space Gray"}'::jsonb
  when 'a0000000-0000-4000-8000-000000000002' then
    '{"condition":"Used — like new","brand":"Nike","model":"Air Max 90","size":"42","color":"White/Red"}'::jsonb
  when 'a0000000-0000-4000-8000-000000000003' then
    '{"condition":"Used — good","brand":"IKEA","model":"Kallax","dimensions":"77 x 77 cm","color":"White"}'::jsonb
  when 'a0000000-0000-4000-8000-000000000004' then
    '{"condition":"Used — good","brand":"Sony","model":"DualSense","platform":"PS5","color":"White"}'::jsonb
  when 'a0000000-0000-4000-8000-000000000005' then
    '{"condition":"Used — good","brand":"Samsung","model":"Galaxy A54 5G","storage":"128 GB","network":"5G"}'::jsonb
  when 'a0000000-0000-4000-8000-000000000006' then
    '{"condition":"Used — vintage","brand":"Levi''s","size":"M","material":"Denim","color":"Blue"}'::jsonb
  else attributes
end
where id in (
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000006'
);
