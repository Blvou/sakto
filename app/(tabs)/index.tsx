import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { HomeHeader } from '@/src/features/home/components/HomeHeader';
import { ServiceHubGrid } from '@/src/features/home/components/ServiceHubGrid';
import { RecommendedListingsSection } from '@/src/features/home/components/RecommendedListingsSection';
import { RentNearbySection } from '@/src/features/home/components/RentNearbySection';
import { useUnreadNotificationCount } from '@/src/features/notifications/hooks/use-user-notifications';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import { buildVehicleSearchParams, DEFAULT_VEHICLE_FILTER } from '@/src/features/rentals/utils/vehicle-filters';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const notificationCount = useUnreadNotificationCount();
  const { horizontalPadding, listBottomPadding } = useResponsive();
  const { coords: userCoords } = useUserLocation();
  const [refreshing, setRefreshing] = useState(false);

  const searchParams = useMemo(
    () => buildVehicleSearchParams(DEFAULT_VEHICLE_FILTER, undefined, userCoords),
    [userCoords]
  );

  const { refetch: refetchListings, isRefetching: listingsRefetching } = useCategoryListings(null);
  const { refetch: refetchVehicles, isRefetching: vehiclesRefetching } = useVehicles(searchParams, {
    userCoords,
    filter: DEFAULT_VEHICLE_FILTER,
  });

  const handleNotificationsPress = useCallback(() => {
    router.push('/notifications' as Href);
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchListings(), refetchVehicles()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchListings, refetchVehicles]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader
        notificationCount={notificationCount}
        onNotificationsPress={handleNotificationsPress}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: listBottomPadding,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || listingsRefetching || vehiclesRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ServiceHubGrid />
        <RentNearbySection />
        <RecommendedListingsSection />
      </ScrollView>
    </View>
  );
}
