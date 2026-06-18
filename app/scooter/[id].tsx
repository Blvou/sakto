import { useMemo, useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Calendar, MapPin, Navigation, Star } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { Avatar } from '@/src/design-system/components/Avatar';
import { Badge } from '@/src/design-system/components/Badge';
import { typography } from '@/src/design-system/tokens';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { scooters, formatPrice } from '@/src/features/home/data/mock-data';
import { getVehiclePhotoSource, mockVehicleCards } from '@/src/features/rentals/api/vehicles';
import { VehicleLocationMap } from '@/src/features/rentals/components/VehicleLocationMap';
import { AvailabilityCalendar } from '@/src/features/rentals/components/AvailabilityCalendar';
import { useCreateBooking } from '@/src/features/rentals/hooks/use-bookings';
import { useVehicleBlockedDates } from '@/src/features/rentals/hooks/use-vehicle-blocked-dates';
import { useVehicle } from '@/src/features/rentals/hooks/use-vehicles';
import { createBookingSchema } from '@/src/features/rentals/schemas';
import {
  addDays,
  buildDateRange,
  formatDateChip,
  isDateBlocked,
  isRangeBlocked,
  toDateOnly,
} from '@/src/features/rentals/utils/date-availability';
import { useTheme } from '@/src/hooks/use-theme';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { openMapsNavigation, resolveVehicleCoordinates } from '@/src/lib/maps';
import { isSupabaseConfigured } from '@/src/lib/supabase';

const DATE_HORIZON_DAYS = 30;

