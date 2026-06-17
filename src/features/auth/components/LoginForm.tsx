import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { getErrorMessage } from '@/src/lib/errors';
import {
  signIn,
  signInWithSocialProvider,
  signUp,
  type SocialAuthProvider,
} from '../api/auth-api';
import { loginSchema, signUpSchema, type LoginFormData, type SignUpFormData } from '../schemas';

function LoginFields({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { colors } = useTheme();
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 52,
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {error && (
              <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              autoComplete="password"
            />
            {error && (
              <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
            Sign in
          </Text>
        )}
      </Pressable>
    </>
  );
}

function SignUpFields({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { colors } = useTheme();
  const { control, handleSubmit } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 52,
  };

  return (
    <>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              placeholder="Display name"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
            />
            {error && (
              <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {error && (
              <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View>
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              autoComplete="password"
            />
            {error && (
              <Text style={{ ...typography.caption, color: colors.secondary, marginTop: 4 }}>
                {error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          minHeight: 52,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
            Sign up
          </Text>
        )}
      </Pressable>
    </>
  );
}

const socialProviders: Array<{
  provider: SocialAuthProvider;
  label: string;
  mark: string;
}> = [
  { provider: 'facebook', label: 'Continue with Facebook', mark: 'f' },
  { provider: 'google', label: 'Continue with Google', mark: 'G' },
  { provider: 'apple', label: 'Continue with Apple', mark: 'A' },
];

function SocialAuthButtons({
  disabled,
  submittingProvider,
  onPressProvider,
}: {
  disabled: boolean;
  submittingProvider: SocialAuthProvider | null;
  onPressProvider: (provider: SocialAuthProvider) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      {socialProviders.map(({ provider, label, mark }) => {
        const isSubmitting = submittingProvider === provider;

        return (
          <Pressable
            key={provider}
            onPress={() => onPressProvider(provider)}
            disabled={disabled}
            style={{
              minHeight: 52,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 10,
              opacity: disabled ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text
                  style={{
                    ...typography.body,
                    color: colors.textPrimary,
                    fontFamily: 'PlusJakartaSans_700Bold',
                    width: 22,
                    textAlign: 'center',
                  }}
                >
                  {mark}
                </Text>
                <Text
                  style={{
                    ...typography.body,
                    color: colors.textPrimary,
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}
                >
                  {label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialSubmittingProvider, setSocialSubmittingProvider] =
    useState<SocialAuthProvider | null>(null);

  const isLogin = mode === 'login';
  const isBusy = isSubmitting || socialSubmittingProvider !== null;

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await signIn(data);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    try {
      await signUp(data);
      toast.success('Account created. You can start chatting.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: SocialAuthProvider) => {
    setSocialSubmittingProvider(provider);
    try {
      const result = await signInWithSocialProvider(provider);
      if (!result.cancelled) {
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not complete social sign in'));
    } finally {
      setSocialSubmittingProvider(null);
    }
  };

  return (
    <View style={{ gap: 16, opacity: disabled ? 0.5 : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
      <Text style={{ ...typography.h1, color: colors.textPrimary }}>
        {isLogin ? 'Sign in' : 'Create account'}
      </Text>
      <Text style={{ ...typography.body, color: colors.textSecondary }}>
        {isLogin
          ? 'Sign in to message sellers and buyers on Sakto.'
          : 'Join Sakto to buy, sell, and chat safely.'}
      </Text>

      {isLogin ? (
        <LoginFields onSubmit={handleLogin} isSubmitting={isBusy} />
      ) : (
        <SignUpFields onSubmit={handleSignUp} isSubmitting={isBusy} />
      )}

      <SocialAuthButtons
        disabled={isBusy}
        submittingProvider={socialSubmittingProvider}
        onPressProvider={handleSocialSignIn}
      />

      <Pressable onPress={() => setMode(isLogin ? 'signup' : 'login')} disabled={isBusy}>
        <Text style={{ ...typography.body, color: colors.primary, textAlign: 'center' }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}
