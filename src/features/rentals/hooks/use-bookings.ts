import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { getOrCreateBookingConversation } from '@/src/features/chat/api/conversations';
import { notificationQueryKeys } from '@/src/features/notifications/hooks/use-user-notifications';
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
    onSuccess: async (bookingId, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicleDetail(input.vehicleId) });
      queryClient.invalidateQueries({
        queryKey: ['rentals', 'vehicles', input.vehicleId, 'blocked'],
      });

      try {
        await getOrCreateBookingConversation(bookingId);
      } catch {
        // Chat can be started manually from booking detail.
      }

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
    onSuccess: (_data, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.ownerBookings(userId) });
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.bookingDetail(input.bookingId) });

      toast.success('Booking updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not update booking'));
    },
  });
}
