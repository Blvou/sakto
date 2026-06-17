import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import { fetchListingsPage, mockToCardItems } from '../api/listings';
import { listingQueryKeys, type ListingsPage, type ListingsPageCursor } from '../types';
import { flattenListings } from '../utils/listings-cache';

const MOCK_PAGE: ListingsPage = {
  items: mockToCardItems(),
  nextCursor: undefined,
};

const MOCK_INITIAL_DATA = {
  pages: [MOCK_PAGE],
  pageParams: [undefined] as (ListingsPageCursor | undefined)[],
};

export function useInfiniteListings() {
  const useMock = shouldUseCatalogMock();

  return useInfiniteQuery({
    queryKey: [...listingQueryKeys.list, useMock ? 'mock' : 'live'] as const,
    queryFn: async ({ pageParam }) => {
      if (useMock) return MOCK_PAGE;
      try {
        return await fetchListingsPage(pageParam);
      } catch {
        return MOCK_PAGE;
      }
    },
    initialPageParam: undefined as ListingsPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: useMock ? MOCK_INITIAL_DATA : undefined,
    staleTime: 5 * 60_000,
    retry: useMock ? false : 2,
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
