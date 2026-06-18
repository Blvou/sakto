import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { useStartBookingConversation } from '@/src/features/chat/hooks/use-start-booking-conversation';
import { BookingListItem } from '@/src/features/rentals/components/BookingListItem';
import { useOwnerBookings, useUpdateBookingStatus } from '@/src/features/rentals/hooks/use-bookings';
import type { BookingItem } from '@/src/features/rentals/types';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { ListSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { SegmentedControl } from '@/src/design-system/components/SegmentedControl';
import { useTheme } from '@/src/hooks/use-theme';

const SEGMENTS = ['Pending', 'Upcoming', 'Past'] as const;
type OwnerSegment = (typeof SEGMENTS)[number];

function filterBookings(bookings: BookingItem[], segment: OwnerSegment): BookingItem[] {
  switch (segment) {
    case 'Pending':
      return bookings.filter((b) => b.status === 'pending');
    case 'Upcoming':
      return bookings.filter((b) => b.status === 'confirmed');
    case 'Past':
      return bookings.filter((b) =>
        ['completed', 'declined', 'cancelled'].includes(b.status)
      );
    default:
      return bookings;
  }
}

export default function OwnerBookingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [segment, setSegment] = useState<OwnerSegment>('Pending');
  const { data: bookings = [], isLoading, isError, refetch } = useOwnerBookings();
  const updateStatus = useUpdateBookingStatus();
  const startBookingChat = useStartBookingConversation();

  const filtered = useMemo(() => filterBookings(bookings, segment), [bookings, segment]);
  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings]
  );

  const renderItem = useCallback(
    ({ item }: { item: BookingItem }) => (
      <BookingListItem
        booking={item}
        role="owner"
        onPress={(bookingId) => router.push(`/bookings/${bookingId}` as import('expo-router').Href)}
        isUpdating={updateStatus.isPending}
        isMessaging={startBookingChat.isPending}
        onConfirm={(bookingId) => updateStatus.mutate({ bookingId, status: 'confirmed' })}
        onDecline={(bookingId) => updateStatus.mutate({ bookingId, status: 'declined' })}
        onMessage={(bookingId) => startBookingChat.mutate(bookingId)}
      />
    ),
    [router, startBookingChat, updateStatus]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Rental requests"
        onBack={() => router.back()}
        subtitle={pendingCount > 0 ? `${pendingCount} pending` : undefined}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <ListSkeleton count={4} itemHeight={120} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load requests" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: filtered.length === 0 ? 1 : 0 }}
          ListEmptyComponent={
            <EmptyState
              icon={Inbox}
              title={`No ${segment.toLowerCase()} requests`}
              description="New rental requests will appear here after renters request your bike."
              actionLabel="My bikes"
              onAction={() => router.push('/my-listings')}
            />
          }
        />
      )}
    </View>
  );
}
