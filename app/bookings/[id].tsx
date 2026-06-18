import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, MessageCircle, Navigation } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { StatusBadge, getBookingStatusMessage } from '@/src/design-system/components/StatusBadge';
import { Avatar } from '@/src/design-system/components/Avatar';
import { useStartBookingConversation } from '@/src/features/chat/hooks/use-start-booking-conversation';
import { BookingTimeline } from '@/src/features/rentals/components/BookingTimeline';
import { getVehiclePhotoSource } from '@/src/features/rentals/api/vehicles';
import { useBookingDetail } from '@/src/features/rentals/hooks/use-booking-detail';
import { useUpdateBookingStatus } from '@/src/features/rentals/hooks/use-bookings';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { openMapsNavigation } from '@/src/lib/maps';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const cardStyle = useCardStyle({ borderRadius: 16 });
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id ?? '');
  const updateStatus = useUpdateBookingStatus();
  const startChat = useStartBookingConversation();

  const role = useMemo(() => {
    if (!booking || !userId) return 'renter' as const;
    return booking.owner_id === userId ? ('owner' as const) : ('renter' as const);
  }, [booking, userId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Booking" onBack={() => router.back()} />
        <ErrorState title="Booking not found" onRetry={() => refetch()} />
      </View>
    );
  }

  const cover = booking.vehicle.photos[0];
  const image = getVehiclePhotoSource(cover?.storage_path, booking.vehicle.id);
  const counterparty = role === 'owner' ? booking.renter : booking.owner;
  const canOwnerAct = role === 'owner' && booking.status === 'pending';
  const canRenterCancel =
    role === 'renter' && (booking.status === 'pending' || booking.status === 'confirmed');

  const handleNavigate = () => {
    if (booking.vehicle.lat != null && booking.vehicle.lng != null) {
      void openMapsNavigation(
        { latitude: booking.vehicle.lat, longitude: booking.vehicle.lng },
        booking.vehicle.title
      );
      return;
    }
    toast.error('Pickup location is not available');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Booking details" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12, padding: 12, ...cardStyle }}>
          <Image
            source={image}
            style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: colors.border }}
            contentFit="cover"
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1 }} numberOfLines={2}>
                {booking.vehicle.title}
              </Text>
              <StatusBadge status={booking.status} />
            </View>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
              {booking.start_date} – {booking.end_date} • {booking.days}d
            </Text>
            <Text style={{ ...typography.price, color: colors.primary, marginTop: 6 }}>
              {formatPrice(Number(booking.total_amount))}
            </Text>
          </View>
        </View>

        <View style={{ padding: 16, ...cardStyle }}>
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            {getBookingStatusMessage(booking.status, role)}
          </Text>
          <View style={{ marginTop: 16 }}>
            <BookingTimeline status={booking.status} />
          </View>
        </View>

        <View style={{ padding: 16, ...cardStyle }}>
          <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 12 }}>
            {role === 'owner' ? 'Renter' : 'Host'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={counterparty?.avatar_url} name={counterparty?.display_name ?? 'User'} size={48} />
            <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              {counterparty?.display_name ?? 'Sakto user'}
            </Text>
          </View>
        </View>

        <View style={{ padding: 16, ...cardStyle }}>
          <Text style={{ ...typography.h3, color: colors.textPrimary, marginBottom: 8 }}>Pickup</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MapPin color={colors.textSecondary} size={14} />
            <Text style={{ ...typography.body, color: colors.textSecondary, flex: 1 }}>
              {booking.vehicle.location}
            </Text>
          </View>
          <Text style={{ ...typography.caption, color: colors.warning, marginTop: 12 }}>
            Pay on pickup — no online payment in MVP.
          </Text>
        </View>

        {booking.status === 'completed' ? (
          <View style={{ padding: 16, ...cardStyle }}>
            <Text style={{ ...typography.h3, color: colors.textPrimary }}>Leave a review</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 6 }}>
              Reviews coming soon — rate your trip after pickup.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          paddingBottom: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => startChat.mutate(booking.id)}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              backgroundColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <MessageCircle color="#FFF" size={18} />
            <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
              Message
            </Text>
          </Pressable>
          <Pressable
            onPress={handleNavigate}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Navigation color={colors.primary} size={18} />
            <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Navigate
            </Text>
          </Pressable>
        </View>

        {canOwnerAct ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => updateStatus.mutate({ bookingId: booking.id, status: 'confirmed' })}
              style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>Confirm</Text>
            </Pressable>
            <Pressable
              onPress={() => updateStatus.mutate({ bookingId: booking.id, status: 'declined' })}
              style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: colors.textPrimary, fontFamily: 'PlusJakartaSans_700Bold' }}>Decline</Text>
            </Pressable>
          </View>
        ) : null}

        {canRenterCancel ? (
          <Pressable
            onPress={() => updateStatus.mutate({ bookingId: booking.id, status: 'cancelled' })}
            style={{ minHeight: 48, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: colors.textPrimary, fontFamily: 'PlusJakartaSans_700Bold' }}>Cancel request</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
