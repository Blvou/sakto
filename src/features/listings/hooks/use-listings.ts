import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { fetchListingsPage, mockToCardItems } from '../api/listings';
import { listingQueryKeys, type ListingsPage, type ListingsPageCursor } from '../types';
import { flattenListings } from '../utils/listings-cache';

const MOCK_PAGE: ListingsPage = {
  items: mockToCardItems(),
  nextCursor: undefined,
};

export function useInfiniteListings() {
  return useInfiniteQuery({
    queryKey: listingQueryKeys.list,
    queryFn: async ({ pageParam }) => {
      if (!isSupabaseConfigured) return MOCK_PAGE;
      return fetchListingsPage(pageParam);
    },
    initialPageParam: undefined as ListingsPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60_000,
  });
}

export function useListings() {
  const query = useInfiniteListings();
  const listings = useMemo(() => flattenListings(query.data), [query.data]);

  return {
    ...query,
    data: listings,
    listings,
  };
}
