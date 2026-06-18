import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getErrorMessage } from '@/src/lib/errors';
import { useNotificationsStore } from '@/src/stores/notifications-store';
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
  const addNotification = useNotificationsStore((s) => s.add);

  return useMutation({
    mutationFn: (input: CreateBookingInput) => {
      if (!userId) throw new Error('Sign in to request a booking');
      return createBooking(userId, input);
    },
    onSuccess: (bookingId, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicleDetail(input.vehicleId) });
      queryClient.invalidateQueries({
        queryKey: ['rentals', 'vehicles', input.vehicleId, 'blocked'],
      });
      addNotification({
        title: 'Booking request sent',
        body: 'Waiting for the host to confirm your rental.',
        href: `/bookings/${bookingId}`,
      });
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
  const addNotification = useNotificationsStore((s) => s.add);

  return useMutation({
    mutationFn: (input: UpdateBookingStatusInput) => {
      if (!userId) throw new Error('Not authenticated');
      return updateBookingStatus(userId, input);
    },
    onSuccess: (_data, input) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.renterBookings(userId) });
        queryClient.invalidateQueries({ queryKey: rentalQueryKeys.ownerBookings(userId) });
      }
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.bookingDetail(input.bookingId) });

      const statusMessages: Partial<Record<UpdateBookingStatusInput['status'], { title: string; body: string }>> = {
        confirmed: { title: 'Booking confirmed', body: 'Your rental is ready for pickup.' },
        declined: { title: 'Request declined', body: 'The host declined this rental request.' },
        cancelled: { title: 'Booking cancelled', body: 'This rental request was cancelled.' },
      };
      const message = statusMessages[input.status];
      if (message) {
        addNotification({
          ...message,
          href: `/bookings/${input.bookingId}`,
        });
      }

      toast.success('Booking updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not update booking'));
    },
  });
}
