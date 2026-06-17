import { Pressable, Text, type PressableProps } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';

interface ChipProps extends PressableProps {
  label: string;
  active?: boolean;
}

export function Chip({ label, active = false, style, ...props }: ChipProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle({ borderRadius: 20, elevated: !active });

  return (
    <Pressable
      style={(state) => [
        {
          paddingHorizontal: 14,
          paddingVertical: 8,
          minHeight: 36,
          justifyContent: 'center',
          opacity: state.pressed ? 0.8 : 1,
        },
        active
          ? {
              borderRadius: 20,
              backgroundColor: colors.primary,
              borderWidth: 1,
              borderColor: colors.primary,
            }
          : cardStyle,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      <Text
        style={{
          ...typography.caption,
          fontFamily: 'PlusJakartaSans_500Medium',
          color: active ? '#FFFFFF' : colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
