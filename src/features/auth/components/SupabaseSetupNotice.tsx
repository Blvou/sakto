import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';

export function SupabaseSetupNotice() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        maxHeight: 320,
        marginBottom: 24,
      }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
    >
      <Text style={{ ...typography.h2, color: colors.textPrimary }}>Supabase not configured</Text>
      <Text style={{ ...typography.body, color: colors.textSecondary }}>
        Create a project at supabase.com, then add credentials to a `.env` file in the project root:
      </Text>
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ ...typography.caption, color: colors.textPrimary, fontFamily: 'monospace' }}>
          EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
          EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
        </Text>
      </View>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>
        1. Copy `.env.example` → `.env`{'\n'}
        2. Apply SQL migrations from `supabase/migrations/`{'\n'}
        3. Restart Expo: `npx expo start -c`
      </Text>
    </ScrollView>
  );
}
