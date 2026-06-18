import { memo, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SectionHeader } from '@/src/design-system/components/SectionHeader';
import { useResponsive } from '@/src/hooks/use-responsive';
import { VehicleCard } from '@/src/features/rentals/components/VehicleCard';
import type { VehicleCardItem } from '@/src/features/rentals/types';

const SCOOTER_GAP = 12;

interface ScooterSectionProps {
  scooters: VehicleCardItem[];
  onSeeAll?: () => void;
  onMapPress?: () => void;
  onScooterPress?: (id: string) => void;
  title?: string;
}

export function ScooterSection({
  scooters,
  onSeeAll,
  onMapPress,
  onScooterPress,
  title = '🛵 Featured bikes nearby',
}: ScooterSectionProps) {
  const { scooterCardWidth, horizontalPadding } = useResponsive();
  const imageHeight = Math.round(scooterCardWidth * (120 / 180));
  const snapInterval = scooterCardWidth + SCOOTER_GAP;

  return (
    <View style={{ marginTop: 8, marginBottom: 16 }}>
      <SectionHeader
        title={title}
        secondaryActionLabel={onMapPress ? 'Map' : undefined}
        onSecondaryActionPress={onMapPress}
        actionLabel={onSeeAll ? 'See all →' : undefined}
        onActionPress={onSeeAll}
      />

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
