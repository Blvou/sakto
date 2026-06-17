import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { radii, shadows } from './tokens';

export interface CardStyleOptions {
  borderRadius?: number;
  /** Apply subtle shadow in light mode. Default true. */
  elevated?: boolean;
}

export function useCardStyle(options: CardStyleOptions = {}): ViewStyle {
  const { colors, isDark } = useTheme();
  const { borderRadius = radii.md, elevated = true } = options;

  return useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius,
      ...(elevated && !isDark ? shadows.cardLight : null),
    }),
    [colors.surface, colors.border, borderRadius, elevated, isDark],
  );
}
