import { useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppStore } from '@/src/stores/app-store';
import { ColorScheme, getTheme } from '@/src/design-system/tokens';

export function useTheme() {
  const systemScheme = useRNColorScheme();
  const preference = useAppStore((s) => s.colorScheme);

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return useMemo(
    () => ({
      scheme,
      colors: getTheme(scheme),
      isDark: scheme === 'dark',
    }),
    [scheme]
  );
}
