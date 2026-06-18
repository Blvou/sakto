import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { Fab } from '@/src/design-system/components/Fab';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { HomeHeader } from '@/src/features/home/components/HomeHeader';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { PromoCarousel } from '@/src/features/home/components/PromoCarousel';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { ScooterSection, VehicleGridCard } from '@/src/features/home/components/ScooterSection';
import { VehicleFilters } from '@/src/features/home/components/VehicleFilters';
import type { Category } from '@/src/features/home/data/mock-data';
import { categories, promoBanners } from '@/src/features/home/data/mock-data';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
import type { VehicleCardItem } from '@/src/features/rentals/types';

function ScooterRowSkeleton({ cardWidth, imageHeight }: { cardWidth: number; imageHeight: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
    </View>
  );
}

function VehicleGridSkeleton({
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
    vehicles,
    isLoading: vehiclesLoading,
    refetch: refetchVehicles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVehicles();

  const [refreshing, setRefreshing] = useState(false);
  const [quickFilter, setQuickFilter] = useState('Nearby');
  const [activeFilter, setActiveFilter] = useState('Nearby');

  const featuredVehicles = useMemo(() => vehicles.slice(0, 10), [vehicles]);
  const popularVehicles = useMemo(() => vehicles.slice(2), [vehicles]);

  const showFeaturedSkeleton = vehiclesLoading && featuredVehicles.length === 0;
  const showPopularSkeleton = vehiclesLoading && popularVehicles.length === 0;
  const scooterImageHeight = Math.round(scooterCardWidth * (120 / 180));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchVehicles();
    setRefreshing(false);
  }, [refetchVehicles]);

  const handleSearchFocus = useCallback(() => {
    router.push('/(tabs)/search');
  }, [router]);

  const handleChatPress = useCallback(() => {
    router.push('/(tabs)/chat');
  }, [router]);

  const handleCategoryPress = useCallback(
    (cat: Category) => {
      router.push({ pathname: '/(tabs)/search', params: { category: cat.id } });
    },
    [router]
  );

  const handleVehiclePress = useCallback(
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

  const keyExtractor = useCallback((item: VehicleCardItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: VehicleCardItem }) => (
      <VehicleGridCard vehicle={item} cardWidth={cardWidth} onPress={handleVehiclePress} />
    ),
    [cardWidth, handleVehiclePress]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <PressableSearchBar
          activeFilter={quickFilter}
          onFilterPress={setQuickFilter}
          onPress={handleSearchFocus}
        />
        <PromoCarousel banners={promoBanners} />
        <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
        {showFeaturedSkeleton ? (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Skeleton width={scale(200)} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
            <ScooterRowSkeleton cardWidth={scooterCardWidth} imageHeight={scooterImageHeight} />
          </View>
        ) : featuredVehicles.length > 0 ? (
          <ScooterSection
            scooters={featuredVehicles}
            onSeeAll={() => router.push('/(tabs)/search')}
            onScooterPress={handleVehiclePress}
          />
        ) : null}
        <VehicleFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        {showPopularSkeleton ? <VehicleGridSkeleton cardWidth={cardWidth} scale={scale} /> : null}
      </View>
    ),
    [
      quickFilter,
      activeFilter,
      handleCategoryPress,
      handleVehiclePress,
      handleSearchFocus,
      featuredVehicles,
      router,
      showFeaturedSkeleton,
      showPopularSkeleton,
      scooterCardWidth,
      scooterImageHeight,
      cardWidth,
      scale,
    ]
  );

  const listEmptyComponent = useMemo(() => {
    if (showPopularSkeleton || popularVehicles.length > 0) return null;
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Skeleton width={cardWidth} height={scale(200)} borderRadius={12} />
      </View>
    );
  }, [showPopularSkeleton, popularVehicles.length, cardWidth, scale]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader onChatPress={handleChatPress} />

      <FlashList
        data={showPopularSkeleton ? [] : popularVehicles}
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

      <Fab
        onPress={() => router.push('/publish?type=scooter')}
        accessibilityLabel="List a bike"
      />
    </View>
  );
}

function PressableSearchBar({
  activeFilter,
  onFilterPress,
  onPress,
}: {
  activeFilter: string;
  onFilterPress: (filter: string) => void;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View pointerEvents="none">
        <SearchBar activeFilter={activeFilter} onFilterPress={onFilterPress} />
      </View>
    </Pressable>
  );
}
