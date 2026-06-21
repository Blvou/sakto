import { useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { useStartBookingConversation } from '@/src/features/chat/hooks/use-start-booking-conversation';
import { BookingListItem } from '@/src/features/rentals/components/BookingListItem';
import { useRenterBookings, useUpdateBookingStatus } from '@/src/features/rentals/hooks/use-bookings';
import type { BookingItem } from '@/src/features/rentals/types';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { ListSkeleton } from '@/src/design-system/components/ListSkeleton';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { useTheme } from '@/src/hooks/use-theme';
import { Calendar } from 'lucide-react-native';

export default function MyBookingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: bookings = [], isLoading, isError, refetch } = useRenterBookings();
  const updateStatus = useUpdateBookingStatus();
  const startBookingChat = useStartBookingConversation();

  const renderItem = useCallback(
    ({ item }: { item: BookingItem }) => (
      <BookingListItem
        booking={item}
        role="renter"
        onPress={(bookingId) => router.push(`/bookings/${bookingId}` as import('expo-router').Href)}
        isUpdating={updateStatus.isPending}
        isMessaging={startBookingChat.isPending}
        onCancel={(bookingId) => updateStatus.mutate({ bookingId, status: 'cancelled' })}
        onMessage={(bookingId) => startBookingChat.mutate(bookingId)}
      />
    ),
    [router, startBookingChat, updateStatus]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My bookings" onBack={() => router.back()} />

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <ListSkeleton count={4} itemHeight={120} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load bookings" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: bookings.length === 0 ? 1 : 0 }}
          ListEmptyComponent={
            <EmptyState
              icon={Calendar}
              title="No bookings yet"
              description="Open a bike and send a rental request to see it here."
              actionLabel="Find bikes"
              onAction={() => router.push('/search' as Href)}
            />
          }
        />
      )}
    </View>
  );
}
