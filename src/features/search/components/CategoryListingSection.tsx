import { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useScreenDimensions } from '@/src/design-system/responsive';
import { typography } from '@/src/design-system/tokens';
import { ListingCard } from '@/src/features/home/components/ListingGrid';
import type { ListingCardItem } from '@/src/features/listings/types';

interface CategoryListingSectionProps {
  title: string;
  emoji: string;
  listings: ListingCardItem[];
  cardWidth: number;
  onListingPress: (id: string) => void;
  onSeeAllPress?: (categoryId: string) => void;
  categoryId: string;
}

export const CategoryListingSection = memo(function CategoryListingSection({
  title,
  emoji,
  listings,
  cardWidth,
  onListingPress,
  onSeeAllPress,
  categoryId,
}: CategoryListingSectionProps) {
  const { colors } = useTheme();
  const { horizontalPadding } = useScreenDimensions();

  const handleSeeAll = useCallback(() => {
    onSeeAllPress?.(categoryId);
  }, [categoryId, onSeeAllPress]);

  if (!listings.length) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: horizontalPadding,
          marginBottom: 10,
        }}
      >
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>
          {emoji} {title}
        </Text>
        {onSeeAllPress && (
          <Pressable onPress={handleSeeAll} hitSlop={8}>
            <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              See all
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          gap: 12,
        }}
      >
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            cardWidth={cardWidth}
            onPress={onListingPress}
          />
        ))}
      </ScrollView>
    </View>
  );
});
