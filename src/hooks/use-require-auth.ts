import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { toast } from 'sonner-native';

interface RequireAuthOptions {
  message?: string;
  returnTo?: Href;
}

export function useRequireAuth() {
  const { userId } = useAuth();
  const router = useRouter();

  return useCallback(
    (options?: RequireAuthOptions) => {
      if (userId) return true;

      toast.error(options?.message ?? 'Sign in to continue');
      router.push({
        pathname: '/(auth)/login',
        params: options?.returnTo ? { returnTo: String(options.returnTo) } : undefined,
      });
      return false;
    },
    [router, userId]
  );
}
