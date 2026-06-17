import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { listings as mockListings } from '@/src/features/home/data/mock-data';
import { fetchListingById } from '../api/listings';
import { listingQueryKeys } from '../types';
import { formatTimeAgo } from '../utils/format-time-ago';

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: listingQueryKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;

      if (!isSupabaseConfigured) {
        const mock = mockListings.find((l) => l.id === id);
        if (!mock) return null;
        return {
          id: mock.id,
          seller_id: '',
          title: mock.title,
          price: mock.price,
          image_url: null,
          location: mock.location,
          description:
            'Well-maintained item in excellent condition. No scratches or dents. Includes original box and accessories.',
          category: 'Electronics',
          status: 'active' as const,
          created_at: new Date().toISOString(),
          seller: {
            id: 'demo',
            display_name: 'Maria Santos',
            avatar_url: null,
          },
        };
      }

      return fetchListingById(id);
    },
    enabled: !!id,
  });
}

export { formatTimeAgo };
