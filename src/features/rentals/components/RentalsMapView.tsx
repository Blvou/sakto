import { forwardRef, useImperativeHandle } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { VehicleCard } from '@/src/features/rentals/components/VehicleCard';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { useTheme } from '@/src/hooks/use-theme';
import type { MapCoordinates } from '@/src/lib/maps';
import type { RentalsMapHandle } from './rentals-map-types';

export interface RentalsMapViewProps {
  vehicles: VehicleCardItem[];
  userCoords: MapCoordinates;
  selectedVehicleId: string | null;
  isDark?: boolean;
  onSelectVehicle: (vehicleId: string | null) => void;
  onVehiclePress: (vehicleId: string) => void;
}

export const RentalsMapView = forwardRef<RentalsMapHandle, RentalsMapViewProps>(function RentalsMapView(
  { vehicles, userCoords, onSelectVehicle, onVehiclePress },
  ref
) {
  const { colors } = useTheme();

  useImperativeHandle(ref, () => ({
    centerOnUser: () => {
      // Web has no embedded map; external maps link is the fallback.
    },
  }));

  const openExternalMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${userCoords.latitude},${userCoords.longitude}`;
    void Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.h3, color: colors.textPrimary }}>Bikes nearby</Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
            {vehicles.length} bikes in this area
          </Text>
        </View>
        <Pressable
          onPress={openExternalMap}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Navigation color={colors.primary} size={14} />
          <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            Open map
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        {vehicles.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <MapPin color={colors.textSecondary} size={40} strokeWidth={1.2} />
            <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 12, textAlign: 'center' }}>
              No bikes with map locations in this area yet.
            </Text>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <View key={vehicle.id}>
              <VehicleCard
                vehicle={vehicle}
                cardWidth={320}
                onPress={() => {
                  onSelectVehicle(vehicle.id);
                  onVehiclePress(vehicle.id);
                }}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
});
