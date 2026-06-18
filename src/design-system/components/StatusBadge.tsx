import { Badge } from '@/src/design-system/components/Badge';
import type { BookingStatus } from '@/src/features/rentals/types';

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const BOOKING_STATUS_VARIANT: Record<
  BookingStatus,
  'success' | 'warning' | 'primary' | 'secondary' | 'urgent'
> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'urgent',
  cancelled: 'secondary',
  completed: 'primary',
};

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge label={BOOKING_STATUS_LABEL[status]} variant={BOOKING_STATUS_VARIANT[status]} />;
}

export function getBookingStatusMessage(status: BookingStatus, role: 'renter' | 'owner'): string {
  if (role === 'renter') {
    switch (status) {
      case 'pending':
        return 'Waiting for host confirmation';
    case 'confirmed':
      return 'Ready for pickup — pay host on pickup';
      case 'completed':
        return 'Trip completed';
      case 'declined':
        return 'Request declined';
      case 'cancelled':
        return 'Booking cancelled';
    }
  }

  switch (status) {
    case 'pending':
      return 'New rental request';
    case 'confirmed':
      return 'Mark returned when the bike is back';
    case 'completed':
      return 'Trip completed';
    case 'declined':
      return 'You declined this request';
    case 'cancelled':
      return 'Renter cancelled';
  }
}
