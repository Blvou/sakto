import { useMemo } from 'react';
import { useOwnerBookings, useRenterBookings } from '@/src/features/rentals/hooks/use-bookings';

export function useProfileStats() {
  const { data: renterBookings = [] } = useRenterBookings();
  const { data: ownerBookings = [] } = useOwnerBookings();

  return useMemo(() => {
    const trips = renterBookings.filter((b) => b.status === 'completed').length;
    const pendingRequests = ownerBookings.filter((b) => b.status === 'pending').length;
    const upcomingTrips = renterBookings.filter((b) => b.status === 'confirmed').length;

    return {
      trips,
      pendingRequests,
      upcomingTrips,
      rating: null as number | null,
    };
  }, [ownerBookings, renterBookings]);
}
