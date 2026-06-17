import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/src/lib/errors';
import { createVehicle } from '../api/vehicles';
import type { CreateVehicleInput } from '../schemas';
import { rentalQueryKeys } from '../types';

export function useCreateVehicle() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateVehicleInput) => {
      if (!userId) throw new Error('Sign in to list a bike');
      return createVehicle(userId, input);
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
