import { memo, useCallback } from 'react';
import { ListingCard } from '@/src/features/home/components/ListingGrid';
import type { ListingCardItem } from '@/src/features/listings/types';
import { useIsFavorite } from '../hooks/use-is-favorite';
import { useToggleFavorite } from '../hooks/use-toggle-favorite';

interface FavoriteListingCardProps {
  listing: ListingCardItem;
  cardWidth: number;
  onPress?: (id: string) => void;
}

export const FavoriteListingCard = memo(function FavoriteListingCard({
  listing,
  cardWidth,
  onPress,
}: FavoriteListingCardProps) {
  const isFavorite = useIsFavorite(listing.id);
  const { mutate: toggleFavorite } = useToggleFavorite();

  const handleLikePress = useCallback(
    (id: string) => {
      toggleFavorite({ listingId: id, isFavorite, listing });
    },
    [isFavorite, listing, toggleFavorite]
  );

  return (
    <ListingCard
      listing={{ ...listing, liked: isFavorite }}
      cardWidth={cardWidth}
      onPress={onPress}
      onLikePress={handleLikePress}
    />
  );
});
