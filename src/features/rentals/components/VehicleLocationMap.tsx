import { MapPin } from 'lucide-react-native';
import { View } from 'react-native';
import type { MapCoordinates } from '@/src/lib/maps';
import { useTheme } from '@/src/hooks/use-theme';

export interface VehicleLocationMapProps {
  coordinates: MapCoordinates;
  isDark?: boolean;
}

export function VehicleLocationMap({ isDark: isDarkProp }: VehicleLocationMapProps) {
  const { colors, isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp ?? themeIsDark;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1E2A3D' : '#D4E4F7',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: '#FFF',
        }}
      >
        <MapPin color="#FFF" size={22} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.25,
        }}
      >
        {Array.from({ length: 8 }).map((_, row) => (
          <View key={row} style={{ flexDirection: 'row', flex: 1 }}>
            {Array.from({ length: 6 }).map((__, col) => (
              <View
                key={col}
                style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: isDark ? '#2A3A50' : '#B8CCE0',
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
