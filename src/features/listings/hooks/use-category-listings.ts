import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import { fetchListingsPage, mockToCardItems } from '../api/listings';
import { listingQueryKeys, type ListingsPage, type ListingsPageCursor } from '../types';
import { flattenListings } from '../utils/listings-cache';

function filterMockByCategory(category: string | null | undefined) {
  const items = mockToCardItems();
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

export function useCategoryListings(category: string | null | undefined) {
  const useMock = shouldUseCatalogMock();
  const categoryKey = category ?? 'all';

  const mockPage: ListingsPage = useMemo(
    () => ({
      items: filterMockByCategory(category),
      nextCursor: undefined,
    }),
    [category]
  );

  const query = useInfiniteQuery({
    queryKey: [...listingQueryKeys.list, 'category', categoryKey, useMock ? 'mock' : 'live'] as const,
    queryFn: async ({ pageParam }) => {
      if (useMock) return mockPage;
      try {
        return await fetchListingsPage(pageParam, undefined, category ?? null);
      } catch {
        return mockPage;
      }
    },
    initialPageParam: undefined as ListingsPageCursor | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60_000,
    retry: useMock ? false : 2,
  });

  const listings = useMemo(() => flattenListings(query.data), [query.data]);

  return {
    ...query,
    listings,
  };
}
