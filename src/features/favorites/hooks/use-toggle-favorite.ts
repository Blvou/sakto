import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import type { ListingCardItem } from '@/src/features/listings/types';
import { getErrorMessage } from '@/src/lib/errors';
import { toggleFavorite } from '../api/favorites';
import { favoriteQueryKeys } from './use-favorites';

interface ToggleFavoriteInput {
  listingId: string;
  isFavorite: boolean;
  listing?: ListingCardItem;
}

export function useToggleFavorite() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: ToggleFavoriteInput) => {
      if (!userId) throw new Error('Not authenticated');
      return toggleFavorite(userId, listingId, isFavorite);
    },
    onMutate: async ({ listingId, isFavorite, listing }) => {
      if (!userId) return;

      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.ids(userId) });
      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.list(userId) });

      const previousIds = queryClient.getQueryData<string[]>(favoriteQueryKeys.ids(userId)) ?? [];
      const previousList =
        queryClient.getQueryData<ListingCardItem[]>(favoriteQueryKeys.list(userId)) ?? [];

      const nextIds = isFavorite
        ? previousIds.filter((id) => id !== listingId)
        : [listingId, ...previousIds.filter((id) => id !== listingId)];

      const nextList = isFavorite
        ? previousList.filter((item) => item.id !== listingId)
        : listing
          ? [{ ...listing, liked: true }, ...previousList.filter((item) => item.id !== listingId)]
          : previousList;

      queryClient.setQueryData(favoriteQueryKeys.ids(userId), nextIds);
      queryClient.setQueryData(favoriteQueryKeys.list(userId), nextList);

      return { previousIds, previousList };
    },
    onError: (err, _vars, context) => {
      if (!userId || !context) return;
      queryClient.setQueryData(favoriteQueryKeys.ids(userId), context.previousIds);
      queryClient.setQueryData(favoriteQueryKeys.list(userId), context.previousList);
      toast.error(getErrorMessage(err, 'Could not update favorites'));
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.ids(userId) });
    },
  });
}
