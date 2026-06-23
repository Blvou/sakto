import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import { filterBrowseListings } from '@/src/features/search/utils/filter-listings';
import { fetchListingsPage, mockToCardItems } from '../api/listings';
import { listingQueryKeys, type ListingsPage, type ListingsPageCursor } from '../types';
import { flattenListings } from '../utils/listings-cache';

function filterMockListings(category: string | null | undefined, searchQuery?: string) {
  const items = mockToCardItems();
  return filterBrowseListings(items, {
    categoryId: category ?? null,
    query: searchQuery,
  });
}

interface UseCategoryListingsOptions {
  searchQuery?: string;
}

export function useCategoryListings(
  category: string | null | undefined,
  options: UseCategoryListingsOptions = {}
) {
  const { searchQuery = '' } = options;
  const useMock = shouldUseCatalogMock();
  const categoryKey = category ?? 'all';
  const normalizedQuery = searchQuery.trim();
  const queryKeySuffix = normalizedQuery || 'all';

  const mockPage: ListingsPage = useMemo(
    () => ({
      items: filterMockListings(category, normalizedQuery || undefined),
      nextCursor: undefined,
    }),
    [category, normalizedQuery]
  );

  const query = useInfiniteQuery({
    queryKey: [
      ...listingQueryKeys.list,
      'category',
      categoryKey,
      queryKeySuffix,
      useMock ? 'mock' : 'live',
    ] as const,
    queryFn: async ({ pageParam }) => {
      if (useMock) return mockPage;
      try {
        return await fetchListingsPage(
          pageParam,
          undefined,
          category ?? null,
          normalizedQuery || null
        );
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
