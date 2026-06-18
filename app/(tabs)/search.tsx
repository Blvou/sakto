import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { ScooterSection } from '@/src/features/home/components/ScooterSection';
import { VehicleFilters } from '@/src/features/home/components/VehicleFilters';
import { VehicleGridCard } from '@/src/features/home/components/ScooterSection';
import { categories, type Category } from '@/src/features/home/data/mock-data';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
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

const CATEGORY_QUERY: Record<string, string> = {
  nearby: '',
  electric: 'electric',
  manual: 'manual',
  hourly: 'hour',
  daily: 'day',
  popular: '',
};

export default function SearchScreen() {
  const { colors } = useTheme();
  const { horizontalPadding, listBottomPadding, cardWidth } = useResponsive();
  const router = useRouter();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Nearby');
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    if (typeof categoryParam === 'string' && categoryParam in CATEGORY_QUERY) {
      setQuery(CATEGORY_QUERY[categoryParam] ?? '');
    }
  }, [categoryParam]);

  const {
    vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVehicles({ query: debouncedQuery });

  const featuredVehicles = useMemo(() => vehicles.slice(0, 6), [vehicles]);

  const handleCategoryPress = useCallback((category: Category) => {
    setQuery(CATEGORY_QUERY[category.id] ?? category.label);
  }, []);

  const handleVehiclePress = useCallback(
    (vehicleId: string) => {
      router.push(`/scooter/${vehicleId}`);
    },
    [router]
  );

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
            onFilterPress={setActiveFilter}
          />
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
          <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
        </View>

        {vehiclesLoading && vehicles.length === 0 ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : featuredVehicles.length > 0 && !debouncedQuery ? (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <ScooterSection
              scooters={featuredVehicles}
              title="🛵 Top picks"
              onScooterPress={handleVehiclePress}
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 8 }}>
          <VehicleFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            title={debouncedQuery ? 'Results' : 'All bikes nearby'}
          />
        </View>
      </View>
    ),
    [
      activeFilter,
      colors.primary,
      colors.textPrimary,
      debouncedQuery,
      featuredVehicles,
      handleCategoryPress,
      handleVehiclePress,
      horizontalPadding,
      query,
      vehicles.length,
      vehiclesLoading,
    ]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      {vehiclesLoading && vehicles.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : vehiclesError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Search color={colors.textSecondary} size={48} strokeWidth={1} />
          <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
            Search is unavailable right now.
          </Text>
          <Pressable onPress={() => refetchVehicles()} style={{ marginTop: 12 }}>
            <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={vehicles}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicle}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: listBottomPadding, paddingHorizontal: horizontalPadding }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 32 }}>
              <Search color={colors.textSecondary} size={48} strokeWidth={1} />
              <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
                No bikes found. Try a different search or area.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
