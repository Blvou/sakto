import { useCallback } from 'react';
import type { Href } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useAuthPromptStore } from '@/src/stores/auth-prompt-store';

interface RequireAuthOptions {
  message?: string;
  returnTo?: Href;
}

export function useRequireAuth() {
  const { userId } = useAuth();
  const openAuthPrompt = useAuthPromptStore((s) => s.open);

  return useCallback(
    (options?: RequireAuthOptions) => {
      if (userId) return true;

      openAuthPrompt({
        message: options?.message ?? 'Sign in to continue',
        returnTo: options?.returnTo,
      });
      return false;
    },
    [openAuthPrompt, userId]
  );
}
