-- Per-user in-app notifications (counterparty booking alerts; push is a follow-up).
create table public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  booking_id uuid references public.bookings (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;

create policy "Users read own notifications"
  on public.user_notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users update own notifications"
  on public.user_notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Booking actor may insert a notification for the other party on that booking.
create policy "Booking parties can notify counterparty"
  on public.user_notifications for insert
  to authenticated
  with check (
    booking_id is not null
    and exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and (
          (b.renter_id = (select auth.uid()) and user_id = b.owner_id)
          or (b.owner_id = (select auth.uid()) and user_id = b.renter_id)
        )
    )
  );
