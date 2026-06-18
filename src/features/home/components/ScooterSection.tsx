import { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';
import { VehicleCard } from '@/src/features/rentals/components/VehicleCard';
import type { VehicleCardItem } from '@/src/features/rentals/types';

const SCOOTER_GAP = 12;

interface ScooterSectionProps {
  scooters: VehicleCardItem[];
  onSeeAll?: () => void;
  onScooterPress?: (id: string) => void;
  title?: string;
}

export function ScooterSection({
  scooters,
  onSeeAll,
  onScooterPress,
  title = '🛵 Featured bikes nearby',
}: ScooterSectionProps) {
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
          {title}
        </Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8} style={{ flexShrink: 0 }}>
            <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              See all →
            </Text>
          </Pressable>
        ) : null}
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
          <VehicleCard
            key={scooter.id}
            vehicle={scooter}
            cardWidth={scooterCardWidth}
            imageHeight={imageHeight}
            onPress={onScooterPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export const VehicleGridCard = memo(function VehicleGridCard({
  vehicle,
  cardWidth,
  onPress,
}: {
  vehicle: VehicleCardItem;
  cardWidth: number;
  onPress?: (id: string) => void;
}) {
  const handlePress = useCallback(() => onPress?.(vehicle.id), [onPress, vehicle.id]);

  return (
    <VehicleCard vehicle={vehicle} cardWidth={cardWidth} onPress={handlePress} />
  );
});
