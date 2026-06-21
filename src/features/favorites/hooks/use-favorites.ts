import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchFavoriteIds, fetchUserFavorites } from '../api/favorites';

export const favoriteQueryKeys = {
  all: ['favorites'] as const,
  list: (userId: string) => ['favorites', userId] as const,
  ids: (userId: string) => ['favorites', userId, 'ids'] as const,
};

export function useFavorites() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: favoriteQueryKeys.list(userId ?? ''),
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchUserFavorites(userId);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useFavoriteIds() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: favoriteQueryKeys.ids(userId ?? ''),
    queryFn: () => {
      if (!userId) return [] as string[];
      return fetchFavoriteIds(userId);
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}
