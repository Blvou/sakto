-- Rental MVP: vehicles, photos, availability blocks, and booking requests.

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  brand text not null check (char_length(brand) between 2 and 80),
  model text not null check (char_length(model) between 1 and 80),
  year integer check (year is null or (year between 1990 and extract(year from now())::integer + 1)),
  price_per_day numeric(12, 2) not null check (price_per_day > 0),
  location text not null check (char_length(location) between 2 and 120),
  city text check (city is null or char_length(city) between 2 and 80),
  lat numeric(9, 6),
  lng numeric(9, 6),
  instant_booking boolean not null default false,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_owner_id_idx on public.vehicles (owner_id);
create index vehicles_status_created_at_idx on public.vehicles (status, created_at desc, id desc);
create index vehicles_city_status_idx on public.vehicles (city, status);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (vehicle_id, storage_path)
);

create index vehicle_photos_vehicle_id_sort_idx
  on public.vehicle_photos (vehicle_id, sort_order, created_at);

create table public.vehicle_availability_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'owner_block' check (reason in ('owner_block', 'booking')),
  booking_id uuid,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index vehicle_availability_vehicle_dates_idx
  on public.vehicle_availability_blocks (vehicle_id, start_date, end_date);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  days integer not null check (days > 0),
  price_per_day numeric(12, 2) not null check (price_per_day > 0),
  service_fee numeric(12, 2) not null default 0 check (service_fee >= 0),
  total_amount numeric(12, 2) not null check (total_amount > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  message text check (message is null or char_length(message) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (renter_id <> owner_id)
);

create index bookings_renter_created_at_idx on public.bookings (renter_id, created_at desc);
create index bookings_owner_created_at_idx on public.bookings (owner_id, created_at desc);
create index bookings_vehicle_dates_idx on public.bookings (vehicle_id, start_date, end_date);
create index bookings_status_idx on public.bookings (status);

alter table public.vehicle_availability_blocks
  add constraint vehicle_availability_blocks_booking_id_fkey
  foreign key (booking_id) references public.bookings (id) on delete cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_availability_blocks enable row level security;
alter table public.bookings enable row level security;

create policy "Authenticated users can view active vehicles"
  on public.vehicles for select
  to authenticated
  using (status = 'active' or owner_id = (select auth.uid()));

create policy "Owners can insert own vehicles"
  on public.vehicles for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners can update own vehicles"
  on public.vehicles for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Users can view active vehicle photos"
  on public.vehicle_photos for select
  to authenticated
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and (v.status = 'active' or v.owner_id = (select auth.uid()))
    )
  );

create policy "Owners can manage own vehicle photos"
  on public.vehicle_photos for all
  to authenticated
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

create policy "Owners can manage own availability"
  on public.vehicle_availability_blocks for all
  to authenticated
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

create policy "Renters can view availability for active vehicles"
  on public.vehicle_availability_blocks for select
  to authenticated
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id and v.status = 'active'
    )
  );

create policy "Booking parties can view bookings"
  on public.bookings for select
  to authenticated
  using (renter_id = (select auth.uid()) or owner_id = (select auth.uid()));

create policy "Renters can create own booking requests"
  on public.bookings for insert
  to authenticated
  with check (
    renter_id = (select auth.uid())
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.owner_id = owner_id
        and v.owner_id <> (select auth.uid())
        and v.status = 'active'
    )
  );

create policy "Owners can update booking status"
  on public.bookings for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Renters can cancel own bookings"
  on public.bookings for update
  to authenticated
  using (renter_id = (select auth.uid()) and status in ('pending', 'confirmed'))
  with check (renter_id = (select auth.uid()) and status = 'cancelled');

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can read vehicle photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vehicle-photos');

create policy "Owners can upload vehicle photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can update vehicle photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners can delete vehicle photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
