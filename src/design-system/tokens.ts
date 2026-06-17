import type { ViewStyle } from 'react-native';

export const colors = {
  light: {
    primary: '#0066FF',
    secondary: '#FF6B00',
    success: '#00C853',
    warning: '#FFB800',
    background: '#F7F9FC',
    surface: '#FFFFFF',
    textPrimary: '#0A1F44',
    textSecondary: '#6B7A99',
    border: '#DDE3ED',
    shadow: 'rgba(10, 31, 68, 0.08)',
    fabShadow: 'rgba(255, 107, 0, 0.3)',
  },
  dark: {
    primary: '#3D8BFF',
    secondary: '#FF8533',
    success: '#33D47A',
    warning: '#FFCA33',
    background: '#0D1526',
    surface: '#1A2332',
    textPrimary: '#F0F4FF',
    textSecondary: '#8B9BB8',
    border: '#2A3548',
    shadow: 'rgba(0, 0, 0, 0.3)',
    fabShadow: 'rgba(255, 107, 0, 0.4)',
  },
} as const;

export const typography = {
  h1: { fontSize: 24, lineHeight: 32, letterSpacing: -0.5, fontFamily: 'PlusJakartaSans_700Bold' },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: 'PlusJakartaSans_600SemiBold' },
  h3: { fontSize: 16, lineHeight: 24, fontFamily: 'PlusJakartaSans_600SemiBold' },
  body: { fontSize: 14, lineHeight: 20, fontFamily: 'PlusJakartaSans_400Regular' },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: 'PlusJakartaSans_400Regular' },
  price: { fontSize: 18, lineHeight: 24, fontFamily: 'PlusJakartaSans_700Bold' },
  priceSm: { fontSize: 16, lineHeight: 22, fontFamily: 'PlusJakartaSans_700Bold' },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  touch: 44,
} as const;

/** React Native shadow for elevated cards — light mode only (see useCardStyle). */
export const shadows = {
  cardLight: {
    shadowColor: '#0A1F44',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  } satisfies ViewStyle,
} as const;

export type ColorScheme = 'light' | 'dark';

export function getTheme(scheme: ColorScheme) {
  return colors[scheme];
}
