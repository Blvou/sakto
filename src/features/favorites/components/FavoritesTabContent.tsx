import { useCallback } from 'react';
import { RefreshControl, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { typography } from '@/src/design-system/tokens';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { useFavorites } from '@/src/features/favorites/hooks/use-favorites';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface FavoritesTabContentProps {
  returnTo?: Href;
}

export function FavoritesTabContent({ returnTo = '/(tabs)/favorites' as Href }: FavoritesTabContentProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const requireAuth = useRequireAuth();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();
  const { data: favorites = [], isLoading, isError, refetch, isRefetching } = useFavorites();

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const handleBrowseMarketplace = useCallback(() => {
    router.push('/browse/marketplace' as Href);
  }, [router]);

  const handleSignIn = useCallback(() => {
    requireAuth({ message: 'Sign in to view favorites', returnTo });
  }, [requireAuth, returnTo]);

  if (!userId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 56 }}>
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 16 }}>Favorites</Text>
        </View>
        <EmptyState
          icon={Heart}
          title="Sign in to save favorites"
          description="Tap the heart on any listing to add it here."
          actionLabel="Sign in"
          onAction={handleSignIn}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 56 }}>
      {isLoading ? (
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 16 }}>Favorites</Text>
          <GridSkeleton cardWidth={cardWidth} rows={3} />
        </View>
      ) : isError ? (
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 16 }}>Favorites</Text>
          <ErrorState title="Could not load favorites" onRetry={() => refetch()} />
        </View>
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
              returnTo={returnTo}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: listBottomPadding,
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 16 }}>Favorites</Text>
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
