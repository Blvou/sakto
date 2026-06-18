-- Seed demo rental vehicles for the earliest profile (demo host).
-- Demo photos use public Wikimedia URLs in storage_path (see getVehiclePhotoSource).

do $$
declare
  seller uuid;
begin
  select id into seller from public.profiles order by created_at asc limit 1;

  if seller is null then
    raise notice 'Skipping vehicle seed: no profiles found.';
    return;
  end if;

  insert into public.vehicles (
    id,
    owner_id,
    title,
    description,
    brand,
    model,
    year,
    price_per_day,
    location,
    city,
    lat,
    lng,
    instant_booking,
    status
  ) values
    (
      'b0000000-0000-4000-8000-000000000001',
      seller,
      'Honda Beat 2022',
      'Well-maintained Honda Beat for daily city rides around Manila. Helmet included on request.',
      'Honda',
      'Beat',
      2022,
      350,
      'Ermita, Manila',
      'Manila',
      14.5784,
      120.9832,
      true,
      'active'
    ),
    (
      'b0000000-0000-4000-8000-000000000002',
      seller,
      'Yamaha Mio i125',
      'Fuel-efficient Yamaha Mio for short commutes and errands in Metro Manila.',
      'Yamaha',
      'Mio i125',
      2021,
      300,
      'Malate, Manila',
      'Manila',
      14.5635,
      120.9985,
      true,
      'active'
    ),
    (
      'b0000000-0000-4000-8000-000000000003',
      seller,
      'Honda Click 160',
      'Comfortable Honda Click with enough power for longer rides. Great for tourists and locals.',
      'Honda',
      'Click 160',
      2023,
      400,
      'Makati, Metro Manila',
      'Makati',
      14.5547,
      121.0244,
      false,
      'active'
    ),
    (
      'b0000000-0000-4000-8000-000000000004',
      seller,
      'Suzuki Smash 115',
      'Budget-friendly manual scooter — ideal for students and quick errands around BGC.',
      'Suzuki',
      'Smash 115',
      2020,
      280,
      'BGC, Taguig',
      'Taguig',
      14.5515,
      121.0470,
      true,
      'active'
    ),
    (
      'b0000000-0000-4000-8000-000000000005',
      seller,
      'Honda PCX 160 Electric',
      'Quiet electric scooter for eco-friendly rides. Charger adapter included.',
      'Honda',
      'PCX Electric',
      2024,
      550,
      'Quezon City',
      'Quezon City',
      14.6760,
      121.0437,
      false,
      'active'
    ),
    (
      'b0000000-0000-4000-8000-000000000006',
      seller,
      'Yamaha NMAX 155',
      'Premium maxi-scooter with storage under seat. Popular for airport and mall runs.',
      'Yamaha',
      'NMAX 155',
      2023,
      500,
      'Pasay, Metro Manila',
      'Pasay',
      14.5378,
      120.9986,
      true,
      'active'
    )
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    title = excluded.title,
    description = excluded.description,
    brand = excluded.brand,
    model = excluded.model,
    year = excluded.year,
    price_per_day = excluded.price_per_day,
    location = excluded.location,
    city = excluded.city,
    lat = excluded.lat,
    lng = excluded.lng,
    instant_booking = excluded.instant_booking,
    status = excluded.status,
    updated_at = now();

  delete from public.vehicle_photos
  where vehicle_id in (
    'b0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000005',
    'b0000000-0000-4000-8000-000000000006'
  );

  insert into public.vehicle_photos (vehicle_id, storage_path, sort_order) values
    ('b0000000-0000-4000-8000-000000000001', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Honda_Beat_%28Indonesia%29%2C_South_Jakarta.jpg/640px-Honda_Beat_%28Indonesia%29%2C_South_Jakarta.jpg', 0),
    ('b0000000-0000-4000-8000-000000000002', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Yamaha_Mio_M3_Azerbaijan.jpg/640px-Yamaha_Mio_M3_Azerbaijan.jpg', 0),
    ('b0000000-0000-4000-8000-000000000003', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Honda_Click_160_%28Indonesia%29.jpg/640px-Honda_Click_160_%28Indonesia%29.jpg', 0),
    ('b0000000-0000-4000-8000-000000000004', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Honda_Beat_%28Indonesia%29%2C_South_Jakarta.jpg/640px-Honda_Beat_%28Indonesia%29%2C_South_Jakarta.jpg', 0),
    ('b0000000-0000-4000-8000-000000000005', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Yamaha_Mio_M3_Azerbaijan.jpg/640px-Yamaha_Mio_M3_Azerbaijan.jpg', 0),
    ('b0000000-0000-4000-8000-000000000006', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Honda_Click_160_%28Indonesia%29.jpg/640px-Honda_Click_160_%28Indonesia%29.jpg', 0);
end $$;
