import { View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { getAuthBlockedReason } from '@/src/lib/auth-context';

export function InsecureWebAuthNotice() {
  const { colors } = useTheme();
  const message = getAuthBlockedReason();

  if (!message) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.secondary,
        padding: 16,
        marginBottom: 16,
        gap: 8,
      }}
    >
      <Text style={{ ...typography.h2, color: colors.textPrimary }}>Cannot sign in in this browser</Text>
      <Text style={{ ...typography.body, color: colors.textSecondary }}>{message}</Text>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>
        Phone browser over http://192.x or http://172.x cannot use Supabase Auth (browser security).
        {'\n\n'}
        Option 1 — Expo Go: scan the QR code in the terminal (native app, works on LAN).
        {'\n\n'}
        Option 2 — HTTPS tunnel: run npm run start:tunnel, then open the https://…exp.direct link on
        your phone (not the LAN http:// address).
      </Text>
    </View>
  );
}
