import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { BookingListItem } from '@/src/features/rentals/components/BookingListItem';
import { useOwnerBookings, useUpdateBookingStatus } from '@/src/features/rentals/hooks/use-bookings';
import type { BookingItem } from '@/src/features/rentals/types';
import { useTheme } from '@/src/hooks/use-theme';

export default function OwnerBookingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: bookings = [], isLoading, isError, refetch } = useOwnerBookings();
  const updateStatus = useUpdateBookingStatus();

  const renderItem = useCallback(
    ({ item }: { item: BookingItem }) => (
      <BookingListItem
        booking={item}
        role="owner"
        isUpdating={updateStatus.isPending}
        onConfirm={(bookingId) => updateStatus.mutate({ bookingId, status: 'confirmed' })}
        onDecline={(bookingId) => updateStatus.mutate({ bookingId, status: 'declined' })}
      />
    ),
    [updateStatus]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          >
            <ArrowLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text style={{ ...typography.h1, color: colors.textPrimary, flex: 1 }}>Rental requests</Text>
        </View>
        <Text style={{ ...typography.body, color: colors.textSecondary }}>
          Approve or decline incoming requests for your bikes.
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
            Could not load rental requests.
          </Text>
          <Pressable onPress={() => refetch()} style={{ marginTop: 12 }}>
            <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={
            <View style={{ paddingTop: 64, alignItems: 'center' }}>
              <Text style={{ ...typography.h3, color: colors.textPrimary }}>No requests yet</Text>
              <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
                New rental requests will appear here after renters request your bike.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
