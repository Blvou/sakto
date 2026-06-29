import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, Store } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { getCategoryLabel, normalizeCategoryId } from '@/src/features/listings/constants/category-tree';
import {
  DEFAULT_LISTING_FILTER_STATE,
  listingFilterStateToSearchParams,
  type ListingFilterState,
} from '@/src/features/listings/components/ListingFilters';
import { MarketplaceBrowseToolbar } from '@/src/features/listings/components/MarketplaceBrowseToolbar';
import { MarketplaceListingGrid } from '@/src/features/listings/components/MarketplaceListingGrid';
import { useListingSearchState } from '@/src/features/listings/components/ListingSearchResults';
import { useMarketplaceListings } from '@/src/features/listings/hooks/use-category-listings';
import { DEFAULT_LISTING_SORT, LISTING_SORT_OPTIONS, type ListingSortOption } from '@/src/features/listings/utils/listing-filters';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

export default function MarketplaceSearchScreen() {
  const { category: categoryParam, sort: sortParam } = useLocalSearchParams<{
    category?: string;
    sort?: string;
  }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding } = useResponsive();
  const { query, setQuery, debouncedQuery } = useListingSearchState();

  const [filterState, setFilterState] = useState<ListingFilterState>(DEFAULT_LISTING_FILTER_STATE);

  useEffect(() => {
    if (typeof categoryParam === 'string') {
      setFilterState((prev) => ({
        ...DEFAULT_LISTING_FILTER_STATE,
        sort: prev.sort,
      }));
    }
  }, [categoryParam]);

  useEffect(() => {
    if (typeof sortParam === 'string' && LISTING_SORT_OPTIONS.some((option) => option.id === sortParam)) {
      setFilterState((prev) => ({ ...prev, sort: sortParam as ListingSortOption }));
    }
  }, [sortParam]);

  const categoryId = useMemo(() => {
    if (typeof categoryParam !== 'string') return null;
    return normalizeCategoryId(categoryParam);
  }, [categoryParam]);

  const searchParamsPartial = useMemo(
    () => listingFilterStateToSearchParams(categoryId, filterState),
    [categoryId, filterState]
  );

  const {
    listings,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMarketplaceListings({
    searchQuery: debouncedQuery,
    searchParams: {
      ...searchParamsPartial,
      category: categoryId,
    },
  });

  const screenTitle = categoryId ? getCategoryLabel(categoryId) : 'Marketplace';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const listEmpty = useMemo(() => {
    if (isLoading || isError) return null;

    if (debouncedQuery) {
      return (
        <EmptyState
          icon={Search}
          title="No results"
          description={`Nothing matched "${debouncedQuery}". Try different keywords or filters.`}
        />
      );
    }

    return (
      <EmptyState
        icon={Store}
        title="No listings yet"
        description="Try adjusting filters or browse another category."
        actionLabel="Clear filters"
        onAction={() =>
          setFilterState({ ...DEFAULT_LISTING_FILTER_STATE, sort: DEFAULT_LISTING_SORT })
        }
      />
    );
  }, [debouncedQuery, isError, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={screenTitle} onBack={handleBack} />

      <MarketplaceBrowseToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={`Search ${screenTitle.toLowerCase()}...`}
        categoryId={categoryId}
        filterState={filterState}
        onFilterChange={setFilterState}
      />

      {isLoading ? (
        <View style={{ flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
          <GridSkeleton cardWidth={cardWidth} rows={3} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load listings" onRetry={() => refetch()} />
      ) : (
        <MarketplaceListingGrid
          listings={listings}
          isRefetching={isRefetching}
          onRefresh={() => refetch()}
          onListingPress={handleListingPress}
          onEndReached={handleEndReached}
          listEmptyComponent={listEmpty}
        />
      )}
    </View>
  );
}
