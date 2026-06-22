import { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useScreenDimensions } from '@/src/design-system/responsive';
import { Avatar } from '@/src/design-system/components/Avatar';
import { chatTypography } from '../constants/typography';
import type { Profile } from '../types';

interface Props {
  otherUser: Profile;
  listingTitle?: string | null;
  onDeletePress?: () => void;
  isDeleting?: boolean;
}

export function ChatHeader({ otherUser, listingTitle, onDeletePress, isDeleting = false }: Props) {
  const { colors } = useTheme();
  const { horizontalPadding, screenHeaderPaddingTop } = useScreenDimensions();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/chat');
    }
  }, [router]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: screenHeaderPaddingTop,
        paddingBottom: 12,
        paddingHorizontal: horizontalPadding,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable onPress={handleBack} hitSlop={12} style={{ marginRight: 12 }}>
        <ArrowLeft color={colors.textPrimary} size={24} />
      </Pressable>
      <Avatar uri={otherUser.avatar_url} name={otherUser.display_name} size={40} />
      <View style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
        <Text style={{ ...chatTypography.bodySemibold, color: colors.textPrimary }} numberOfLines={1}>
          {otherUser.display_name}
        </Text>
        {listingTitle && (
          <Text style={{ ...chatTypography.caption, color: colors.textSecondary }} numberOfLines={1}>
            {listingTitle}
          </Text>
        )}
      </View>
      {onDeletePress ? (
        <Pressable
          onPress={onDeletePress}
          disabled={isDeleting}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Delete chat"
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          <Trash2 color={colors.secondary} size={20} strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}
