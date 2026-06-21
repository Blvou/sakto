import { memo, useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Bike } from 'lucide-react-native';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { typography } from '@/src/design-system/tokens';
import { VehicleGridCard } from '@/src/features/home/components/ScooterSection';
import { useVehicles } from '@/src/features/rentals/hooks/use-vehicles';
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import { buildVehicleSearchParams, DEFAULT_VEHICLE_FILTER } from '@/src/features/rentals/utils/vehicle-filters';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

export const RentNearbySection = memo(function RentNearbySection() {
  const { colors } = useTheme();
  const router = useRouter();
  const { scale } = useResponsive();
  const cardWidth = scale(156);
  const { coords: userCoords } = useUserLocation();

  const searchParams = useMemo(
    () => buildVehicleSearchParams(DEFAULT_VEHICLE_FILTER, undefined, userCoords),
    [userCoords]
  );

  const { vehicles, isLoading } = useVehicles(searchParams, {
    userCoords,
    filter: DEFAULT_VEHICLE_FILTER,
  });

  const previewVehicles = useMemo(() => vehicles.slice(0, 6), [vehicles]);

  const handleSeeAll = useCallback(() => {
    router.push('/search' as Href);
  }, [router]);

  const handleVehiclePress = useCallback(
    (id: string) => {
      router.push(`/scooter/${id}`);
    },
    [router]
  );

  return (
    <View style={{ marginBottom: 24 }}>
      <SectionHeader title="Rent nearby" actionLabel="See all" onActionPress={handleSeeAll} />

      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          <Skeleton width={cardWidth} height={cardWidth + 88} borderRadius={12} />
          <Skeleton width={cardWidth} height={cardWidth + 88} borderRadius={12} />
        </ScrollView>
      ) : previewVehicles.length === 0 ? (
        <Pressable
          onPress={handleSeeAll}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${colors.primary}12`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bike color={colors.primary} size={24} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.h3, color: colors.textPrimary }}>Find bikes to rent</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
              Scooters and motorcycles near you
            </Text>
          </View>
        </Pressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {previewVehicles.map((vehicle) => (
            <VehicleGridCard
              key={vehicle.id}
              vehicle={vehicle}
              cardWidth={cardWidth}
              onPress={handleVehiclePress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
});
