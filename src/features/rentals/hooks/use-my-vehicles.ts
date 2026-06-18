import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { fetchMyVehicles, mockVehicleCards } from '../api/vehicles';
import { rentalQueryKeys } from '../types';

export function useMyVehicles() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: rentalQueryKeys.myVehicles(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      if (!isSupabaseConfigured) return mockVehicleCards().slice(0, 1);
      return fetchMyVehicles(userId);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
