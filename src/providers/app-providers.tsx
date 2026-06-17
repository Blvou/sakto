import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner-native';
import { queryClient, setupQueryPersistence } from '@/src/lib/query-client';
import { useAuthInit, useAuth } from '@/src/features/auth/hooks/use-auth';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAuthInit();

  useEffect(() => {
    setupQueryPersistence();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>{children}</AuthGate>
      <Toaster />
    </QueryClientProvider>
  );
}
