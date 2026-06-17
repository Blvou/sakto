import { Text, View, type ViewProps } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

type BadgeVariant = 'success' | 'warning' | 'primary' | 'secondary' | 'urgent' | 'top';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#E8F9EF', text: '#00A844' },
  warning: { bg: '#FFF8E6', text: '#CC9300' },
  primary: { bg: '#E6F0FF', text: '#0066FF' },
  secondary: { bg: '#FFF0E6', text: '#FF6B00' },
  urgent: { bg: '#FFE6E6', text: '#E53935' },
  top: { bg: '#E6F0FF', text: '#0066FF' },
};

const darkVariantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#0D2E1A', text: '#33D47A' },
  warning: { bg: '#2E250D', text: '#FFCA33' },
  primary: { bg: '#0D1F3D', text: '#3D8BFF' },
  secondary: { bg: '#2E1A0D', text: '#FF8533' },
  urgent: { bg: '#2E0D0D', text: '#FF6B6B' },
  top: { bg: '#0D1F3D', text: '#3D8BFF' },
};

export function Badge({ label, variant = 'primary', style, ...props }: BadgeProps) {
  const { isDark } = useTheme();
  const palette = isDark ? darkVariantColors[variant] : variantColors[variant];

  return (
    <View
      style={[
        {
          backgroundColor: palette.bg,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          alignSelf: 'flex-start',
        },
        style,
      ]}
      {...props}
    >
      <Text style={{ ...typography.caption, color: palette.text, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
        {label}
      </Text>
    </View>
  );
}
