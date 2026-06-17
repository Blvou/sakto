import { memo, useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Languages } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { chatTypography } from '../constants/typography';
import type { PreferredLang } from '@/src/lib/database.types';
import { MessageStatusChecks } from './MessageStatusChecks';
import { formatMessageTime } from '../utils/message-status';
import type { Message, MessageDeliveryStatus } from '../types';

interface Props {
  message: Message;
  isOwn: boolean;
  targetLang: PreferredLang;
  deliveryStatus?: MessageDeliveryStatus | null;
  onTranslate: (messageId: string, text: string, targetLang: PreferredLang) => Promise<string>;
  isTranslating?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  targetLang,
  deliveryStatus = null,
  onTranslate,
  isTranslating = false,
}: Props) {
  const { colors } = useTheme();
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (showTranslation && translation) {
      setShowTranslation(false);
      return;
    }

    if (translation) {
      setShowTranslation(true);
      return;
    }

    const result = await onTranslate(message.id, message.body, targetLang);
    setTranslation(result);
    setShowTranslation(true);
  }, [showTranslation, translation, onTranslate, message.id, message.body, targetLang]);

  const bubbleColor = isOwn ? colors.primary : colors.surface;
  const textColor = isOwn ? '#FFF' : colors.textPrimary;
  const metaColor = isOwn ? 'rgba(255,255,255,0.75)' : colors.textSecondary;
  const isPending = message.id.startsWith('temp-');

  return (
    <View
      style={{
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        marginVertical: 4,
      }}
    >
      <Pressable
        onLongPress={handleTranslate}
        style={{
          backgroundColor: bubbleColor,
          borderRadius: 16,
          borderBottomRightRadius: isOwn ? 4 : 16,
          borderBottomLeftRadius: isOwn ? 16 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: isOwn ? 0 : 1,
          borderColor: colors.border,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <Text style={{ ...chatTypography.body, color: textColor }}>{message.body}</Text>
        {showTranslation && translation && (
          <Text
            style={{
              ...chatTypography.caption,
              color: isOwn ? 'rgba(255,255,255,0.85)' : colors.textSecondary,
              marginTop: 6,
              fontStyle: 'italic',
            }}
          >
            {translation}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
            gap: 4,
            marginTop: 6,
          }}
        >
          <Text style={{ ...chatTypography.messageMeta, color: metaColor }}>
            {formatMessageTime(message.created_at)}
          </Text>
          {isOwn && deliveryStatus && (
            <MessageStatusChecks
              status={deliveryStatus}
              readColor="#B8E0FF"
              mutedColor="rgba(255,255,255,0.65)"
            />
          )}
        </View>
      </Pressable>

      <Pressable
        onPress={handleTranslate}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: isOwn ? 'flex-end' : 'flex-start',
          marginTop: 4,
          gap: 4,
          paddingHorizontal: 4,
        }}
        hitSlop={8}
      >
        {isTranslating ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Languages color={colors.textSecondary} size={14} />
        )}
        <Text style={{ ...chatTypography.caption, color: colors.textSecondary }}>
          {showTranslation ? 'Hide translation' : 'Translate'}
        </Text>
      </Pressable>
    </View>
  );
});
