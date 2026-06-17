import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { updateListing } from '../api/listings';
import type { UpdateListingInput } from '../schemas';
import { listingQueryKeys } from '../types';

interface UpdateListingParams {
  listingId: string;
  input: UpdateListingInput;
}

export function useUpdateListing() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ listingId, input }: UpdateListingParams) => {
      if (!userId) throw new Error('Sign in to edit a listing');
      await updateListing(listingId, userId, input);
      return listingId;
    },
    onSuccess: (listingId) => {
      queryClient.invalidateQueries({ queryKey: listingQueryKeys.list });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: listingQueryKeys.mine(userId) });
      }
      queryClient.invalidateQueries({ queryKey: listingQueryKeys.detail(listingId) });
      toast.success('Listing updated');
      router.replace(`/listing/${listingId}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not update listing'));
    },
  });
}
