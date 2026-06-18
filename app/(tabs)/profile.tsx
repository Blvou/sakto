import { View, Text, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  Calendar,
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  Bell,
  Settings,
  Star,
} from 'lucide-react-native';
import { toast } from 'sonner-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { useAppStore } from '@/src/stores/app-store';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { signOut } from '@/src/features/auth/api/auth-api';
import { Avatar } from '@/src/design-system/components/Avatar';
import { useMyProfile } from '@/src/features/profile/hooks/use-my-profile';
import { useProfileStats } from '@/src/features/profile/hooks/use-profile-stats';
import { ImageCropModal } from '@/src/features/media/components/ImageCropModal';
import { useUploadAvatar } from '@/src/features/profile/hooks/use-upload-avatar';
import { useMyVehicles } from '@/src/features/rentals/hooks/use-my-vehicles';
import { typography } from '@/src/design-system/tokens';
import { useNotificationsStore } from '@/src/stores/notifications-store';

const MENU_ITEMS = [
  { icon: MapPin, label: 'My bikes', route: '/my-listings' as const },
  { icon: Calendar, label: 'My bookings', route: '/bookings' as const },
  { icon: Calendar, label: 'Rental requests', route: '/bookings/owner' as const, badgeKey: 'pending' as const },
  { icon: Star, label: 'Reviews', route: null },
  { icon: Settings, label: 'Settings', route: null },
  { icon: HelpCircle, label: 'Help & Support', route: null },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const cardStyle = useCardStyle();
  const cardLgStyle = useCardStyle({ borderRadius: 16 });
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const { user, userId } = useAuth();
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const stats = useProfileStats();
  const unreadNotifications = useNotificationsStore((s) => s.unreadCount());
  const {
    pickAvatar,
    pendingCrop,
    confirmCrop,
    cancelCrop,
    isPending: isAvatarPending,
  } = useUploadAvatar();
  const { data: myVehicles = [] } = useMyVehicles();

  const bikesCount = myVehicles.length;

  const displayName =
    profile?.display_name ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'User';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not sign out';
      toast.error(message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            ...cardLgStyle,
          }}
        >
          <Pressable
            onPress={() => pickAvatar()}
            disabled={!userId || isAvatarPending}
            accessibilityLabel="Change profile photo"
            style={{ position: 'relative' }}
          >
            <Avatar uri={profile?.avatar_url} name={displayName} size={64} />
            <View
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.surface,
              }}
            >
              {isAvatarPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Camera color="#FFF" size={12} strokeWidth={2} />
              )}
            </View>
          </Pressable>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ ...typography.h2, color: colors.textPrimary }}>{displayName}</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
          {[
            { label: 'Bikes', value: String(bikesCount) },
            { label: 'Trips', value: String(stats.trips) },
            { label: 'Rating', value: stats.rating != null ? stats.rating.toFixed(1) : '—' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                padding: 16,
                alignItems: 'center',
                ...cardStyle,
              }}
            >
              <Text style={{ ...typography.h2, color: colors.primary }}>{stat.value}</Text>
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            marginTop: 16,
            ...cardStyle,
          }}
        >
          <Text style={{ ...typography.body, color: colors.textPrimary }}>Dark mode</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setColorScheme(val ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={{ marginTop: 16, ...cardLgStyle }}>
          {MENU_ITEMS.map((item, i) => {
            const badge =
              item.badgeKey === 'pending' && stats.pendingRequests > 0
                ? String(stats.pendingRequests)
                : item.label === 'My bookings' && stats.upcomingTrips > 0
                  ? String(stats.upcomingTrips)
                  : null;

            return (
              <Pressable
                key={item.label}
                onPress={item.route ? () => router.push(item.route!) : undefined}
                disabled={!item.route}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  minHeight: 56,
                  borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                  opacity: item.route ? 1 : 0.5,
                }}
              >
                <item.icon color={colors.textSecondary} size={20} strokeWidth={1.5} />
                <Text style={{ ...typography.body, color: colors.textPrimary, flex: 1, marginLeft: 12 }}>
                  {item.label}
                </Text>
                {badge ? (
                  <View
                    style={{
                      backgroundColor: colors.secondary,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'PlusJakartaSans_700Bold' }}>
                      {badge}
                    </Text>
                  </View>
                ) : null}
                {'route' in item && item.route === '/my-listings' && bikesCount > 0 && !badge ? (
                  <Text style={{ ...typography.caption, color: colors.textSecondary, marginRight: 8 }}>
                    {bikesCount}
                  </Text>
                ) : null}
                <ChevronRight color={colors.textSecondary} size={18} />
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => router.push('/notifications' as import('expo-router').Href)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              minHeight: 56,
            }}
          >
            <Bell color={colors.textSecondary} size={20} strokeWidth={1.5} />
            <Text style={{ ...typography.body, color: colors.textPrimary, flex: 1, marginLeft: 12 }}>
              Notifications
            </Text>
            {unreadNotifications > 0 ? (
              <Text style={{ ...typography.caption, color: colors.textSecondary, marginRight: 8 }}>
                {unreadNotifications}
              </Text>
            ) : null}
            <ChevronRight color={colors.textSecondary} size={18} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            marginTop: 16,
            gap: 8,
            ...cardStyle,
          }}
        >
          <LogOut color={colors.secondary} size={20} />
          <Text style={{ ...typography.body, color: colors.secondary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            Sign out
          </Text>
        </Pressable>
      </View>
      <ImageCropModal
        visible={pendingCrop !== null}
        imageUri={pendingCrop?.uri ?? ''}
        imageWidth={pendingCrop?.width}
        imageHeight={pendingCrop?.height}
        aspectRatio={{ width: 1, height: 1 }}
        onConfirm={confirmCrop}
        onCancel={cancelCrop}
      />
    </ScrollView>
  );
}
