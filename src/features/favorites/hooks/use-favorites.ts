import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchFavoriteIds, fetchUserFavorites } from '../api/favorites';
import { fetchGuestFavoriteIds, fetchGuestFavorites } from '../storage/guest-favorites';

export const favoriteQueryKeys = {
  all: ['favorites'] as const,
  list: (userId: string) => ['favorites', userId] as const,
  ids: (userId: string) => ['favorites', userId, 'ids'] as const,
  guestList: ['favorites', 'guest'] as const,
  guestIds: ['favorites', 'guest', 'ids'] as const,
};

export function useFavorites() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: userId ? favoriteQueryKeys.list(userId) : favoriteQueryKeys.guestList,
    queryFn: () => (userId ? fetchUserFavorites(userId) : fetchGuestFavorites()),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });
}

export function useFavoriteIds() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: userId ? favoriteQueryKeys.ids(userId) : favoriteQueryKeys.guestIds,
    queryFn: () => (userId ? fetchFavoriteIds(userId) : fetchGuestFavoriteIds()),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });
}
