import { Platform } from 'react-native';

/**
 * Supabase Auth on web uses Web Crypto (PKCE). Browsers only expose it in a secure context:
 * HTTPS or http://localhost — not http://192.168.x.x from a phone browser.
 */
export function isAuthContextSupported(): boolean {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined') return true;
  return window.isSecureContext;
}

export function getAuthBlockedReason(): string | null {
  if (isAuthContextSupported()) return null;

  return (
    'Sign-in in the mobile browser only works over HTTPS or localhost. ' +
    'Use Expo Go (scan the QR code) or run: npm run start:tunnel and open the https:// link on your phone.'
  );
}
