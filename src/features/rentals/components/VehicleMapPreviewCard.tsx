import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Navigation, X } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { useTheme } from '@/src/hooks/use-theme';

interface VehicleMapPreviewCardProps {
  vehicle: VehicleCardItem;
  onPress: () => void;
  onClose: () => void;
}

export const VehicleMapPreviewCard = memo(function VehicleMapPreviewCard({
  vehicle,
  onPress,
  onClose,
}: VehicleMapPreviewCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 32,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <X color={colors.textSecondary} size={14} />
      </Pressable>

      <Pressable onPress={onPress} style={{ flexDirection: 'row', gap: 12 }}>
        <Image
          source={vehicle.image}
          style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: colors.border }}
          contentFit="cover"
        />
        <View style={{ flex: 1, paddingRight: 24 }}>
          <Text
            style={{ ...typography.body, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.textPrimary }}
            numberOfLines={1}
          >
            {vehicle.title}
          </Text>
          <Text style={{ ...typography.price, color: colors.primary, marginTop: 4 }}>
            {formatPrice(vehicle.pricePerDay)}
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>/day</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
            <MapPin color={colors.textSecondary} size={12} />
            <Text style={{ ...typography.caption, color: colors.textSecondary }} numberOfLines={1}>
              {vehicle.distanceKm === null ? vehicle.location : `${vehicle.distanceKm} km away`}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={onPress}
        style={{
          marginTop: 12,
          backgroundColor: colors.secondary,
          borderRadius: 10,
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Navigation color="#FFF" size={16} />
        <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
          Book
        </Text>
      </Pressable>
    </View>
  );
});
