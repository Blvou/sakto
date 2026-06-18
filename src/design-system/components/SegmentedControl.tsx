import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.border,
        borderRadius: 12,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              minHeight: 40,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.surface : 'transparent',
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              style={{
                ...typography.caption,
                fontFamily: selected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                color: selected ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
