import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';
import { getAuthBlockedReason } from '@/src/lib/auth-context';
import { supabase } from '@/src/lib/supabase';
import type { SignUpFormData, LoginFormData } from '../schemas';

WebBrowser.maybeCompleteAuthSession();

export type SocialAuthProvider = Extract<Provider, 'apple' | 'facebook' | 'google'>;

const OAUTH_CALLBACK_PATH = 'auth/callback';

export function getOAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${OAUTH_CALLBACK_PATH}`;
  }
  return Linking.createURL(OAUTH_CALLBACK_PATH);
}

export async function signUp({ email, password, displayName }: SignUpFormData) {
  assertAuthContext();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  return data;
}

function assertAuthContext() {
  const blocked = getAuthBlockedReason();
  if (blocked) throw new Error(blocked);
}

export async function signIn({ email, password }: LoginFormData) {
  assertAuthContext();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithSocialProvider(provider: SocialAuthProvider) {
  assertAuthContext();
  const redirectTo = getOAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) {
    throw new Error('Could not start social sign in. Please try again.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { cancelled: true as const, session: null };
  }
  if (result.type !== 'success') {
    throw new Error('Social sign in was not completed. Please try again.');
  }

  const callbackUrl = new URL(result.url);
  const providerError =
    callbackUrl.searchParams.get('error_description') ?? callbackUrl.searchParams.get('error');
  if (providerError) {
    throw new Error(providerError);
  }

  const code = callbackUrl.searchParams.get('code');
  if (!code) {
    throw new Error('Social sign in did not return an authorization code.');
  }

  const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );
  if (exchangeError) throw exchangeError;

  return { cancelled: false as const, session: sessionData.session };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
