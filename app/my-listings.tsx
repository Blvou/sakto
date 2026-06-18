import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { useMyVehicles } from '@/src/features/rentals/hooks/use-my-vehicles';
import type { VehicleCardItem } from '@/src/features/rentals/types';

export default function MyBikesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: vehicles = [], isLoading, isError, refetch, isRefetching } = useMyVehicles();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
        >
          <ArrowLeft color={colors.textPrimary} size={24} />
        </Pressable>
        <Text style={{ ...typography.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
          My bikes
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
            Could not load your bikes
          </Text>
          <Pressable onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
                You have no bikes listed yet
              </Text>
              <Pressable onPress={() => router.push('/publish?type=scooter')} style={{ marginTop: 16 }}>
                <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                  List your first bike
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }: { item: VehicleCardItem }) => (
            <Pressable
              onPress={() => router.push(`/scooter/${item.id}`)}
              style={{
                flexDirection: 'row',
                padding: 12,
                marginBottom: 12,
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 12,
              }}
            >
              <Image
                source={item.image}
                style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: colors.border }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                  style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={{ ...typography.priceSm, color: colors.primary, marginTop: 4 }}>
                  {formatPrice(item.pricePerDay)}
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>/day</Text>
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>{item.location}</Text>
                  {item.instant ? (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        backgroundColor: '#E8F9EF',
                      }}
                    >
                      <Text
                        style={{
                          ...typography.caption,
                          color: colors.success,
                          fontFamily: 'PlusJakartaSans_600SemiBold',
                        }}
                      >
                        Instant
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
