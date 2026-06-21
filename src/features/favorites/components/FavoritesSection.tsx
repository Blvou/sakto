import { memo, useCallback, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { useFavorites } from '@/src/features/favorites/hooks/use-favorites';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { useResponsive } from '@/src/hooks/use-responsive';

export const FavoritesSection = memo(function FavoritesSection() {
  const router = useRouter();
  const { userId } = useAuth();
  const requireAuth = useRequireAuth();
  const { scale } = useResponsive();
  const cardWidth = scale(156);
  const { data: favorites = [], isLoading, isError, refetch } = useFavorites();

  const previewItems = useMemo(() => favorites.slice(0, 8), [favorites]);

  const handleSeeAll = useCallback(() => {
    router.push('/favorites' as Href);
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

  const handleSignIn = useCallback(() => {
    requireAuth({ message: 'Sign in to view favorites', returnTo: '/(tabs)' });
  }, [requireAuth]);

  return (
    <View style={{ marginBottom: 24 }}>
      <SectionHeader title="Favorites" actionLabel="See all" onActionPress={handleSeeAll} />

      {!userId ? (
        <EmptyState
          icon={Heart}
          title="Sign in to save favorites"
          description="Tap the heart on any listing to add it here."
          actionLabel="Sign in"
          onAction={handleSignIn}
        />
      ) : isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          <Skeleton width={cardWidth} height={cardWidth + 72} borderRadius={12} />
          <Skeleton width={cardWidth} height={cardWidth + 72} borderRadius={12} />
        </ScrollView>
      ) : isError ? (
        <ErrorState title="Could not load favorites" onRetry={() => refetch()} />
      ) : previewItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any listing to save it here."
          actionLabel="Browse marketplace"
          onAction={handleBrowseMarketplace}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {previewItems.map((listing) => (
            <FavoriteListingCard
              key={listing.id}
              listing={listing}
              cardWidth={cardWidth}
              onPress={handleListingPress}
              returnTo={'/(tabs)' as Href}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
});
