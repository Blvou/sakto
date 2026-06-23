import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import type { ListingCardItem } from '@/src/features/listings/types';
import { getErrorMessage } from '@/src/lib/errors';
import { toggleFavorite } from '../api/favorites';
import { toggleGuestFavorite } from '../storage/guest-favorites';
import { favoriteQueryKeys } from './use-favorites';

interface ToggleFavoriteInput {
  listingId: string;
  isFavorite: boolean;
  listing?: ListingCardItem;
}

export function useToggleFavorite() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const idsKey = userId ? favoriteQueryKeys.ids(userId) : favoriteQueryKeys.guestIds;
  const listKey = userId ? favoriteQueryKeys.list(userId) : favoriteQueryKeys.guestList;

  return useMutation({
    mutationFn: async ({ listingId, isFavorite, listing }: ToggleFavoriteInput) => {
      if (userId) {
        return toggleFavorite(userId, listingId, isFavorite);
      }
      return toggleGuestFavorite(listingId, isFavorite, listing);
    },
    onMutate: async ({ listingId, isFavorite, listing }) => {
      await queryClient.cancelQueries({ queryKey: idsKey });
      await queryClient.cancelQueries({ queryKey: listKey });

      const previousIds = queryClient.getQueryData<string[]>(idsKey) ?? [];
      const previousList = queryClient.getQueryData<ListingCardItem[]>(listKey) ?? [];

      const nextIds = isFavorite
        ? previousIds.filter((id) => id !== listingId)
        : [listingId, ...previousIds.filter((id) => id !== listingId)];

      const nextList = isFavorite
        ? previousList.filter((item) => item.id !== listingId)
        : listing
          ? [{ ...listing, liked: true }, ...previousList.filter((item) => item.id !== listingId)]
          : previousList;

      queryClient.setQueryData(idsKey, nextIds);
      queryClient.setQueryData(listKey, nextList);

      return { previousIds, previousList };
    },
    onError: (err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(idsKey, context.previousIds);
      queryClient.setQueryData(listKey, context.previousList);
      toast.error(getErrorMessage(err, 'Could not update favorites'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
      void queryClient.invalidateQueries({ queryKey: idsKey });
    },
  });
}
