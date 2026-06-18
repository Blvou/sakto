import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUserNotifications,
} from '@/src/features/notifications/hooks/use-user-notifications';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { useCardStyle } from '@/src/design-system/use-card-style';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const cardStyle = useCardStyle();
  const { data: items = [], isLoading, isError, refetch } = useUserNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Notifications"
        onBack={() => router.back()}
        right={
          items.length > 0 ? (
            <Pressable onPress={() => markAllRead.mutate()} hitSlop={8}>
              <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                Read all
              </Text>
            </Pressable>
          ) : null
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load notifications" onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Booking updates and messages will appear here."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (!item.read) {
                  markRead.mutate(item.id);
                }
                if (item.href) router.push(item.href as Href);
              }}
              style={{
                padding: 16,
                ...cardStyle,
                opacity: item.read ? 0.75 : 1,
              }}
            >
              <Text style={{ ...typography.body, fontFamily: 'PlusJakartaSans_600SemiBold', color: colors.textPrimary }}>
                {item.title}
              </Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
                {item.body}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
