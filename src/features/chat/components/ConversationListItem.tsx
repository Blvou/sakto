import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Avatar } from '@/src/design-system/components/Avatar';
import { chatTypography } from '../constants/typography';
import type { ConversationPreview } from '../types';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface Props {
  conversation: ConversationPreview;
  onPress: (id: string) => void;
  onPressIn?: (id: string) => void;
}

export const ConversationListItem = memo(function ConversationListItem({
  conversation,
  onPress,
  onPressIn,
}: Props) {
  const { colors } = useTheme();
  const { other_user, listing_title, last_message, last_message_at, unread_count } = conversation;
  const subtitle = listing_title
    ? `${listing_title}: ${last_message ?? 'No messages yet'}`
    : last_message ?? 'No messages yet';

  return (
    <Pressable
      onPress={() => onPress(conversation.id)}
      onPressIn={() => onPressIn?.(conversation.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 72,
      }}
    >
      <Avatar uri={other_user.avatar_url} name={other_user.display_name} size={48} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...chatTypography.bodySemibold, color: colors.textPrimary }}>
            {other_user.display_name}
          </Text>
          <Text style={{ ...chatTypography.caption, color: colors.textSecondary }}>
            {formatRelativeTime(last_message_at)}
          </Text>
        </View>
        <Text
          style={{ ...chatTypography.caption, color: colors.textSecondary, marginTop: 2 }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      {unread_count > 0 && (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
            paddingHorizontal: 6,
          }}
        >
          <Text style={{ color: '#FFF', ...chatTypography.badge }}>
            {unread_count > 99 ? '99+' : unread_count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}, (prev, next) =>
  prev.conversation.id === next.conversation.id &&
  prev.conversation.last_message === next.conversation.last_message &&
  prev.conversation.last_message_at === next.conversation.last_message_at &&
  prev.conversation.unread_count === next.conversation.unread_count &&
  prev.conversation.other_user.display_name === next.conversation.other_user.display_name &&
  prev.conversation.other_user.avatar_url === next.conversation.other_user.avatar_url &&
  prev.onPress === next.onPress &&
  prev.onPressIn === next.onPressIn);
