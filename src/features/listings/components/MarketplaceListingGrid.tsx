import { useCallback } from 'react';
import { RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { GRID_GAP } from '@/src/design-system/responsive';
import { FavoriteListingCard } from '@/src/features/favorites/components/FavoriteListingCard';
import type { ListingCardItem } from '@/src/features/listings/types';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface MarketplaceListingGridProps {
  listings: ListingCardItem[];
  isRefetching: boolean;
  onRefresh: () => void;
  onListingPress: (id: string) => void;
  onEndReached: () => void;
  listEmptyComponent: React.ReactElement | null;
}

export function MarketplaceListingGrid({
  listings,
  isRefetching,
  onRefresh,
  onListingPress,
  onEndReached,
  listEmptyComponent,
}: MarketplaceListingGridProps) {
  const { colors } = useTheme();
  const { cardWidth, horizontalPadding, listBottomPadding } = useResponsive();

  const renderItem = useCallback(
    ({ item, index }: { item: ListingCardItem; index: number }) => (
      <View
        style={{
          width: cardWidth,
          marginBottom: 16,
          marginRight: index % 2 === 0 ? GRID_GAP : 0,
        }}
      >
        <FavoriteListingCard listing={item} cardWidth={cardWidth} onPress={onListingPress} />
      </View>
    ),
    [cardWidth, onListingPress]
  );

  return (
    <FlashList
      data={listings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 16,
        paddingBottom: listBottomPadding,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={listEmptyComponent}
    />
  );
}
