import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import type { MapCoordinates } from '@/src/lib/maps';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { fetchVehicleById, fetchVehiclesPage, mockVehicleCards } from '../api/vehicles';
import type { VehicleSearchParams, VehiclesPage, VehiclesPageCursor } from '../types';
import { rentalQueryKeys } from '../types';
import {
  DEFAULT_VEHICLE_FILTER,
  filterLabelToId,
  filterVehiclesByQuery,
  sortVehiclesByFilter,
  type VehicleFilterOption,
} from '../utils/vehicle-filters';

const MOCK_PAGE: VehiclesPage = {
  items: mockVehicleCards(),
  nextCursor: undefined,
};

function mockInitialData(userCoords?: MapCoordinates | null) {
  return {
    pages: [{ items: mockVehicleCards(userCoords), nextCursor: undefined }],
    pageParams: [undefined] as (VehiclesPageCursor | undefined)[],
  };
}

interface UseVehiclesOptions {
  userCoords?: MapCoordinates | null;
  filter?: VehicleFilterOption;
}

export function useInfiniteVehicles(params?: VehicleSearchParams, options?: UseVehiclesOptions) {
  const useMock = shouldUseCatalogMock();
  const userCoords = options?.userCoords ?? null;
  const filter = options?.filter ?? DEFAULT_VEHICLE_FILTER;

  return useInfiniteQuery({
    queryKey: [...rentalQueryKeys.vehicleList(params), useMock ? 'mock' : 'live', filter] as const,
    queryFn: async ({ pageParam }) => {
      if (useMock) {
        const filtered = filterVehiclesByQuery(mockVehicleCards(userCoords), params?.query);
        return {
          items: sortVehiclesByFilter(filtered, filter),
          nextCursor: undefined,
        };
      }
      const page = await fetchVehiclesPage(params, pageParam, { userCoords });
      return {
        items: sortVehiclesByFilter(page.items, filter),
        nextCursor: page.nextCursor,
      };
    },
    initialPageParam: undefined as VehiclesPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: useMock ? mockInitialData(userCoords) : undefined,
    staleTime: 5 * 60_000,
    retry: useMock ? false : 2,
  });
}

export function useVehicles(params?: VehicleSearchParams, options?: UseVehiclesOptions) {
  const query = useInfiniteVehicles(params, options);
  const filter = options?.filter ?? DEFAULT_VEHICLE_FILTER;
  const vehicles = useMemo(() => {
    const flat = query.data?.pages.flatMap((page) => page.items) ?? [];
    return sortVehiclesByFilter(flat, filter);
  }, [query.data, filter]);

  return {
    ...query,
    data: vehicles,
    vehicles,
  };
}

export function useVehicle(vehicleId: string) {
  return useQuery({
    queryKey: rentalQueryKeys.vehicleDetail(vehicleId),
    queryFn: () => fetchVehicleById(vehicleId),
    enabled: isSupabaseConfigured && !!vehicleId && !vehicleId.startsWith('s'),
    staleTime: 5 * 60_000,
  });
}
