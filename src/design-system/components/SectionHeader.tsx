import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  secondaryActionLabel?: string;
  onSecondaryActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
}: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
      }}
    >
      <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1 }} numberOfLines={2}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {secondaryActionLabel && onSecondaryActionPress ? (
          <Pressable onPress={onSecondaryActionPress} hitSlop={8}>
            <Text
              style={{
                ...typography.caption,
                color: colors.primary,
                fontFamily: 'PlusJakartaSans_600SemiBold',
              }}
            >
              {secondaryActionLabel}
            </Text>
          </Pressable>
        ) : null}
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} hitSlop={8}>
            <Text
              style={{
                ...typography.caption,
                color: colors.primary,
                fontFamily: 'PlusJakartaSans_600SemiBold',
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
