import { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Star } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import { Badge } from '@/src/design-system/components/Badge';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { formatPrice } from '../data/mock-data';

const SCOOTER_GAP = 12;

interface ScooterCardProps {
  scooter: VehicleCardItem;
  cardWidth: number;
  imageHeight: number;
  onPress?: (id: string) => void;
}

const ScooterCard = memo(function ScooterCard({
  scooter,
  cardWidth,
  imageHeight,
  onPress,
}: ScooterCardProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle();
  const handlePress = useCallback(() => onPress?.(scooter.id), [onPress, scooter.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: cardWidth,
        ...cardStyle,
        overflow: 'hidden',
      }}
    >
      <Image
        source={scooter.image}
        style={{ width: cardWidth, height: imageHeight }}
        contentFit="cover"
        transition={200}
      />
      <View style={{ padding: 12 }}>
        <Text
          style={{ ...typography.body, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.textPrimary }}
          numberOfLines={1}
        >
          {scooter.title}
        </Text>
        <Text style={{ ...typography.price, color: colors.primary, marginTop: 4 }}>
          {formatPrice(scooter.pricePerDay)}
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>/day</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
          <Star color="#FFB800" size={12} fill="#FFB800" />
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            {scooter.rating?.toFixed(1) ?? 'New'} ({scooter.reviewCount})
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 }}>
          <MapPin color={colors.textSecondary} size={11} />
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            {scooter.distanceKm === null ? scooter.location : `${scooter.distanceKm} km`}
          </Text>
        </View>
        {scooter.instant && (
          <View style={{ marginTop: 8 }}>
            <Badge label="Instant" variant="success" />
          </View>
        )}
      </View>
    </Pressable>
  );
});

interface ScooterSectionProps {
  scooters: VehicleCardItem[];
  onSeeAll?: () => void;
  onScooterPress?: (id: string) => void;
}

export function ScooterSection({ scooters, onSeeAll, onScooterPress }: ScooterSectionProps) {
  const { colors } = useTheme();
  const { scooterCardWidth, horizontalPadding, scale, isSmallScreen } = useResponsive();
  const imageHeight = Math.round(scooterCardWidth * (120 / 180));
  const snapInterval = scooterCardWidth + SCOOTER_GAP;

  return (
    <View style={{ marginTop: 8, marginBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 8,
        }}
      >
        <Text
          style={{
            ...typography.h3,
            color: colors.textPrimary,
            flex: 1,
            fontSize: isSmallScreen ? scale(14) : undefined,
          }}
          numberOfLines={2}
        >
          🛵 Rent a scooter nearby
        </Text>
        <Pressable onPress={onSeeAll} hitSlop={8} style={{ flexShrink: 0 }}>
          <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            See all →
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -horizontalPadding }}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, gap: SCOOTER_GAP }}
        decelerationRate="fast"
        snapToInterval={snapInterval}
      >
        {scooters.map((scooter) => (
          <ScooterCard
            key={scooter.id}
            scooter={scooter}
            cardWidth={scooterCardWidth}
            imageHeight={imageHeight}
            onPress={onScooterPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}
