import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { fetchVehicleById, fetchVehiclesPage, mockVehicleCards } from '../api/vehicles';
import type { VehicleSearchParams, VehiclesPage, VehiclesPageCursor } from '../types';
import { rentalQueryKeys } from '../types';

const MOCK_PAGE: VehiclesPage = {
  items: mockVehicleCards(),
  nextCursor: undefined,
};

export function useInfiniteVehicles(params?: VehicleSearchParams) {
  return useInfiniteQuery({
    queryKey: rentalQueryKeys.vehicleList(params),
    queryFn: async ({ pageParam }) => {
      if (!isSupabaseConfigured) return MOCK_PAGE;
      return fetchVehiclesPage(params, pageParam);
    },
    initialPageParam: undefined as VehiclesPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60_000,
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
