-- Rental availability: DB-level overlap enforcement and blocked-date lookup.

create or replace function public.assert_vehicle_dates_available(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date,
  p_exclude_booking_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('pending', 'confirmed')
      and (p_exclude_booking_id is null or b.id <> p_exclude_booking_id)
      and b.start_date <= p_end_date
      and b.end_date >= p_start_date
  ) then
    raise exception 'This bike already has a request for those dates';
  end if;

  if exists (
    select 1
    from public.vehicle_availability_blocks vab
    where vab.vehicle_id = p_vehicle_id
      and (p_exclude_booking_id is null or vab.booking_id is distinct from p_exclude_booking_id)
      and vab.start_date <= p_end_date
      and vab.end_date >= p_start_date
  ) then
    raise exception 'These dates are not available';
  end if;
end;
$$;

create or replace function public.bookings_assert_dates_available()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status in ('declined', 'cancelled', 'completed') then
    return new;
  end if;

  if tg_op = 'INSERT'
    or new.start_date is distinct from old.start_date
    or new.end_date is distinct from old.end_date
    or new.status is distinct from old.status
  then
    perform public.assert_vehicle_dates_available(
      new.vehicle_id,
      new.start_date,
      new.end_date,
      case when tg_op = 'UPDATE' then new.id else null end
    );
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_assert_dates_available on public.bookings;

create trigger bookings_assert_dates_available
  before insert or update on public.bookings
  for each row execute function public.bookings_assert_dates_available();

create or replace function public.sync_booking_availability_block()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    if new.status = 'confirmed' then
      insert into public.vehicle_availability_blocks (
        vehicle_id,
        start_date,
        end_date,
        reason,
        booking_id
      )
      values (new.vehicle_id, new.start_date, new.end_date, 'booking', new.id);
    elsif old.status = 'confirmed' and new.status in ('cancelled', 'declined', 'completed') then
      delete from public.vehicle_availability_blocks
      where booking_id = new.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_booking_availability_block on public.bookings;

create trigger sync_booking_availability_block
  after update on public.bookings
  for each row execute function public.sync_booking_availability_block();

create or replace function public.get_vehicle_blocked_dates(
  p_vehicle_id uuid,
  p_from date,
  p_to date
)
returns date[]
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(array_agg(distinct blocked.day order by blocked.day), '{}')
  from (
    select generate_series(
      greatest(b.start_date, p_from),
      least(b.end_date, p_to),
      interval '1 day'
    )::date as day
    from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('pending', 'confirmed')
      and b.start_date <= p_to
      and b.end_date >= p_from
    union
    select generate_series(
      greatest(vab.start_date, p_from),
      least(vab.end_date, p_to),
      interval '1 day'
    )::date as day
    from public.vehicle_availability_blocks vab
    where vab.vehicle_id = p_vehicle_id
      and vab.start_date <= p_to
      and vab.end_date >= p_from
  ) blocked;
$$;

grant execute on function public.assert_vehicle_dates_available(uuid, date, date, uuid) to authenticated;
grant execute on function public.get_vehicle_blocked_dates(uuid, date, date) to authenticated;
