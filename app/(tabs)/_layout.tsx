import { Tabs } from 'expo-router';
import { Home, Heart, FilePlus, MessageCircle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { getTabBarStyle } from '@/src/hooks/use-responsive';
import { useUnreadTotal } from '@/src/features/chat/hooks/use-conversations';

export default function TabLayout() {
  const { colors } = useTheme();
  const { data: unreadTotal } = useUnreadTotal();
  const insets = useSafeAreaInsets();
  const tabBarLayout = getTabBarStyle(insets.bottom);

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          ...tabBarLayout,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Ads',
          tabBarIcon: ({ color, size }) => <FilePlus color={color} size={size} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={1.5} />,
          tabBarBadge: unreadTotal && unreadTotal > 0 ? unreadTotal : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
