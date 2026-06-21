import { useMemo } from 'react';
import { useFavoriteIds } from './use-favorites';

export function useIsFavorite(listingId: string | undefined): boolean {
  const { data: favoriteIds = [] } = useFavoriteIds();

  return useMemo(() => {
    if (!listingId) return false;
    return favoriteIds.includes(listingId);
  }, [favoriteIds, listingId]);
}
