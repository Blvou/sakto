import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { Fab, FabBackdrop, FabSheet } from '@/src/design-system/components/Fab';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { HomeHeader } from '@/src/features/home/components/HomeHeader';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { PromoCarousel } from '@/src/features/home/components/PromoCarousel';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { ScooterSection } from '@/src/features/home/components/ScooterSection';
import {
  ListingCard,
  ListingFilters,
} from '@/src/features/home/components/ListingGrid';
import { useListings } from '@/src/features/listings/hooks/use-listings';
import type { ListingCardItem } from '@/src/features/listings/types';
import type { Category } from '@/src/features/home/data/mock-data';
import {
  categories,
  promoBanners,
} from '@/src/features/home/data/mock-data';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';

function ScooterRowSkeleton({ cardWidth, imageHeight }: { cardWidth: number; imageHeight: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
    </View>
  );
}

function ListingGridSkeleton({
  cardWidth,
  scale,
}: {
  cardWidth: number;
  scale: (value: number) => number;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={index}
          width={cardWidth}
          height={scale(200)}
          borderRadius={12}
          style={{ marginBottom: 16 }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding, scooterCardWidth, scale } =
    useResponsive();

  const {
    listings,
    isLoading: listingsLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListings();
  const {
    vehicles,
    isLoading: vehiclesLoading,
    refetch: refetchVehicles,
  } = useVehicles({ limit: 10 });

  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('New');
  const [quickFilter, setQuickFilter] = useState('Nearby');

  const showScooterSkeleton = vehiclesLoading && vehicles.length === 0;
  const showListingSkeleton = listingsLoading && listings.length === 0;
  const scooterImageHeight = Math.round(scooterCardWidth * (120 / 180));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchVehicles()]);
    setRefreshing(false);
  }, [refetch, refetchVehicles]);

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const handleChatPress = useCallback(() => {
    router.push('/(tabs)/chat');
  }, [router]);

  const handleCategoryPress = useCallback(
    (cat: Category) => {
      if (cat.id === 'scooters') router.push('/(tabs)/search');
    },
    [router]
  );

  const handleScooterPress = useCallback(
    (id: string) => {
      router.push(`/scooter/${id}`);
    },
    [router]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const keyExtractor = useCallback((item: ListingCardItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ListingCardItem }) => (
      <ListingCard
        listing={item}
        cardWidth={cardWidth}
        onPress={handleListingPress}
      />
    ),
    [cardWidth, handleListingPress]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <SearchBar activeFilter={quickFilter} onFilterPress={setQuickFilter} />
        <PromoCarousel banners={promoBanners} />
        <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
        {showScooterSkeleton ? (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Skeleton width={scale(200)} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
            <ScooterRowSkeleton cardWidth={scooterCardWidth} imageHeight={scooterImageHeight} />
          </View>
        ) : (
          <ScooterSection
            scooters={vehicles}
            onSeeAll={() => router.push('/(tabs)/search')}
            onScooterPress={handleScooterPress}
          />
        )}
        <ListingFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        {showListingSkeleton ? (
          <ListingGridSkeleton cardWidth={cardWidth} scale={scale} />
        ) : null}
      </View>
    ),
    [
      quickFilter,
      activeFilter,
      handleCategoryPress,
      handleScooterPress,
      vehicles,
      router,
      showScooterSkeleton,
      showListingSkeleton,
      scooterCardWidth,
      scooterImageHeight,
      cardWidth,
      scale,
    ]
  );

  const listEmptyComponent = useMemo(() => {
    if (showListingSkeleton || listings.length > 0) return null;
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Skeleton width={cardWidth} height={scale(200)} borderRadius={12} />
      </View>
    );
  }, [showListingSkeleton, listings.length, cardWidth, scale]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader onChatPress={handleChatPress} />

      <FlashList
        data={showListingSkeleton ? [] : listings}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={cardWidth}
        drawDistance={250}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={{ paddingBottom: listBottomPadding, paddingHorizontal: horizontalPadding }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />

      <FabBackdrop visible={fabOpen} onPress={() => setFabOpen(false)} />
      <Fab onPress={() => setFabOpen(true)} />
      <FabSheet
        visible={fabOpen}
        onClose={() => setFabOpen(false)}
        onSellItem={() => router.push('/publish')}
        onRentScooter={() => router.push('/publish?type=scooter')}
      />
    </View>
  );
}
