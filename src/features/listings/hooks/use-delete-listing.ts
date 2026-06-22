import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { deleteListing } from '../api/listings';
import { listingQueryKeys } from '../types';

interface DeleteListingVariables {
  listingId: string;
  stayOnScreen?: boolean;
}

export function useDeleteListing() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ listingId }: DeleteListingVariables) => {
      if (!userId) throw new Error('Sign in to delete a listing');
      await deleteListing(listingId, userId);
      return listingId;
    },
    onSuccess: (listingId, variables) => {
      queryClient.invalidateQueries({ queryKey: listingQueryKeys.list });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: listingQueryKeys.mine(userId) });
      }
      queryClient.removeQueries({ queryKey: listingQueryKeys.detail(listingId) });
      toast.success('Listing deleted');

      if (variables.stayOnScreen) return;

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not delete listing'));
    },
  });
}
