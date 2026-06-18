import { Pressable, Text, View, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }, style]}>
      <Icon color={colors.textSecondary} size={48} strokeWidth={1.25} />
      <Text
        style={{
          ...typography.h3,
          color: colors.textPrimary,
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            ...typography.body,
            color: colors.textSecondary,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={{
            marginTop: 20,
            minHeight: 44,
            paddingHorizontal: 20,
            borderRadius: 12,
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
        >
          <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
