import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { HomeHeader } from '@/src/features/home/components/HomeHeader';
import { ServiceHubGrid } from '@/src/features/home/components/ServiceHubGrid';
import { FavoritesSection } from '@/src/features/favorites/components/FavoritesSection';
import { useUnreadNotificationCount } from '@/src/features/notifications/hooks/use-user-notifications';
import { useFavorites } from '@/src/features/favorites/hooks/use-favorites';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const notificationCount = useUnreadNotificationCount();
  const { horizontalPadding, listBottomPadding } = useResponsive();
  const { refetch: refetchFavorites, isRefetching } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const handleChatPress = useCallback(() => {
    router.push('/(tabs)/chat');
  }, [router]);

  const handleNotificationsPress = useCallback(() => {
    router.push('/notifications' as Href);
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchFavorites();
    } finally {
      setRefreshing(false);
    }
  }, [refetchFavorites]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader
        notificationCount={notificationCount}
        onChatPress={handleChatPress}
        onNotificationsPress={handleNotificationsPress}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: listBottomPadding,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ServiceHubGrid />
        <FavoritesSection />
      </ScrollView>
    </View>
  );
}
