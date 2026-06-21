import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { resolveListingCategoryId } from '@/src/features/listings/constants/categories';
import { DEMO_LISTING_ATTRIBUTES } from '@/src/features/listings/constants/demo-attributes';
import { DEMO_LISTINGS } from '../api/listings';
import { fetchListingById } from '../api/listings';
import { listingQueryKeys } from '../types';
import { formatTimeAgo } from '../utils/format-time-ago';

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: listingQueryKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;

      if (!isSupabaseConfigured) {
        const mock = DEMO_LISTINGS.find((listing) => listing.id === id);
        if (!mock) return null;
        return {
          id: mock.id,
          seller_id: '',
          title: mock.title,
          price: mock.price,
          image_url: null,
          location: mock.location,
          description:
            'Well-maintained item in excellent condition. No scratches or dents. Includes original box and accessories. Meet-up in a public place preferred.',
          category: resolveListingCategoryId(mock.id, null),
          attributes: DEMO_LISTING_ATTRIBUTES[mock.id] ?? {},
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
