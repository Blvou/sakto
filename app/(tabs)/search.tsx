import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { CategoryGrid } from '@/src/features/home/components/CategoryGrid';
import { ListingCard, ListingFilters } from '@/src/features/home/components/ListingGrid';
import { SearchBar } from '@/src/features/home/components/SearchBar';
import { ScooterSection } from '@/src/features/home/components/ScooterSection';
import { categories, type Category } from '@/src/features/home/data/mock-data';
import { useListings } from '@/src/features/listings/hooks/use-listings';
import type { ListingCardItem } from '@/src/features/listings/types';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
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

export default function SearchScreen() {
  const { colors } = useTheme();
  const { horizontalPadding, listBottomPadding, cardWidth } = useResponsive();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('New');
  const debouncedQuery = useDebouncedValue(query, 350);
  const { listings, isLoading: listingsLoading, isError: listingsError, refetch } = useListings();
  const {
    vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
    refetch: refetchVehicles,
  } = useVehicles({ query: debouncedQuery, limit: 10 });

  const filteredListings = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase();
    if (!normalized) return listings;
    return listings.filter((listing) =>
      [listing.title, listing.location, listing.category ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [debouncedQuery, listings]);

  const handleCategoryPress = useCallback(
    (category: Category) => {
      if (category.id === 'scooters') {
        setQuery('scooter');
        return;
      }
      setQuery(category.label);
    },
    []
  );

  const renderListing = useCallback(
    ({ item }: { item: ListingCardItem }) => (
      <ListingCard
        listing={item}
        cardWidth={cardWidth}
        onPress={(listingId) => router.push(`/listing/${listingId}`)}
      />
    ),
    [cardWidth, router]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 12 }}>Search</Text>
          <SearchBar value={query} onChangeText={setQuery} activeFilter={activeFilter} onFilterPress={setActiveFilter} />
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
          Browse categories
        </Text>
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
        </View>

        {vehiclesLoading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : vehicles.length > 0 ? (
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <ScooterSection
              scooters={vehicles}
              onScooterPress={(vehicleId) => router.push(`/scooter/${vehicleId}`)}
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 8 }}>
          <ListingFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </View>
      </View>
    ),
    [
      activeFilter,
      colors.primary,
      colors.textPrimary,
      handleCategoryPress,
      horizontalPadding,
      query,
      router,
      vehicles,
      vehiclesLoading,
    ]
  );

  const hasError = listingsError || vehiclesError;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 56 }}>
      {listingsLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : hasError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Search color={colors.textSecondary} size={48} strokeWidth={1} />
          <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
            Search is unavailable right now.
          </Text>
          <Pressable
            onPress={() => {
              refetch();
              refetchVehicles();
            }}
            style={{ marginTop: 12 }}
          >
            <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={filteredListings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderListing}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: listBottomPadding, paddingHorizontal: horizontalPadding }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 32 }}>
              <Search color={colors.textSecondary} size={48} strokeWidth={1} />
              <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
                Search for items, bikes, or services near you
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
