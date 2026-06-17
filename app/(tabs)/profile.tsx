import { View, Text, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  Calendar,
  ChevronRight,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
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
import { ImageCropModal } from '@/src/features/media/components/ImageCropModal';
import { useUploadAvatar } from '@/src/features/profile/hooks/use-upload-avatar';
import { useListingStats } from '@/src/features/listings/hooks/use-listing-stats';
import { typography } from '@/src/design-system/tokens';

const MENU_ITEMS = [
  { icon: Heart, label: 'Saved items', badge: '12' },
  { icon: MapPin, label: 'My listings', route: '/my-listings' as const },
  { icon: Calendar, label: 'My bookings', route: '/bookings' as const },
  { icon: Calendar, label: 'Rental requests', route: '/bookings/owner' as const },
  { icon: Star, label: 'Reviews', badge: '4.9' },
  { icon: Shield, label: 'Verification', badge: 'Verified' },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help & Support' },
];

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const cardStyle = useCardStyle();
  const cardLgStyle = useCardStyle({ borderRadius: 16 });
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const { user, userId } = useAuth();
  const router = useRouter();
  const { data: profile } = useMyProfile();
  const {
    pickAvatar,
    pendingCrop,
    confirmCrop,
    cancelCrop,
    isPending: isAvatarPending,
  } = useUploadAvatar();
  const { data: listingStats } = useListingStats();

  const listingsCount = listingStats?.total ?? 0;
  const soldCount = listingStats?.sold ?? 0;

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
              Manila, Philippines
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
                backgroundColor: '#E8F9EF',
                alignSelf: 'flex-start',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Shield color="#00A844" size={12} />
              <Text style={{ ...typography.caption, color: '#00A844', marginLeft: 4, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                Verified seller
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
          {[
            { label: 'Listings', value: String(listingsCount) },
            { label: 'Sold', value: String(soldCount) },
            { label: 'Rating', value: '4.9' },
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
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={'route' in item && item.route ? () => router.push(item.route) : undefined}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                minHeight: 56,
                borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <item.icon color={colors.textSecondary} size={20} strokeWidth={1.5} />
              <Text style={{ ...typography.body, color: colors.textPrimary, flex: 1, marginLeft: 12 }}>
                {item.label}
              </Text>
              {'badge' in item && item.badge && (
                <Text style={{ ...typography.caption, color: colors.textSecondary, marginRight: 8 }}>
                  {item.badge}
                </Text>
              )}
              {'route' in item && item.route === '/my-listings' && listingsCount > 0 && (
                <Text style={{ ...typography.caption, color: colors.textSecondary, marginRight: 8 }}>
                  {listingsCount}
                </Text>
              )}
              <ChevronRight color={colors.textSecondary} size={18} />
            </Pressable>
          ))}
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
