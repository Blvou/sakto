import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Search, Store } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import {
  getBrowseTitle,
  isListingBrowseSlug,
} from '@/src/features/home/data/hub-categories';
import {
  DEFAULT_LISTING_FILTER_STATE,
  listingFilterStateToSearchParams,
  type ListingFilterState,
} from '@/src/features/listings/components/ListingFilters';
import { MarketplaceBrowseToolbar } from '@/src/features/listings/components/MarketplaceBrowseToolbar';
import { MarketplaceListingGrid } from '@/src/features/listings/components/MarketplaceListingGrid';
import { useListingSearchState } from '@/src/features/listings/components/ListingSearchResults';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

export default function BrowseCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding } = useResponsive();
  const { query, setQuery, debouncedQuery } = useListingSearchState();
  const [filterState, setFilterState] = useState<ListingFilterState>(DEFAULT_LISTING_FILTER_STATE);

  const slug = category ?? 'marketplace';
  const isValidSlug = isListingBrowseSlug(slug);
  const dbCategory = slug === 'marketplace' ? null : slug;
  const title = getBrowseTitle(slug);

  const searchParamsPartial = useMemo(
    () => listingFilterStateToSearchParams(dbCategory, filterState),
    [dbCategory, filterState]
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
  } = useCategoryListings(isValidSlug ? dbCategory : null, {
    searchQuery: debouncedQuery,
    searchParams: searchParamsPartial,
  });

  const handleBack = useCallback(() => {
    router.back();
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
          description={`Nothing matched "${debouncedQuery}" in ${title}. Try different keywords.`}
        />
      );
    }

    return (
      <EmptyState
        icon={Store}
        title="No listings yet"
        description={`There are no active listings in ${title} right now.`}
        actionLabel="Browse marketplace"
        onAction={() => router.push('/marketplace/search' as Href)}
      />
    );
  }, [debouncedQuery, isError, isLoading, router, title]);

  if (!isValidSlug) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Browse" onBack={handleBack} />
        <EmptyState
          icon={Store}
          title="Category not found"
          description="This category does not exist."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={title} onBack={handleBack} />

      <MarketplaceBrowseToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder={`Search in ${title}...`}
        categoryId={dbCategory}
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
