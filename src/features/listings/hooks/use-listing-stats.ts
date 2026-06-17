import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchListingStats } from '../api/listings';
import { listingQueryKeys } from '../types';

export function useListingStats() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: listingQueryKeys.stats(userId ?? ''),
    queryFn: () => {
      if (!userId) return { total: 0, sold: 0 };
      return fetchListingStats(userId);
    },
    enabled: !!userId && isSupabaseConfigured,
    staleTime: 60_000,
  });
}
