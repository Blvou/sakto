import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
