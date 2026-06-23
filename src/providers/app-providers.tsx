import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner-native';
import { queryClient, setupQueryPersistence } from '@/src/lib/query-client';
import { AuthPromptModal } from '@/src/features/auth/components/AuthPromptModal';
import { useAuthInit, useAuth } from '@/src/features/auth/hooks/use-auth';

function isPublicRoute(segments: string[]): boolean {
  if (segments.length === 0) return true;

  const root = segments[0];

  if (root === '(auth)') return true;
  if (root === '(tabs)') return true;
  if (root === 'browse') return true;
  if (root === 'transport') return true;
  if (root === 'search') return true;
  if (root === 'scooter') return true;
  if (root === 'rentals' && segments[1] === 'map') return true;

  // Listing detail is public; edit requires sign-in.
  if (root === 'listing') {
    return segments[2] !== 'edit';
  }

  return false;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onPublicRoute = isPublicRoute(segments);

    if (!isAuthenticated && !inAuthGroup && !onPublicRoute) {
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
      <AuthPromptModal />
      <Toaster />
    </QueryClientProvider>
  );
}
