import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Bike, List, Map as MapIcon } from 'lucide-react-native';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { GridSkeleton } from '@/src/design-system/components/ListSkeleton';
import { typography } from '@/src/design-system/tokens';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { ScooterSection } from '@/src/features/home/components/ScooterSection';
import { VehicleFilters } from '@/src/features/home/components/VehicleFilters';
import { VehicleGridCard } from '@/src/features/home/components/ScooterSection';
import { categories, type Category } from '@/src/features/home/data/mock-data';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import {
  buildVehicleSearchParams,
  categoryIdToFilter,
  DEFAULT_VEHICLE_FILTER,
  filterLabelToId,
  filterToCategoryId,
  type VehicleFilterOption,
} from '@/src/features/rentals/utils/vehicle-filters';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}

const CATEGORY_FILTER = {
  nearby: 'Nearby',
  electric: 'Electric',
  manual: 'Manual',
  daily: 'By day',
  popular: 'Popular',
} as const;

type ViewMode = 'list' | 'map';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { horizontalPadding, listBottomPadding, cardWidth } = useResponsive();
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<VehicleFilterOption>(DEFAULT_VEHICLE_FILTER);
  const [selectedCategory, setSelectedCategory] = useState<string>('nearby');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    if (typeof categoryParam === 'string' && categoryParam in CATEGORY_FILTER) {
      const filter = CATEGORY_FILTER[categoryParam as keyof typeof CATEGORY_FILTER];
      setActiveFilter(filter);
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const { coords: userCoords } = useUserLocation();

  const searchParams = useMemo(
    () => buildVehicleSearchParams(activeFilter, debouncedQuery || undefined, userCoords),
    [activeFilter, debouncedQuery, userCoords]
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

  const featuredVehicles = useMemo(() => vehicles.slice(0, 6), [vehicles]);

  const handleCategoryPress = useCallback((category: Category) => {
    const filter = categoryIdToFilter(category.id);
    if (!filter) return;
    setActiveFilter(filter);
    setSelectedCategory(category.id);
    setQuery('');
  }, []);

  const handleVehiclePress = useCallback(
    (vehicleId: string) => {
      router.push(`/scooter/${vehicleId}`);
    },
    [router]
  );

  const handleFilterChange = useCallback((label: string) => {
    const next = filterLabelToId(label);
    setActiveFilter(next);
    setSelectedCategory(filterToCategoryId(next));
  }, []);

  const openMap = useCallback(() => {
    router.push('/rentals/map' as Href);
  }, [router]);

  const renderVehicle = useCallback(
    ({ item }: { item: VehicleCardItem }) => (
      <VehicleGridCard vehicle={item} cardWidth={cardWidth} onPress={handleVehiclePress} />
    ),
    [cardWidth, handleVehiclePress]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 12 }}>Find bikes</Text>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            activeFilter={activeFilter}
            onFilterPress={handleFilterChange}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 }}>
            <Pressable
              onPress={() => setViewMode('list')}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: viewMode === 'list' ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: viewMode === 'list' ? colors.primary : colors.border,
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: viewMode === 'list' }}
            >
              <List color={viewMode === 'list' ? '#FFF' : colors.textPrimary} size={16} />
              <Text
                style={{
                  ...typography.caption,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  color: viewMode === 'list' ? '#FFF' : colors.textPrimary,
                }}
              >
                List
              </Text>
            </Pressable>
            <Pressable
              onPress={openMap}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: viewMode === 'map' ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: viewMode === 'map' ? colors.primary : colors.border,
              }}
              accessibilityRole="button"
              accessibilityLabel="Open map view"
            >
              <MapIcon color={colors.textPrimary} size={16} />
              <Text
                style={{
                  ...typography.caption,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  color: colors.textPrimary,
                }}
              >
                Map
              </Text>
            </Pressable>
          </View>
        </View>

        <Text
          style={{
            ...typography.h3,
            color: colors.textPrimary,
            paddingHorizontal: horizontalPadding,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          Browse
        </Text>
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <CategoryGrid
            categories={categories}
            selectedCategoryId={selectedCategory}
            onCategoryPress={handleCategoryPress}
          />
        </View>

        {featuredVehicles.length > 0 && !debouncedQuery ? (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <ScooterSection
              scooters={featuredVehicles}
              title="Top picks"
              onMapPress={openMap}
              onScooterPress={handleVehiclePress}
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 8 }}>
          <VehicleFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            title={debouncedQuery ? 'Results' : 'All bikes nearby'}
          />
        </View>

        {vehiclesLoading && vehicles.length === 0 ? (
          <View style={{ paddingHorizontal: horizontalPadding, marginTop: 12 }}>
            <GridSkeleton cardWidth={cardWidth} rows={3} />
          </View>
        ) : null}

        {vehiclesError ? (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <ErrorState title="Search unavailable" onRetry={() => refetchVehicles()} />
          </View>
        ) : null}
      </View>
    ),
    [
      activeFilter,
      cardWidth,
      colors.border,
      colors.primary,
      colors.surface,
      colors.textPrimary,
      debouncedQuery,
      featuredVehicles,
      selectedCategory,
      handleCategoryPress,
      handleFilterChange,
      handleVehiclePress,
      horizontalPadding,
      openMap,
      query,
      refetchVehicles,
      vehicles.length,
      vehiclesError,
      vehiclesLoading,
      viewMode,
    ]
  );

  const listEmptyComponent = useMemo(() => {
    if (vehiclesLoading || vehiclesError) return null;
    return (
      <EmptyState
        icon={Bike}
        title="No bikes found"
        description="Try another filter or open the map to explore nearby bikes."
        actionLabel="Open map"
        onAction={openMap}
      />
    );
  }, [openMap, vehiclesError, vehiclesLoading]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      <FlashList
        data={vehiclesLoading || vehiclesError ? [] : vehicles}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={{ paddingBottom: listBottomPadding, paddingHorizontal: horizontalPadding }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
