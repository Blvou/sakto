import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Bike, MoreVertical } from 'lucide-react-native';
import { Badge } from '@/src/design-system/components/Badge';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { ListSkeleton } from '@/src/design-system/components/ListSkeleton';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { useMyVehicles } from '@/src/features/rentals/hooks/use-my-vehicles';
import type { VehicleCardItem } from '@/src/features/rentals/types';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { FlashList } from '@shopify/flash-list';

export default function MyBikesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const cardStyle = useCardStyle({ borderRadius: 12 });
  const { data: vehicles = [], isLoading, isError, refetch, isRefetching } = useMyVehicles();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="My bikes" onBack={() => router.back()} />

      {isLoading ? (
        <View style={{ padding: 16 }}>
          <ListSkeleton count={3} itemHeight={96} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load your bikes" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={vehicles}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: vehicles.length === 0 ? 1 : 0 }}
          ListEmptyComponent={
            <EmptyState
              icon={Bike}
              title="No bikes listed"
              description="List your first bike and start receiving rental requests."
              actionLabel="List your first bike"
              onAction={() => router.push('/publish?type=scooter')}
            />
          }
          renderItem={({ item }: { item: VehicleCardItem }) => (
            <Pressable
              onPress={() => router.push(`/scooter/${item.id}`)}
              style={{
                flexDirection: 'row',
                padding: 12,
                marginBottom: 12,
                gap: 12,
                ...cardStyle,
              }}
            >
              <Image
                source={item.image}
                style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: colors.border }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Text
                    style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold', flex: 1 }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {item.instant ? <Badge label="Instant" variant="success" /> : null}
                </View>
                <Text style={{ ...typography.priceSm, color: colors.primary, marginTop: 4 }}>
                  {formatPrice(item.pricePerDay)}
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>/day</Text>
                </Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/scooter/${item.id}`)}
                hitSlop={8}
                accessibilityLabel="Bike options"
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <MoreVertical color={colors.textSecondary} size={18} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
