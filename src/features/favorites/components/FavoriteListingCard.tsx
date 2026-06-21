import { memo, useCallback } from 'react';
import type { Href } from 'expo-router';
import { ListingCard } from '@/src/features/home/components/ListingGrid';
import type { ListingCardItem } from '@/src/features/listings/types';
import { useIsFavorite } from '../hooks/use-is-favorite';
import { useToggleFavorite } from '../hooks/use-toggle-favorite';
import { useRequireAuth } from '@/src/hooks/use-require-auth';

interface FavoriteListingCardProps {
  listing: ListingCardItem;
  cardWidth: number;
  onPress?: (id: string) => void;
  returnTo?: Href;
}

export const FavoriteListingCard = memo(function FavoriteListingCard({
  listing,
  cardWidth,
  onPress,
  returnTo = '/(tabs)',
}: FavoriteListingCardProps) {
  const requireAuth = useRequireAuth();
  const isFavorite = useIsFavorite(listing.id);
  const { mutate: toggleFavorite } = useToggleFavorite();

  const handleLikePress = useCallback(
    (id: string) => {
      if (!requireAuth({ message: 'Sign in to save favorites', returnTo })) {
        return;
      }
      toggleFavorite({ listingId: id, isFavorite, listing });
    },
    [isFavorite, requireAuth, returnTo, toggleFavorite]
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
