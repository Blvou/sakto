import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/src/lib/errors';
import {
  createBooking,
  fetchOwnerBookings,
  fetchRenterBookings,
  updateBookingStatus,
} from '../api/bookings';
import type { CreateBookingInput, UpdateBookingStatusInput } from '../schemas';
import { rentalQueryKeys } from '../types';

export function useCreateBooking() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => {
      if (!userId) throw new Error('Sign in to request a booking');
      return createBooking(userId, input);
    },
    onSuccess: (_bookingId, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicleDetail(input.vehicleId) });
      toast.success('Booking request sent');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not send booking request'));
    },
  });
}

export function useRenterBookings() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: rentalQueryKeys.renterBookings(userId ?? ''),
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchRenterBookings(userId);
    },
    enabled: !!userId,
  });
}

export function useOwnerBookings() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: rentalQueryKeys.ownerBookings(userId ?? ''),
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchOwnerBookings(userId);
    },
    enabled: !!userId,
  });
}

export function useUpdateBookingStatus() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBookingStatusInput) => {
      if (!userId) throw new Error('Not authenticated');
      return updateBookingStatus(userId, input);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.ownerBookings(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicles });
      toast.success('Booking updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not update booking'));
    },
  });
}
