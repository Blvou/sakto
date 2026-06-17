import { useEffect, useRef } from 'react';
import { isAuthContextSupported } from '@/src/lib/auth-context';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import { getErrorMessage } from '@/src/lib/errors';
import { seedDemoListingsIfNeeded } from '@/src/features/listings/api/listings';
import { fetchMyProfile } from '@/src/features/profile/api/profile';
import { profileQueryKeys } from '@/src/features/profile/types';
import { queryClient } from '@/src/lib/query-client';
import { prefetchConversations } from '@/src/features/chat/utils/prefetch-chat';
import { useAuthStore } from '../store/auth-store';

let demoSeedStarted = false;

function runDemoSeedOnce(userId: string) {
  if (demoSeedStarted) return;
  demoSeedStarted = true;
  seedDemoListingsIfNeeded(userId).catch((err) => {
    demoSeedStarted = false;
    console.warn('Demo listings seed skipped:', getErrorMessage(err));
  });
}

function warmChatCache(userId: string) {
  void prefetchConversations(queryClient, userId);
  void queryClient.prefetchQuery({
    queryKey: profileQueryKeys.my(userId),
    queryFn: () => fetchMyProfile(userId),
    staleTime: 10 * 60_000,
  });
}

export function useAuthInit() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const seededUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthContextSupported()) {
      setSession(null);
      setInitialized(true);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setInitialized(true);
        if (session?.user?.id) {
          warmChatCache(session.user.id);
          if (seededUserRef.current !== session.user.id) {
            seededUserRef.current = session.user.id;
            runDemoSeedOnce(session.user.id);
          }
        }
      })
      .catch((err) => {
        console.warn('Auth session restore failed:', getErrorMessage(err));
        setSession(null);
        setInitialized(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);
      if (session?.user?.id) {
        warmChatCache(session.user.id);
        if (seededUserRef.current !== session.user.id) {
          seededUserRef.current = session.user.id;
          runDemoSeedOnce(session.user.id);
        }
      } else {
        seededUserRef.current = null;
        demoSeedStarted = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setInitialized]);
}

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return {
    session,
    user,
    isInitialized,
    isAuthenticated: !!session,
    userId: user?.id ?? null,
  };
}
