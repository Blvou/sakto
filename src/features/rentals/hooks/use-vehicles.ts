import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { fetchVehicleById, fetchVehiclesPage, mockVehicleCards } from '../api/vehicles';
import type { VehicleSearchParams, VehiclesPage, VehiclesPageCursor } from '../types';
import { rentalQueryKeys } from '../types';

const MOCK_PAGE: VehiclesPage = {
  items: mockVehicleCards(),
  nextCursor: undefined,
};

function mockInitialData() {
  return {
    pages: [MOCK_PAGE],
    pageParams: [undefined] as (VehiclesPageCursor | undefined)[],
  };
}

export function useInfiniteVehicles(params?: VehicleSearchParams) {
  const useMock = shouldUseCatalogMock();

  return useInfiniteQuery({
    queryKey: [...rentalQueryKeys.vehicleList(params), useMock ? 'mock' : 'live'] as const,
    queryFn: async ({ pageParam }) => {
      if (useMock) return MOCK_PAGE;
      try {
        return await fetchVehiclesPage(params, pageParam);
      } catch {
        return MOCK_PAGE;
      }
    },
    initialPageParam: undefined as VehiclesPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: useMock ? mockInitialData() : undefined,
    staleTime: 5 * 60_000,
    retry: useMock ? false : 2,
  });
}

export function useVehicles(params?: VehicleSearchParams) {
  const query = useInfiniteVehicles(params);
  const vehicles = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

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
