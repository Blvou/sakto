import { DEMO_VEHICLE_IMAGES, DEMO_VEHICLES } from '../data/demo-vehicles';
import {
  boundingBox,
  haversineDistanceKm,
  hasValidCoordinates,
  sortByDistance,
  type MapCoordinates,
} from '@/src/lib/maps';
import { supabase } from '@/src/lib/supabase';
import type { CreateVehicleInput } from '../schemas';
import type {
  VehicleCardItem,
  VehicleDetail,
  VehiclePhotoRow,
  VehicleRow,
  VehiclesPage,
  VehiclesPageCursor,
  VehicleSearchParams,
} from '../types';
import { VEHICLES_PAGE_SIZE } from '../types';

type VehicleCardRow = Pick<
  VehicleRow,
  | 'id'
  | 'title'
  | 'model'
  | 'price_per_day'
  | 'location'
  | 'lat'
  | 'lng'
  | 'instant_booking'
  | 'created_at'
> & {
  photos: Pick<VehiclePhotoRow, 'storage_path' | 'sort_order'>[];
};

interface MapVehicleCardOptions {
  userCoords?: MapCoordinates | null;
}

type VehicleDetailRow = VehicleRow & {
  photos: VehiclePhotoRow[];
  owner: { id: string; display_name: string; avatar_url: string | null };
};

const fallbackVehicleImage = require('../../../../assets/scooters/s1.png');

function getVehiclePhotoSource(path?: string | null) {
  if (!path) return fallbackVehicleImage;
  if (path.startsWith('https://') || path.startsWith('http://')) {
    return { uri: path };
  }
  const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
  return { uri: data.publicUrl };
}

function mapVehicleCard(row: VehicleCardRow, options?: MapVehicleCardOptions): VehicleCardItem {
  const cover = [...row.photos].sort((a, b) => a.sort_order - b.sort_order)[0];
  const distanceKm =
    options?.userCoords && hasValidCoordinates(row)
      ? Math.round(
          haversineDistanceKm(options.userCoords, {
            latitude: row.lat,
            longitude: row.lng,
          }) * 10
        ) / 10
      : null;

  return {
    id: row.id,
    title: row.title,
    model: row.model,
    pricePerDay: Number(row.price_per_day),
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    distanceKm,
    image: getVehiclePhotoSource(cover?.storage_path),
    instant: row.instant_booking,
    rating: null,
    reviewCount: 0,
  };
}

export function mockVehicleCards(userCoords?: MapCoordinates | null): VehicleCardItem[] {
  return DEMO_VEHICLES.map((vehicle) => {
    const distanceKm = userCoords
      ? Math.round(
          haversineDistanceKm(userCoords, { latitude: vehicle.lat, longitude: vehicle.lng }) * 10
        ) / 10
      : vehicle.distanceKm;

    return {
      id: vehicle.mockId,
      title: vehicle.title,
      model: vehicle.model,
      pricePerDay: vehicle.pricePerDay,
      location: vehicle.location,
      lat: vehicle.lat,
      lng: vehicle.lng,
      distanceKm,
      image: DEMO_VEHICLE_IMAGES[vehicle.imageKey],
      instant: vehicle.instant,
      rating: vehicle.rating,
      reviewCount: vehicle.reviewCount,
    };
  });
}

export async function fetchVehiclesPage(
  params?: VehicleSearchParams,
  cursor?: VehiclesPageCursor,
  options?: MapVehicleCardOptions
): Promise<VehiclesPage> {
  const limit = params?.limit ?? VEHICLES_PAGE_SIZE;
  const userCoords = options?.userCoords ?? null;

  let query = supabase
    .from('vehicles')
    .select(
      `
      id,
      title,
      model,
      price_per_day,
      location,
      lat,
      lng,
      instant_booking,
      created_at,
      photos:vehicle_photos ( storage_path, sort_order )
    `
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit);

  const normalizedQuery = params?.query?.trim();
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    query = query.or(`title.ilike.${pattern},model.ilike.${pattern},location.ilike.${pattern}`);
  }

  if (params?.city) {
    query = query.ilike('city', params.city);
  }

  if (params?.near) {
    const box = boundingBox(params.near.lat, params.near.lng, params.near.radiusKm);
    query = query
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .gte('lat', box.minLat)
      .lte('lat', box.maxLat)
      .gte('lng', box.minLng)
      .lte('lng', box.maxLng);
  }

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as unknown as VehicleCardRow[];

  if (params?.near && userCoords) {
    rows = sortByDistance(rows, userCoords);
    rows = rows.filter((row) => {
      if (!hasValidCoordinates(row)) return false;
      return (
        haversineDistanceKm(userCoords, { latitude: row.lat, longitude: row.lng }) <=
        params.near!.radiusKm
      );
    });
  }

  const last = rows[rows.length - 1];

  return {
    items: rows.map((row) => mapVehicleCard(row, { userCoords })),
    nextCursor:
      rows.length === limit && last
        ? { created_at: last.created_at, id: last.id }
        : undefined,
  };
}

export async function fetchVehicleById(vehicleId: string): Promise<VehicleDetail | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(
      `
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
      status,
      created_at,
      updated_at,
      photos:vehicle_photos ( id, vehicle_id, storage_path, sort_order, created_at ),
      owner:profiles!owner_id ( id, display_name, avatar_url )
    `
    )
    .eq('id', vehicleId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as VehicleDetailRow;

  return {
    ...row,
    photos: [...row.photos].sort((a, b) => a.sort_order - b.sort_order),
    owner: row.owner,
  };
}

export async function createVehicle(ownerId: string, input: CreateVehicleInput): Promise<string> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      owner_id: ownerId,
      title: input.title,
      description: input.description,
      brand: input.brand,
      model: input.model,
      year: input.year ?? null,
      price_per_day: input.pricePerDay,
      location: input.location,
      city: input.city || null,
      lat: input.lat,
      lng: input.lng,
      instant_booking: input.instantBooking,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) throw error;

  if (input.photoPaths.length > 0) {
    const { error: photoError } = await supabase.from('vehicle_photos').insert(
      input.photoPaths.map((storagePath, index) => ({
        vehicle_id: data.id,
        storage_path: storagePath,
        sort_order: index,
      }))
    );

    if (photoError) throw photoError;
  }

  return data.id;
}

export async function fetchVehicleBlockedDates(
  vehicleId: string,
  from: string,
  to: string
): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_vehicle_blocked_dates', {
    p_vehicle_id: vehicleId,
    p_from: from,
    p_to: to,
  });

  if (error) throw error;
  return (data ?? []) as string[];
}

export async function fetchMyVehicles(ownerId: string): Promise<VehicleCardItem[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(
      `
      id,
      title,
      model,
      price_per_day,
      location,
      lat,
      lng,
      instant_booking,
      created_at,
      photos:vehicle_photos ( storage_path, sort_order )
    `
    )
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as VehicleCardRow[]).map((row) => mapVehicleCard(row));
}

export { getVehiclePhotoSource };
