import { useMemo } from 'react';
import { useListings } from '@/src/features/listings/hooks/use-listings';
import {
  filterBrowseListings,
  groupListingsByCategory,
  type CategorySection,
} from '../utils/filter-listings';
import type { ListingCardItem } from '@/src/features/listings/types';

interface UseBrowseListingsOptions {
  query?: string;
  categoryId?: string | null;
}

interface UseBrowseListingsResult {
  listings: ListingCardItem[];
  sections: CategorySection[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

export function useBrowseListings({
  query = '',
  categoryId = null,
}: UseBrowseListingsOptions = {}): UseBrowseListingsResult {
  const { data = [], isLoading, isError, refetch } = useListings();

  const listings = useMemo(
    () => filterBrowseListings(data, { query, categoryId }),
    [data, query, categoryId]
  );

  const sections = useMemo(() => groupListingsByCategory(listings), [listings]);

  return {
    listings,
    sections,
    isLoading,
    isError,
    refetch,
  };
}
