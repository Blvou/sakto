import type { MapCoordinates } from '@/src/lib/maps';
import type { VehicleCardItem, VehicleSearchParams } from '../types';

export const VEHICLE_FILTER_OPTIONS = ['Nearby', 'Electric', 'Manual', 'By day', 'Popular'] as const;
export type VehicleFilterOption = (typeof VEHICLE_FILTER_OPTIONS)[number];

export const DEFAULT_VEHICLE_FILTER: VehicleFilterOption = 'Nearby';
export const NEARBY_RADIUS_KM = 25;

export const CATEGORY_FILTER_MAP = {
  nearby: 'Nearby',
  electric: 'Electric',
  manual: 'Manual',
  daily: 'By day',
  popular: 'Popular',
} as const satisfies Record<string, VehicleFilterOption>;

export type BrowseCategoryId = keyof typeof CATEGORY_FILTER_MAP;

export function categoryIdToFilter(categoryId: string): VehicleFilterOption | null {
  if (categoryId in CATEGORY_FILTER_MAP) {
    return CATEGORY_FILTER_MAP[categoryId as BrowseCategoryId];
  }
  return null;
}

export function filterToCategoryId(filter: VehicleFilterOption): BrowseCategoryId {
  const match = Object.entries(CATEGORY_FILTER_MAP).find(([, value]) => value === filter);
  return (match?.[0] as BrowseCategoryId | undefined) ?? 'nearby';
}

export function filterLabelToId(label: string): VehicleFilterOption {
  const match = VEHICLE_FILTER_OPTIONS.find((f) => f === label);
  return match ?? DEFAULT_VEHICLE_FILTER;
}

export function buildVehicleSearchParams(
  filter: VehicleFilterOption,
  query?: string,
  userCoords?: MapCoordinates | null
): VehicleSearchParams {
  const params: VehicleSearchParams = { query, filter };

  if (filter === 'Nearby' && userCoords) {
    params.near = {
      lat: userCoords.latitude,
      lng: userCoords.longitude,
      radiusKm: NEARBY_RADIUS_KM,
    };
  }

  if (filter === 'Electric') {
    params.query = [query, 'electric'].filter(Boolean).join(' ').trim() || 'electric';
  }

  if (filter === 'Manual') {
    params.query = [query, 'manual'].filter(Boolean).join(' ').trim() || 'manual';
  }

  return params;
}

export function sortVehiclesByFilter(
  vehicles: VehicleCardItem[],
  filter: VehicleFilterOption
): VehicleCardItem[] {
  const copy = [...vehicles];

  switch (filter) {
    case 'By day':
      return copy.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case 'Nearby':
      return copy.sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    case 'Electric':
    case 'Manual':
      return copy;
    case 'Popular':
    default:
      return copy.sort((a, b) => {
        const scoreA = (a.instant ? 2 : 0) + (a.reviewCount ?? 0) / 100;
        const scoreB = (b.instant ? 2 : 0) + (b.reviewCount ?? 0) / 100;
        return scoreB - scoreA;
      });
  }
}
