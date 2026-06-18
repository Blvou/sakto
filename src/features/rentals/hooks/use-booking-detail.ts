import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchBookingById } from '../api/bookings';
import { rentalQueryKeys } from '../types';

export function useBookingDetail(bookingId: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: rentalQueryKeys.bookingDetail(bookingId),
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchBookingById(bookingId, userId);
    },
    enabled: !!userId && !!bookingId,
  });
}
