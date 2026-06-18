import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }, style]}>
      <AlertCircle color={colors.secondary} size={48} strokeWidth={1.25} />
      <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 16, textAlign: 'center' }}>
        {title}
      </Text>
      <Text
        style={{
          ...typography.body,
          color: colors.textSecondary,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: 20,
            minHeight: 44,
            paddingHorizontal: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_700Bold' }}>
            Retry
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
