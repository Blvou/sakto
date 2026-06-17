import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useTheme } from '@/src/hooks/use-theme';

/** OAuth redirect target for web (and deep link on native). */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          const authError =
            params.get('error_description') ?? params.get('error');

          if (authError) {
            throw new Error(authError);
          }

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        router.replace(session ? '/(tabs)' : '/(auth)/login');
      } catch {
        if (!cancelled) router.replace('/(auth)/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
