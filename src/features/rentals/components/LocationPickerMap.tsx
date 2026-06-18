import { MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { typography } from '@/src/design-system/tokens';
import { useTheme } from '@/src/hooks/use-theme';
import { MANILA_DEFAULT_COORDS, type MapCoordinates } from '@/src/lib/maps';

export interface LocationPickerMapProps {
  coordinates: MapCoordinates;
  onCoordinatesChange: (coords: MapCoordinates) => void;
  isDark?: boolean;
}

export function LocationPickerMap({ coordinates, onCoordinatesChange }: LocationPickerMapProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <MapPin color={colors.primary} size={32} />
      <Text
        style={{
          ...typography.body,
          color: colors.textPrimary,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        Map picker is available in the mobile app
      </Text>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
        {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
      </Text>
      <Pressable
        onPress={() => onCoordinatesChange(MANILA_DEFAULT_COORDS)}
        style={{
          marginTop: 16,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ ...typography.caption, color: '#FFF', fontFamily: 'PlusJakartaSans_600SemiBold' }}>
          Use Manila default
        </Text>
      </Pressable>
    </View>
  );
}
