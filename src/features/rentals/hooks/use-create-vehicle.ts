import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/src/lib/errors';
import { uploadVehiclePhotos } from '../api/vehicle-photos';
import { createVehicle } from '../api/vehicles';
import type { CreateVehicleMutationInput } from '../schemas';
import { rentalQueryKeys } from '../types';

export function useCreateVehicle() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateVehicleMutationInput) => {
      if (!userId) throw new Error('Sign in to list a bike');

      const { photoUris, ...vehicleInput } = input;
      const photoPaths = await uploadVehiclePhotos(userId, photoUris);

      return createVehicle(userId, {
        ...vehicleInput,
        photoPaths,
      });
    },
    onSuccess: (vehicleId) => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicles });
      toast.success('Bike listed for rent');
      router.replace(`/scooter/${vehicleId}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not list bike'));
    },
  });
}
