import { useState, useCallback } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { chatTypography } from '../constants/typography';

interface Props {
  onSend: (text: string) => void;
  isSending: boolean;
}

export function MessageInput({ onSend, isSending }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText('');
  }, [text, isSending, onSend]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 28,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 10,
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={2000}
        style={{
          flex: 1,
          ...chatTypography.input,
          color: colors.textPrimary,
          backgroundColor: colors.background,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 10,
          maxHeight: 120,
        }}
      />
      <Pressable
        onPress={handleSend}
        disabled={!text.trim() || isSending}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: !text.trim() || isSending ? 0.5 : 1,
        }}
      >
        {isSending ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Send color="#FFF" size={20} />
        )}
      </Pressable>
    </View>
  );
}
