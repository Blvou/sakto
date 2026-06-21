import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { toggleFavorite } from '../api/favorites';
import { favoriteQueryKeys } from './use-favorites';

export function useToggleFavorite() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      isFavorite,
    }: {
      listingId: string;
      isFavorite: boolean;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return toggleFavorite(userId, listingId, isFavorite);
    },
    onMutate: async ({ listingId, isFavorite }) => {
      if (!userId) return;

      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.ids(userId) });
      const previousIds = queryClient.getQueryData<string[]>(favoriteQueryKeys.ids(userId)) ?? [];

      const nextIds = isFavorite
        ? previousIds.filter((id) => id !== listingId)
        : [listingId, ...previousIds.filter((id) => id !== listingId)];

      queryClient.setQueryData(favoriteQueryKeys.ids(userId), nextIds);
      return { previousIds };
    },
    onError: (_err, _vars, context) => {
      if (!userId || !context) return;
      queryClient.setQueryData(favoriteQueryKeys.ids(userId), context.previousIds);
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.ids(userId) });
    },
  });
}
