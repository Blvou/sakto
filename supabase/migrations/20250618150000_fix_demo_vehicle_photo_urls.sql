-- Replace broken Wikimedia thumbnail URLs with stable GitHub raw assets.

update public.vehicle_photos
set storage_path = 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s1.png'
where vehicle_id in (
  'b0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000004'
);

update public.vehicle_photos
set storage_path = 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s2.png'
where vehicle_id in (
  'b0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000005'
);

update public.vehicle_photos
set storage_path = 'https://raw.githubusercontent.com/Blvou/sakto/main/assets/scooters/s3.png'
where vehicle_id in (
  'b0000000-0000-4000-8000-000000000003',
  'b0000000-0000-4000-8000-000000000006'
);
