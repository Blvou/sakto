-- User reports for marketplace listings (moderation handled outside MVP).

create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('spam', 'fraud', 'prohibited', 'wrong_category', 'other')),
  details text check (details is null or char_length(details) <= 500),
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

create index listing_reports_listing_id_idx on public.listing_reports (listing_id);
create index listing_reports_reporter_id_idx on public.listing_reports (reporter_id, created_at desc);

alter table public.listing_reports enable row level security;

create policy "Users read own listing reports"
  on public.listing_reports for select
  to authenticated
  using (reporter_id = (select auth.uid()));

create policy "Users insert own listing reports"
  on public.listing_reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and reporter_id <> (
      select l.seller_id
      from public.listings l
      where l.id = listing_id
    )
  );
