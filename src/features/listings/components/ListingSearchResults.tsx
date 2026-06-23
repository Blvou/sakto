import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { Search } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { ListingSearchBar } from '@/src/features/listings/components/ListingSearchBar';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface ListingSearchResultsProps {
  searchQuery: string;
  category?: string | null;
  returnTo: Href;
  emptyDescription?: string;
}

export function ListingSearchResults({
  searchQuery,
  category = null,
  returnTo,
  emptyDescription,
}: ListingSearchResultsProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();

  const {
    listings,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryListings(category, { searchQuery });

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
    return (
      <EmptyState
        icon={Search}
        title="No results"
        description={
          emptyDescription ?? `Nothing matched "${searchQuery}". Try different keywords.`
        }
      />
    );
  }, [emptyDescription, isError, isLoading, searchQuery]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
        <GridSkeleton cardWidth={cardWidth} rows={3} />
      </View>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load listings" onRetry={() => refetch()} />;
  }

  return (
    <FlashList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FavoriteListingCard
          listing={item}
          cardWidth={cardWidth}
          onPress={handleListingPress}
          returnTo={returnTo}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: listBottomPadding,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={listEmpty}
    />
  );
}

export function useListingSearchState(delayMs = 350) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, delayMs);
  const isSearching = query.trim().length > 0;

  return {
    query,
    setQuery,
    debouncedQuery: debouncedQuery.trim(),
    isSearching,
  };
}
