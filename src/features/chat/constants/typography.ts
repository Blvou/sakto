import { Platform, type TextStyle } from 'react-native';

/** Apple system font stack (SF Pro on iOS, -apple-system on web). */
export const chatFontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  default: 'System',
}) as string;

export const chatTypography = {
  title: {
    fontFamily: chatFontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
  } satisfies TextStyle,
  headline: {
    fontFamily: chatFontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } satisfies TextStyle,
  body: {
    fontFamily: chatFontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,
  bodyMedium: {
    fontFamily: chatFontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } satisfies TextStyle,
  bodySemibold: {
    fontFamily: chatFontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } satisfies TextStyle,
  caption: {
    fontFamily: chatFontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } satisfies TextStyle,
  messageMeta: {
    fontFamily: chatFontFamily,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  } satisfies TextStyle,
  input: {
    fontFamily: chatFontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,
  badge: {
    fontFamily: chatFontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  } satisfies TextStyle,
};
