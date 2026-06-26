-- Marketplace discovery: view counts with dedupe + filter indexes

alter table public.listings
  add column if not exists view_count integer not null default 0 check (view_count >= 0);

create index if not exists listings_active_category_price_idx
  on public.listings (status, category, price)
  where status = 'active';

create index if not exists listings_active_view_count_idx
  on public.listings (status, view_count desc, id desc)
  where status = 'active';

-- One row per viewer per listing per 24h window
create table public.listing_view_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  viewer_key text not null,
  viewed_at timestamptz not null default now()
);

create index listing_view_events_listing_viewer_idx
  on public.listing_view_events (listing_id, viewer_key, viewed_at desc);

alter table public.listing_view_events enable row level security;

-- Inserts only via RPC; no direct client writes
create policy "No direct select on view events"
  on public.listing_view_events for select
  to authenticated, anon
  using (false);

create policy "No direct insert on view events"
  on public.listing_view_events for insert
  to authenticated, anon
  with check (false);

create or replace function public.increment_listing_view(
  p_listing_id uuid,
  p_viewer_key text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_key text;
begin
  v_key := nullif(trim(p_viewer_key), '');
  if v_key is null then
    return 0;
  end if;

  if not exists (
    select 1 from public.listings
    where id = p_listing_id and status = 'active'
  ) then
    return 0;
  end if;

  if exists (
    select 1
    from public.listing_view_events e
    where e.listing_id = p_listing_id
      and e.viewer_key = v_key
      and e.viewed_at > now() - interval '24 hours'
  ) then
    select view_count into v_count from public.listings where id = p_listing_id;
    return coalesce(v_count, 0);
  end if;

  insert into public.listing_view_events (listing_id, viewer_key)
  values (p_listing_id, v_key);

  update public.listings
  set view_count = view_count + 1
  where id = p_listing_id
  returning view_count into v_count;

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.increment_listing_view(uuid, text) to anon, authenticated;
