import { memo } from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { formatPrice } from '@/src/features/home/data/mock-data';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { useTheme } from '@/src/hooks/use-theme';

interface VehicleMapMarkerProps {
  vehicle: VehicleCardItem;
  isSelected: boolean;
  onPress: (vehicleId: string) => void;
}

export const VehicleMapMarker = memo(function VehicleMapMarker({
  vehicle,
  isSelected,
  onPress,
}: VehicleMapMarkerProps) {
  const { colors } = useTheme();

  if (vehicle.lat == null || vehicle.lng == null) return null;

  return (
    <Marker
      coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
      onPress={() => onPress(vehicle.id)}
      tracksViewChanges={false}
    >
      <View
        style={{
          backgroundColor: isSelected ? colors.secondary : colors.primary,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#FFF',
          transform: [{ scale: isSelected ? 1.12 : 1 }],
        }}
      >
        <Text
          style={{
            color: '#FFF',
            fontSize: 11,
            fontFamily: 'PlusJakartaSans_700Bold',
          }}
        >
          {formatPrice(vehicle.pricePerDay)}
        </Text>
      </View>
    </Marker>
  );
});
