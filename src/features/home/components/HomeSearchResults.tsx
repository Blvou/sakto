import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Search } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { VehicleGridCard } from '@/src/features/home/components/ScooterSection';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import { useCategoryListings } from '@/src/features/listings/hooks/use-category-listings';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface HomeSearchResultsProps {
  searchQuery: string;
  returnTo: Href;
}

export function HomeSearchResults({ searchQuery, returnTo }: HomeSearchResultsProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();
  const { coords: userCoords } = useUserLocation();

  const vehicleParams = useMemo(() => ({ query: searchQuery }), [searchQuery]);

  const {
    vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
    isRefetching: vehiclesRefetching,
  } = useVehicles(vehicleParams, { userCoords, filter: 'Popular' });

  const {
    listings,
    isLoading: listingsLoading,
    isError: listingsError,
    refetch: refetchListings,
    isRefetching: listingsRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryListings(null, { searchQuery });

  const isLoading = vehiclesLoading || listingsLoading;
  const isError = vehiclesError && listingsError;
  const isRefetching = vehiclesRefetching || listingsRefetching;
  const hasResults = vehicles.length > 0 || listings.length > 0;

  const handleVehiclePress = useCallback(
    (id: string) => {
      router.push(`/scooter/${id}`);
    },
    [router]
  );

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const onRefresh = useCallback(() => {
    void Promise.all([refetchVehicles(), refetchListings()]);
  }, [refetchListings, refetchVehicles]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 16 }}>
        <GridSkeleton cardWidth={cardWidth} rows={3} />
      </View>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load results" onRetry={onRefresh} />;
  }

  if (!hasResults) {
    return (
      <EmptyState
        icon={Search}
        title="No results"
        description={`Nothing matched "${searchQuery}". Try scooter brands, locations, or item names.`}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: listBottomPadding,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
        if (distanceFromBottom < 240) {
          handleEndReached();
        }
      }}
      scrollEventThrottle={400}
    >
      {vehicles.length > 0 ? (
        <View style={{ marginBottom: 24 }}>
          <SectionHeader title="Scooters for rent" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {vehicles.map((vehicle) => (
              <VehicleGridCard
                key={vehicle.id}
                vehicle={vehicle}
                cardWidth={cardWidth}
                onPress={handleVehiclePress}
              />
            ))}
          </View>
        </View>
      ) : null}

      {listings.length > 0 ? (
        <View>
          <SectionHeader title="Marketplace listings" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {listings.map((listing) => (
              <FavoriteListingCard
                key={listing.id}
                listing={listing}
                cardWidth={cardWidth}
                onPress={handleListingPress}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
