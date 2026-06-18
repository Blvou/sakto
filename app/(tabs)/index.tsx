import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { Bike } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
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
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import {
  buildVehicleSearchParams,
  DEFAULT_VEHICLE_FILTER,
  filterLabelToId,
  type VehicleFilterOption,
} from '@/src/features/rentals/utils/vehicle-filters';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { useNotificationsStore } from '@/src/stores/notifications-store';
import type { VehicleCardItem } from '@/src/features/rentals/types';

function ScooterRowSkeleton({ cardWidth, imageHeight }: { cardWidth: number; imageHeight: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
      <Skeleton width={cardWidth} height={imageHeight + 100} borderRadius={12} />
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const notificationCount = useNotificationsStore((s) => s.unreadCount());
  const { cardWidth, horizontalPadding, listBottomPadding, scooterCardWidth, scale } =
    useResponsive();

  const { coords: userCoords } = useUserLocation();

  const [quickFilter, setQuickFilter] = useState<VehicleFilterOption>(DEFAULT_VEHICLE_FILTER);
  const [activeFilter, setActiveFilter] = useState<VehicleFilterOption>(DEFAULT_VEHICLE_FILTER);
  const [refreshing, setRefreshing] = useState(false);

  const searchParams = useMemo(
    () => buildVehicleSearchParams(activeFilter, undefined, userCoords),
    [activeFilter, userCoords]
  );

  const {
    vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVehicles(searchParams, { userCoords, filter: activeFilter });

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

  const handleNotificationsPress = useCallback(() => {
    router.push('/notifications' as Href);
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

  const handleListBike = useCallback(() => {
    if (!requireAuth({ message: 'Sign in to list your bike', returnTo: '/publish?type=scooter' })) {
      return;
    }
    router.push('/publish?type=scooter');
  }, [requireAuth, router]);

  const handleFilterChange = useCallback((label: string) => {
    const next = filterLabelToId(label);
    setActiveFilter(next);
    setQuickFilter(next);
  }, []);

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
          onFilterPress={handleFilterChange}
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
            onMapPress={() => router.push('/rentals/map' as Href)}
            onScooterPress={handleVehiclePress}
          />
        ) : null}
        <VehicleFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
        {showPopularSkeleton ? <GridSkeleton cardWidth={cardWidth} rows={2} /> : null}
        {vehiclesError ? (
          <ErrorState title="Could not load bikes" onRetry={() => refetchVehicles()} />
        ) : null}
      </View>
    ),
    [
      quickFilter,
      activeFilter,
      handleCategoryPress,
      handleVehiclePress,
      handleSearchFocus,
      handleFilterChange,
      featuredVehicles,
      router,
      showFeaturedSkeleton,
      showPopularSkeleton,
      scooterCardWidth,
      scooterImageHeight,
      cardWidth,
      scale,
      vehiclesError,
      refetchVehicles,
    ]
  );

  const listEmptyComponent = useMemo(() => {
    if (showPopularSkeleton || vehiclesError) return null;
    if (popularVehicles.length > 0) return null;
    return (
      <EmptyState
        icon={Bike}
        title="No bikes nearby"
        description="Try another filter or list your bike to earn from rentals."
        actionLabel="Open map"
        onAction={() => router.push('/rentals/map' as Href)}
      />
    );
  }, [popularVehicles.length, router, showPopularSkeleton, vehiclesError]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader
        notificationCount={notificationCount}
        onChatPress={handleChatPress}
        onNotificationsPress={handleNotificationsPress}
      />

      <FlashList
        data={showPopularSkeleton || vehiclesError ? [] : popularVehicles}
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

      <Fab onPress={handleListBike} accessibilityLabel="List a bike" />
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
