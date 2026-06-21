import { useCallback, useMemo } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Store } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import {
  getBrowseTitle,
  isListingBrowseSlug,
} from '@/src/features/home/data/hub-categories';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

export default function BrowseCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();

  const slug = category ?? 'marketplace';
  const isValidSlug = isListingBrowseSlug(slug);
  const dbCategory = slug === 'marketplace' ? null : slug;
  const title = getBrowseTitle(slug);

  const {
    listings,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryListings(isValidSlug ? dbCategory : null);

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
    return (
      <EmptyState
        icon={Store}
        title="No listings yet"
        description={`There are no active listings in ${title} right now.`}
        actionLabel="Browse marketplace"
        onAction={() => router.push('/browse/marketplace' as Href)}
      />
    );
  }, [isError, isLoading, router, title]);

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

      {isLoading ? (
        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
          <GridSkeleton cardWidth={cardWidth} rows={3} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load listings" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteListingCard
              listing={item}
              cardWidth={cardWidth}
              onPress={handleListingPress}
              returnTo={`/browse/${slug}` as Href}
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
      )}
    </View>
  );
}
