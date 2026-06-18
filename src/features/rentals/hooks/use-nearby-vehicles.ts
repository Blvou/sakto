import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import { haversineDistanceKm, hasValidCoordinates, type MapCoordinates } from '@/src/lib/maps';
import { fetchVehiclesPage, mockVehicleCards } from '../api/vehicles';
import type { VehicleCardItem } from '../types';
import { rentalQueryKeys } from '../types';

const DEFAULT_RADIUS_KM = 10;

interface UseNearbyVehiclesOptions {
  userCoords: MapCoordinates;
  radiusKm?: number;
  enabled?: boolean;
}

function filterByRadius(items: VehicleCardItem[], userCoords: MapCoordinates, radiusKm: number) {
  return items.filter((item) => {
    if (!hasValidCoordinates(item)) return false;
    return (
      haversineDistanceKm(userCoords, { latitude: item.lat, longitude: item.lng }) <= radiusKm
    );
  });
}

export function useNearbyVehicles({
  userCoords,
  radiusKm = DEFAULT_RADIUS_KM,
  enabled = true,
}: UseNearbyVehiclesOptions) {
  const useMock = shouldUseCatalogMock();

  const query = useQuery({
    queryKey: [
      ...rentalQueryKeys.vehicleList({
        near: { lat: userCoords.latitude, lng: userCoords.longitude, radiusKm },
      }),
      useMock ? 'mock' : 'live',
    ] as const,
    queryFn: async () => {
      if (useMock) {
        return filterByRadius(mockVehicleCards(userCoords), userCoords, radiusKm);
      }

      const page = await fetchVehiclesPage(
        {
          near: {
            lat: userCoords.latitude,
            lng: userCoords.longitude,
            radiusKm,
          },
          limit: 100,
        },
        undefined,
        { userCoords }
      );

      return page.items;
    },
    enabled,
    staleTime: 60_000,
    retry: useMock ? false : 2,
  });

  const vehicles = useMemo(() => query.data ?? [], [query.data]);

  return {
    ...query,
    vehicles,
  };
}
