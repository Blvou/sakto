import { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MapPin } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import { Badge } from '@/src/design-system/components/Badge';
import type { ListingCardItem } from '@/src/features/listings/types';
import { formatPrice } from '../data/mock-data';

interface ListingCardProps {
  listing: ListingCardItem;
  cardWidth: number;
  onPress?: (id: string) => void;
  onLikePress?: (id: string) => void;
}

export const ListingCard = memo(function ListingCard({
  listing,
  cardWidth,
  onPress,
  onLikePress,
}: ListingCardProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle();
  const isRemoteImage = typeof listing.image === 'object' && 'uri' in listing.image;

  const handlePress = useCallback(() => onPress?.(listing.id), [onPress, listing.id]);
  const handleLikePress = useCallback(() => onLikePress?.(listing.id), [onLikePress, listing.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: cardWidth,
        marginBottom: 16,
      }}
    >
      <View style={{ ...cardStyle, overflow: 'hidden' }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={listing.image}
            style={{
              width: cardWidth,
              height: cardWidth,
              backgroundColor: colors.border,
            }}
            contentFit="cover"
            transition={200}
            recyclingKey={listing.id}
            cachePolicy={isRemoteImage ? 'memory-disk' : undefined}
            accessibilityLabel={listing.title}
          />
          {listing.badge && (
            <View style={{ position: 'absolute', top: 8, left: 8 }}>
              <Badge label={listing.badge === 'urgent' ? 'Urgent' : 'Top'} variant={listing.badge} />
            </View>
          )}
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleLikePress();
            }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={4}
          >
            <Heart
              color={listing.liked ? colors.secondary : '#FFFFFF'}
              fill={listing.liked ? colors.secondary : 'transparent'}
              size={20}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 8, paddingBottom: 10, paddingTop: 8 }}>
          <Text style={{ ...typography.priceSm, color: colors.primary }}>
            {formatPrice(listing.price)}
          </Text>
          <Text
            style={{ ...typography.body, color: colors.textPrimary, marginTop: 2 }}
            numberOfLines={2}
          >
            {listing.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 }}>
            <MapPin color={colors.textSecondary} size={11} />
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>
              {listing.location} • {listing.timeAgo}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const FILTERS = ['New', 'Nearby', 'Cheapest'] as const;

interface ListingFiltersProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function ListingFilters({ activeFilter = 'New', onFilterChange }: ListingFiltersProps) {
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();

  const filterControls = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {FILTERS.map((filter, i) => (
        <Pressable key={filter} onPress={() => onFilterChange?.(filter)} hitSlop={4}>
          <Text
            style={{
              ...typography.caption,
              color: activeFilter === filter ? colors.primary : colors.textSecondary,
              fontFamily:
                activeFilter === filter ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
            }}
          >
            {filter}
            {i < FILTERS.length - 1 ? '  |  ' : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (isSmallScreen) {
    return (
      <View style={{ marginBottom: 12, gap: 8 }}>
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>✨ Recommended</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterControls}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
      }}
    >
      <Text style={{ ...typography.h3, color: colors.textPrimary, flexShrink: 1 }} numberOfLines={1}>
        ✨ Recommended
      </Text>
      {filterControls}
    </View>
  );
}

interface ListingGridProps {
  listings: ListingCardItem[];
  cardWidth: number;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onListingPress?: (id: string) => void;
}

/** @deprecated Use FlashList on Home screen with ListingCard + ListingFilters */
export function ListingGrid({
  listings,
  cardWidth,
  activeFilter = 'New',
  onFilterChange,
  onListingPress,
}: ListingGridProps) {
  return (
    <View>
      <ListingFilters activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            cardWidth={cardWidth}
            onPress={onListingPress}
          />
        ))}
      </View>
    </View>
  );
}
