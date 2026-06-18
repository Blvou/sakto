import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, LocateFixed } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { typography } from '@/src/design-system/tokens';
import {
  RentalsMapView,
} from '@/src/features/rentals/components/RentalsMapView';
import type { RentalsMapHandle } from '@/src/features/rentals/components/rentals-map-types';
import { VehicleMapPreviewCard } from '@/src/features/rentals/components/VehicleMapPreviewCard';
import { useNearbyVehicles } from '@/src/features/rentals/hooks/use-nearby-vehicles';
import { useUserLocation } from '@/src/features/rentals/hooks/use-user-location';
import { useTheme } from '@/src/hooks/use-theme';

const RADIUS_OPTIONS = [5, 10, 25] as const;

export default function RentalsMapScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const mapRef = useRef<RentalsMapHandle>(null);
  const [radiusKm, setRadiusKm] = useState<(typeof RADIUS_OPTIONS)[number]>(10);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { status, coords, isUsingFallback, refresh } = useUserLocation();
  const { vehicles, isLoading, isError, refetch } = useNearbyVehicles({
    userCoords: coords,
    radiusKm,
    enabled: status !== 'loading' && status !== 'idle',
  });

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles]
  );

  const handleSelectVehicle = useCallback((vehicleId: string | null) => {
    setSelectedVehicleId(vehicleId);
  }, []);

  const handleVehiclePress = useCallback(
    (vehicleId: string) => {
      router.push(`/scooter/${vehicleId}`);
    },
    [router]
  );

  const handleCenterOnUser = useCallback(() => {
    mapRef.current?.centerOnUser(coords);
    void refresh();
  }, [coords, refresh]);

  const handleRetry = useCallback(async () => {
    await refresh();
    const result = await refetch();
    if (result.isError) {
      toast.error('Could not load nearby bikes');
    }
  }, [refetch, refresh]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RentalsMapView
        ref={mapRef}
        vehicles={vehicles}
        userCoords={coords}
        selectedVehicleId={selectedVehicleId}
        isDark={isDark}
        onSelectVehicle={handleSelectVehicle}
        onVehiclePress={handleVehiclePress}
      />

      <View
        style={{
          position: 'absolute',
          top: 56,
          left: 16,
          right: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </Pressable>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ ...typography.body, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.textPrimary }}>
            {isLoading ? 'Loading bikes…' : `${vehicles.length} bikes nearby`}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
            Within {radiusKm} km
          </Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          top: 118,
          left: 16,
          right: 16,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        {RADIUS_OPTIONS.map((option) => {
          const selected = option === radiusKm;
          return (
            <Pressable
              key={option}
              onPress={() => setRadiusKm(option)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selected ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  ...typography.caption,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  color: selected ? '#FFF' : colors.textPrimary,
                }}
              >
                {option} km
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isUsingFallback ? (
        <Pressable
          onPress={() => void refresh()}
          style={{
            position: 'absolute',
            top: 168,
            left: 16,
            right: 16,
            backgroundColor: colors.warning + '22',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.warning,
            padding: 12,
          }}
        >
          <Text style={{ ...typography.caption, color: colors.textPrimary }}>
            Enable location to see bikes near you. Tap to try again.
          </Text>
        </Pressable>
      ) : null}

      {isLoading ? (
        <View
          style={{
            position: 'absolute',
            top: '45%',
            alignSelf: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {isError ? (
        <Pressable
          onPress={() => void handleRetry()}
          style={{
            position: 'absolute',
            top: isUsingFallback ? 228 : 168,
            left: 16,
            right: 16,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
          }}
        >
          <Text style={{ ...typography.caption, color: colors.secondary }}>
            Could not load bikes. Tap to retry.
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={handleCenterOnUser}
        style={{
          position: 'absolute',
          right: 16,
          bottom: selectedVehicle ? 188 : 32,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <LocateFixed color={colors.primary} size={22} />
      </Pressable>

      {selectedVehicle ? (
        <VehicleMapPreviewCard
          vehicle={selectedVehicle}
          onPress={() => handleVehiclePress(selectedVehicle.id)}
          onClose={() => setSelectedVehicleId(null)}
        />
      ) : null}
    </View>
  );
}
