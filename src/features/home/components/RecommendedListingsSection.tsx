import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Store } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useResponsive } from '@/src/hooks/use-responsive';

export const RecommendedListingsSection = memo(function RecommendedListingsSection() {
  const router = useRouter();
  const { cardWidth } = useResponsive();
  const { listings, isLoading, isError, refetch } = useCategoryListings(null);

  const previewItems = useMemo(() => listings.slice(0, 8), [listings]);

  const handleSeeAll = useCallback(() => {
    router.push('/browse/marketplace' as Href);
  }, [router]);

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  if (isError) {
    return (
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Recommended" actionLabel="See all" onActionPress={handleSeeAll} />
        <ErrorState title="Could not load listings" onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Recommended" />
        <GridSkeleton cardWidth={cardWidth} rows={2} />
      </View>
    );
  }

  if (previewItems.length === 0) {
    return (
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="Recommended" actionLabel="See all" onActionPress={handleSeeAll} />
        <EmptyState
          icon={Store}
          title="No listings yet"
          description="Check back soon for new items on the marketplace."
          actionLabel="Browse marketplace"
          onAction={handleSeeAll}
        />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <SectionHeader title="Recommended" actionLabel="See all" onActionPress={handleSeeAll} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {previewItems.map((listing) => (
          <FavoriteListingCard
            key={listing.id}
            listing={listing}
            cardWidth={cardWidth}
            onPress={handleListingPress}
          />
        ))}
      </View>
    </View>
  );
});
