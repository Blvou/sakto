import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bell, ChevronDown, MapPin, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';

interface HomeHeaderProps {
  location?: string;
  notificationCount?: number;
  onLocationPress?: () => void;
  onNotificationsPress?: () => void;
  onChatPress?: () => void;
}

export const HomeHeader = memo(function HomeHeader({
  location = 'Manila, PH',
  notificationCount = 3,
  onLocationPress,
  onNotificationsPress,
  onChatPress,
}: HomeHeaderProps) {
  const { colors } = useTheme();
  const { isSmallScreen, horizontalPadding } = useResponsive();

  return (
    <View
      style={{
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalPadding,
        backgroundColor: colors.background,
        gap: 8,
      }}
    >
      <Pressable
        onPress={onLocationPress}
        style={{
          flex: 1,
          flexShrink: 1,
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          minWidth: 0,
        }}
        accessibilityRole="button"
        accessibilityLabel="Change location"
      >
        <MapPin color={colors.primary} size={16} strokeWidth={2} />
        <Text
          style={{
            ...typography.caption,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            color: colors.textPrimary,
            marginLeft: 4,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {location}
        </Text>
        <ChevronDown color={colors.textSecondary} size={14} style={{ marginLeft: 2, flexShrink: 0 }} />
      </Pressable>

      {!isSmallScreen && (
        <Text
          style={{
            ...typography.h3,
            color: colors.primary,
            fontFamily: 'PlusJakartaSans_700Bold',
            flexShrink: 0,
          }}
        >
          Sakto
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Pressable
          onPress={onNotificationsPress}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell color={colors.textPrimary} size={22} strokeWidth={1.5} />
          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: colors.secondary,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' }}>
                {notificationCount}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={onChatPress}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityRole="button"
          accessibilityLabel="Messages"
        >
          <MessageCircle color={colors.textPrimary} size={22} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
});
