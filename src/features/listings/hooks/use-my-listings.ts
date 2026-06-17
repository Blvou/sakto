import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchListingsBySeller } from '../api/listings';
import { listingQueryKeys } from '../types';

export function useMyListings() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: listingQueryKeys.mine(userId ?? ''),
    queryFn: () => {
      if (!userId) return [];
      return fetchListingsBySeller(userId);
    },
    enabled: !!userId && isSupabaseConfigured,
  });
}
