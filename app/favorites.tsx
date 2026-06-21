import { useCallback } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { useFavorites } from '@/src/features/favorites/hooks/use-favorites';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();
  const { data: favorites = [], isLoading, isError, refetch, isRefetching } = useFavorites();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const handleBrowseMarketplace = useCallback(() => {
    router.push('/browse/marketplace' as Href);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Favorites" onBack={handleBack} />

      {isLoading ? (
        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
          <GridSkeleton cardWidth={cardWidth} rows={3} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load favorites" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={favorites}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteListingCard
              listing={item}
              cardWidth={cardWidth}
              onPress={handleListingPress}
              returnTo={'/favorites' as Href}
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
          ListEmptyComponent={
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Tap the heart on any listing to save it here."
              actionLabel="Browse marketplace"
              onAction={handleBrowseMarketplace}
            />
          }
        />
      )}
    </View>
  );
}
