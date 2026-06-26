import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { shouldUseCatalogMock } from '@/src/lib/catalog';
import {
  buildListingSearchParams,
  type ListingSearchParams,
} from '@/src/features/listings/utils/listing-filters';
import { fetchListingsPage, fetchMockListingsPage } from '../api/listings';
import { listingQueryKeys, type ListingsPage, type ListingsPageCursor } from '../types';
import { flattenListings } from '../utils/listings-cache';

export interface UseCategoryListingsOptions {
  searchQuery?: string;
  searchParams?: Partial<ListingSearchParams>;
}

function buildParams(
  category: string | null | undefined,
  options: UseCategoryListingsOptions
): ListingSearchParams {
  return buildListingSearchParams({
    category: category ?? null,
    query: options.searchQuery,
    sort: options.searchParams?.sort,
    priceMin: options.searchParams?.priceMin,
    priceMax: options.searchParams?.priceMax,
    attributeFilters: options.searchParams?.attributeFilters,
  });
}

export function useCategoryListings(
  category: string | null | undefined,
  options: UseCategoryListingsOptions = {}
) {
  const { searchQuery = '', searchParams: searchParamsOverride } = options;
  const useMock = shouldUseCatalogMock();
  const categoryKey = category ?? 'all';
  const params = useMemo(
    () => buildParams(category, { searchQuery, searchParams: searchParamsOverride }),
    [category, searchQuery, searchParamsOverride]
  );

  const queryKeySuffix = JSON.stringify(params);

  const mockPage: ListingsPage = useMemo(
    () => fetchMockListingsPage(params),
    [params]
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
        return await fetchListingsPage(pageParam, undefined, params);
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
    searchParams: params,
  };
}

/** Marketplace-wide discovery (no fixed category slug). */
export function useMarketplaceListings(options: UseCategoryListingsOptions = {}) {
  return useCategoryListings(null, options);
}
