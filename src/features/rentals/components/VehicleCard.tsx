import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Star } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import { Badge } from '@/src/design-system/components/Badge';
import { formatPrice } from '@/src/features/home/data/mock-data';
import type { VehicleCardItem } from '../types';

interface VehicleCardProps {
  vehicle: VehicleCardItem;
  cardWidth: number;
  imageHeight?: number;
  onPress?: (id: string) => void;
}

export const VehicleCard = memo(function VehicleCard({
  vehicle,
  cardWidth,
  imageHeight,
  onPress,
}: VehicleCardProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle();
  const resolvedImageHeight = imageHeight ?? Math.round(cardWidth * (120 / 180));
  const handlePress = useCallback(() => onPress?.(vehicle.id), [onPress, vehicle.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: cardWidth,
        marginBottom: 16,
        ...cardStyle,
        overflow: 'hidden',
      }}
    >
      <Image
        source={vehicle.image}
        style={{ width: cardWidth, height: resolvedImageHeight }}
        contentFit="cover"
        transition={200}
      />
      <View style={{ padding: 12 }}>
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
          <Star color="#FFB800" size={12} fill="#FFB800" />
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            {vehicle.rating?.toFixed(1) ?? 'New'} ({vehicle.reviewCount})
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 }}>
          <MapPin color={colors.textSecondary} size={11} />
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            {vehicle.distanceKm === null ? vehicle.location : `${vehicle.distanceKm} km`}
          </Text>
        </View>
        {vehicle.instant && (
          <View style={{ marginTop: 8 }}>
            <Badge label="Instant" variant="success" />
          </View>
        )}
      </View>
    </Pressable>
  );
});
