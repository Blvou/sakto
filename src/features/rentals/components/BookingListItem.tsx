import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Badge } from '@/src/design-system/components/Badge';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { useTheme } from '@/src/hooks/use-theme';
import { getVehiclePhotoSource } from '../api/vehicles';
import type { BookingItem, BookingStatus } from '../types';

const statusVariant: Record<BookingStatus, 'success' | 'warning' | 'primary' | 'secondary' | 'urgent'> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'urgent',
  cancelled: 'secondary',
  completed: 'primary',
};

interface BookingListItemProps {
  booking: BookingItem;
  role: 'renter' | 'owner';
  onConfirm?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  isUpdating?: boolean;
}

export const BookingListItem = memo(function BookingListItem({
  booking,
  role,
  onConfirm,
  onDecline,
  onCancel,
  isUpdating = false,
}: BookingListItemProps) {
  const { colors } = useTheme();
  const cover = booking.vehicle.photos[0];
  const image = getVehiclePhotoSource(cover?.storage_path);
  const canOwnerAct = role === 'owner' && booking.status === 'pending';
  const canRenterCancel =
    role === 'renter' && (booking.status === 'pending' || booking.status === 'confirmed');

  const handleConfirm = useCallback(() => onConfirm?.(booking.id), [booking.id, onConfirm]);
  const handleDecline = useCallback(() => onDecline?.(booking.id), [booking.id, onDecline]);
  const handleCancel = useCallback(() => onCancel?.(booking.id), [booking.id, onCancel]);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Image
          source={image}
          style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: colors.border }}
          contentFit="cover"
          cachePolicy={typeof image === 'object' ? 'memory-disk' : undefined}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
              {booking.vehicle.title}
            </Text>
            <Badge label={booking.status} variant={statusVariant[booking.status]} />
          </View>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
            {booking.start_date} - {booking.end_date} • {booking.days}d
          </Text>
          <Text style={{ ...typography.priceSm, color: colors.primary, marginTop: 6 }}>
            {formatPrice(Number(booking.total_amount))}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
            {role === 'owner'
              ? `Renter: ${booking.renter?.display_name ?? 'Sakto user'}`
              : `Owner: ${booking.owner?.display_name ?? 'Sakto user'}`}
          </Text>
        </View>
      </View>

      {booking.message ? (
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 10 }}>
          {booking.message}
        </Text>
      ) : null}

      {(canOwnerAct || canRenterCancel) && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {canOwnerAct && (
            <>
              <Pressable
                onPress={handleConfirm}
                disabled={isUpdating}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.success,
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
                  Confirm
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDecline}
                disabled={isUpdating}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.border,
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_700Bold' }}>
                  Decline
                </Text>
              </Pressable>
            </>
          )}
          {canRenterCancel && (
            <Pressable
              onPress={handleCancel}
              disabled={isUpdating}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.border,
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_700Bold' }}>
                Cancel request
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
});
