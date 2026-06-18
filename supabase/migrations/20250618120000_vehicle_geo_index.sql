-- Spatial index for active vehicles with coordinates (map browse / nearby queries).
create index if not exists vehicles_active_geo_idx
  on public.vehicles (lat, lng)
  where status = 'active' and lat is not null and lng is not null;
