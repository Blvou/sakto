import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useAppStore } from '@/src/stores/app-store';
import { Fab, FabBackdrop, FabSheet } from '@/src/design-system/components/Fab';
import { HomeHeader } from '@/src/features/home/components/HomeHeader';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { PromoCarousel } from '@/src/features/home/components/PromoCarousel';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { ScooterSection } from '@/src/features/home/components/ScooterSection';
import {
  ListingCard,
  ListingFilters,
} from '@/src/features/home/components/ListingGrid';
import { HomeSkeleton } from '@/src/features/home/components/HomeSkeleton';
import { useListings } from '@/src/features/listings/hooks/use-listings';
import type { ListingCardItem } from '@/src/features/listings/types';
import type { Category } from '@/src/features/home/data/mock-data';
import {
  categories,
  promoBanners,
} from '@/src/features/home/data/mock-data';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();
  const isLoading = useAppStore((s) => s.isHomeLoading);
  const setHomeLoading = useAppStore((s) => s.setHomeLoading);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchVehicles()]);
    setRefreshing(false);
  }, [refetch, refetchVehicles]);

  const toggleLoading = useCallback(() => {
    setHomeLoading(!isLoading);
  }, [isLoading, setHomeLoading]);

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
        <ScooterSection
          scooters={vehicles}
          onSeeAll={() => router.push('/(tabs)/search')}
          onScooterPress={handleScooterPress}
        />
        <ListingFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </View>
    ),
    [quickFilter, activeFilter, handleCategoryPress, handleScooterPress, vehicles, router]
  );

  if (isLoading || listingsLoading || vehiclesLoading) {
    return <HomeSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader
        onNotificationsPress={toggleLoading}
        onChatPress={handleChatPress}
      />

      <FlashList
        data={listings}
        numColumns={2}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={cardWidth}
        drawDistance={250}
        ListHeaderComponent={listHeader}
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
