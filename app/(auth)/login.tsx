import { View } from 'react-native';
import { LoginForm } from '@/src/features/auth/components/LoginForm';
import { SupabaseSetupNotice } from '@/src/features/auth/components/SupabaseSetupNotice';
import { InsecureWebAuthNotice } from '@/src/features/auth/components/InsecureWebAuthNotice';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { isAuthContextSupported } from '@/src/lib/auth-context';
import { useTheme } from '@/src/hooks/use-theme';
import { useScreenDimensions } from '@/src/design-system/responsive';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { horizontalPadding, screenHeaderPaddingTop } = useScreenDimensions();
  const authReady = isSupabaseConfigured && isAuthContextSupported();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: screenHeaderPaddingTop,
        paddingHorizontal: horizontalPadding,
      }}
    >
      {!isSupabaseConfigured && <SupabaseSetupNotice />}
      <InsecureWebAuthNotice />
      <LoginForm disabled={!authReady} />
    </View>
  );
}