export default function ScooterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const { userId } = useAuth();
  const [selectedDays, setSelectedDays] = useState(1);
  const [startDate, setStartDate] = useState(toDateOnly(new Date()));
  const [refreshing, setRefreshing] = useState(false);
  const createBooking = useCreateBooking();
  const vehicleQuery = useVehicle(id);

  const mockScooter = scooters.find((s) => s.id === id) ?? scooters[0];
  const vehicle = vehicleQuery.data;
  const isMock = !isSupabaseConfigured || id.startsWith('s');
  const blockedDatesQuery = useVehicleBlockedDates(isMock ? undefined : id, DATE_HORIZON_DAYS);

  const detail = useMemo(() => {
    if (vehicle) {
      return {
        title: vehicle.title,
        model: `${vehicle.brand} ${vehicle.model}`,
        pricePerDay: Number(vehicle.price_per_day),
        rating: null,
        reviewCount: 0,
        location: vehicle.location,
        instant: vehicle.instant_booking,
        image: getVehiclePhotoSource(vehicle.photos[0]?.storage_path),
        ownerId: vehicle.owner_id,
        description: vehicle.description,
      };
    }

    return {
      title: mockScooter.model,
      model: mockScooter.model,
      pricePerDay: mockScooter.pricePerDay,
      rating: mockScooter.rating,
      reviewCount: mockScooter.reviewCount,
      location: `${mockScooter.distanceKm} km away - Ermita, Manila`,
      instant: mockScooter.instant,
      image: mockScooter.image,
      ownerId: null,
      description: 'A clean, city-friendly scooter for short daily rentals.',
    };
  }, [mockScooter, vehicle]);

  const serviceFee = 50;
  const total = detail.pricePerDay * selectedDays;
  const endDate = toDateOnly(addDays(new Date(`${startDate}T00:00:00.000Z`), selectedDays - 1));
  const blockedDates = useMemo(
    () => new Set(blockedDatesQuery.data ?? []),
    [blockedDatesQuery.data]
  );
  const dateOptions = useMemo(() => buildDateRange(new Date(), DATE_HORIZON_DAYS), []);
  const isSelectedRangeBlocked = isRangeBlocked(startDate, selectedDays, blockedDates);
  const isOwnVehicle = !!userId && detail.ownerId === userId;
  const canBook =
    !isMock && !!vehicle && !isOwnVehicle && !createBooking.isPending && !isSelectedRangeBlocked;
  const mapCoordinates = useMemo(() => {
    if (vehicle) {
      return resolveVehicleCoordinates({
        lat: vehicle.lat,
        lng: vehicle.lng,
        location: vehicle.location,
        city: vehicle.city,
      });
    }

    if (isMock) {
      const mockCard = mockVehicleCards().find((item) => item.id === id);
      return resolveVehicleCoordinates(mockCard ?? null);
    }

    return null;
  }, [id, isMock, vehicle]);

  const handleNavigate = async () => {
    if (!mapCoordinates) return;
    const opened = await openMapsNavigation(mapCoordinates, detail.title);
    if (!opened) {
      toast.error('Could not open maps on this device');
    }
  };

  const handleSelectStartDate = (date: string) => {
    if (isDateBlocked(date, blockedDates)) {
      toast.error('This date is not available');
      return;
    }

    if (isRangeBlocked(date, selectedDays, blockedDates)) {
      toast.error('Part of this rental period is already booked');
      return;
    }

    setStartDate(date);
  };

  const handleSelectDays = (days: number) => {
    if (isRangeBlocked(startDate, days, blockedDates)) {
      toast.error('Part of this rental period is already booked');
      return;
    }

    setSelectedDays(days);
  };

  const handleBook = () => {
    if (!requireAuth({ message: 'Sign in to request a booking', returnTo: `/scooter/${id}` })) {
      return;
    }

    if (isMock) {
      toast.error('Connect Supabase and publish a real bike to request booking');
      return;
    }

    if (isOwnVehicle) {
      toast.error('You cannot book your own bike');
      return;
    }

    const parsed = createBookingSchema.safeParse({
      vehicleId: id,
      startDate,
      days: selectedDays,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check booking dates');
      return;
    }

    createBooking.mutate(parsed.data, {
      onSuccess: (bookingId) => {
        router.push(`/bookings/${bookingId}` as import('expo-router').Href);
      },
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([vehicleQuery.refetch(), blockedDatesQuery.refetch()]);
    setRefreshing(false);
  }, [blockedDatesQuery, vehicleQuery]);

  if (vehicleQuery.isLoading && !isMock) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!vehicle && !isMock) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' }}>
        <Text style={{ ...typography.h2, color: colors.textPrimary, textAlign: 'center' }}>
          Bike not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary,
            borderRadius: 12,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: 240, position: 'relative' }}>
        {mapCoordinates ? (
          <VehicleLocationMap coordinates={mapCoordinates} isDark={isDark} />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            <MapPin color={colors.textSecondary} size={28} />
            <Text
              style={{
                ...typography.body,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 12,
              }}
            >
              Exact pickup location will be shared after booking confirmation.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 56,
            left: 16,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </Pressable>

        {mapCoordinates ? (
          <Pressable
            onPress={handleNavigate}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              gap: 6,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Navigation color={colors.primary} size={16} />
            <Text style={{ ...typography.caption, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.primary }}>
              Navigate
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Image
              source={detail.image}
              style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: colors.border }}
              contentFit="cover"
              cachePolicy={typeof detail.image === 'object' ? 'memory-disk' : undefined}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ ...typography.h2, color: colors.textPrimary }}>{detail.title}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                {detail.model}
              </Text>
              <Text style={{ ...typography.price, color: colors.primary, marginTop: 4 }}>
                {formatPrice(detail.pricePerDay)}
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>/day</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Star color="#FFB800" size={14} fill="#FFB800" />
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                    {detail.rating?.toFixed(1) ?? 'New'} ({detail.reviewCount})
                  </Text>
                </View>
                {detail.instant && <Badge label="Instant booking" variant="success" />}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 4 }}>
            <MapPin color={colors.textSecondary} size={14} />
            <Text style={{ ...typography.body, color: colors.textSecondary }}>{detail.location}</Text>
          </View>

          <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 16 }}>
            {detail.description}
          </Text>

          {vehicle?.owner ? (
            <View
              style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Avatar uri={vehicle.owner.avatar_url} name={vehicle.owner.display_name} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>Hosted by</Text>
                <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                  {vehicle.owner.display_name}
                </Text>
              </View>
            </View>
          ) : null}

          {!isMock && blockedDates.size > 0 ? (
            <View style={{ marginTop: 24 }}>
              <AvailabilityCalendar blockedDates={blockedDates} readOnly />
            </View>
          ) : null}

          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 24 }}>Start date</Text>
          {blockedDatesQuery.isLoading && !isMock ? (
            <View style={{ marginTop: 12, height: 44, justifyContent: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : blockedDatesQuery.isError && !isMock ? (
            <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 12 }}>
              Could not load availability. Pull to refresh or try again.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
            >
              {dateOptions.map((date) => {
                const value = toDateOnly(date);
                const blocked = isDateBlocked(value, blockedDates);
                const selected = value === startDate;

                return (
                  <Pressable
                    key={value}
                    disabled={blocked}
                    onPress={() => handleSelectStartDate(value)}
                    style={{
                      minWidth: 72,
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      alignItems: 'center',
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      opacity: blocked ? 0.45 : 1,
                    }}
                  >
                    <Text
                      style={{
                        ...typography.caption,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                        color: selected ? '#FFF' : colors.textPrimary,
                      }}
                    >
                      {formatDateChip(date)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 8 }}>Rental period</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {[1, 3, 7, 14].map((days) => (
              <Pressable
                key={days}
                onPress={() => handleSelectDays(days)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: selectedDays === days ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedDays === days ? colors.primary : colors.border,
                  minHeight: 44,
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    ...typography.body,
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    color: selectedDays === days ? '#FFF' : colors.textPrimary,
                  }}
                >
                  {days}d
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...typography.body, color: colors.textSecondary }}>
                {formatPrice(detail.pricePerDay)} x {selectedDays} days
              </Text>
              <Text style={{ ...typography.body, color: colors.textPrimary }}>
                {formatPrice(total)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ ...typography.body, color: colors.textSecondary }}>Service fee</Text>
              <Text style={{ ...typography.body, color: colors.textPrimary }}>{formatPrice(serviceFee)}</Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 12,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ ...typography.h3, color: colors.textPrimary }}>Total</Text>
              <Text style={{ ...typography.price, color: colors.primary }}>{formatPrice(total + serviceFee)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 }}>
            <Calendar color={colors.warning} size={18} />
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>
              Request dates: {startDate} to {endDate}. No online payment in MVP.
            </Text>
          </View>
          {isSelectedRangeBlocked ? (
            <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 8 }}>
              Selected dates overlap with an existing booking.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleBook}
          disabled={!canBook}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 12,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canBook ? 1 : 0.65,
          }}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
              {isOwnVehicle ? 'Your bike' : `Request booking - ${formatPrice(total + serviceFee)}`}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
