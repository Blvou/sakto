import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { uploadListingPhotos } from '../api/listing-photos';
import { createListing } from '../api/listings';
import type { CreateListingMutationInput } from '../schemas';
import { listingQueryKeys } from '../types';

export function useCreateListing() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateListingMutationInput) => {
      if (!userId) throw new Error('Sign in to publish a listing');

      const { photos, ...listingInput } = input;
      const photoUrls = await uploadListingPhotos(
        userId,
        photos.map((photo) => photo.uri)
      );

      return createListing(userId, listingInput, photoUrls);
    },
    onSuccess: (listingId) => {
      queryClient.invalidateQueries({ queryKey: listingQueryKeys.list });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: listingQueryKeys.mine(userId) });
        queryClient.invalidateQueries({ queryKey: listingQueryKeys.stats(userId) });
      }
      toast.success('Listing published');
      router.replace(`/listing/${listingId}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not publish listing'));
    },
  });
}
