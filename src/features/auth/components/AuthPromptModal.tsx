import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '@/src/design-system/tokens';
import { useTheme } from '@/src/hooks/use-theme';
import { useAuthPromptStore } from '@/src/stores/auth-prompt-store';
import { InsecureWebAuthNotice } from './InsecureWebAuthNotice';
import { LoginForm } from './LoginForm';
import { SupabaseSetupNotice } from './SupabaseSetupNotice';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { isAuthContextSupported } from '@/src/lib/auth-context';

export function AuthPromptModal() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const visible = useAuthPromptStore((s) => s.visible);
  const message = useAuthPromptStore((s) => s.message);
  const returnTo = useAuthPromptStore((s) => s.returnTo);
  const close = useAuthPromptStore((s) => s.close);
  const authReady = isSupabaseConfigured && isAuthContextSupported();

  const handleClose = useCallback(() => {
    close();
  }, [close]);

  const handleSuccess = useCallback(() => {
    close();
    if (returnTo) {
      router.push(returnTo);
    }
  }, [close, returnTo, router]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 16,
              maxHeight: '92%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1 }} numberOfLines={2}>
                {message}
              </Text>
              <Pressable
                onPress={handleClose}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                accessibilityRole="button"
                accessibilityLabel="Close sign in"
              >
                <X color={colors.textSecondary} size={22} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
            >
              {!isSupabaseConfigured && <SupabaseSetupNotice />}
              <InsecureWebAuthNotice />
              <LoginForm disabled={!authReady} onSuccess={handleSuccess} compact />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
