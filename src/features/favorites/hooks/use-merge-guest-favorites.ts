import { useEffect, useRef } from 'react';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { queryClient } from '@/src/lib/query-client';
import { mergeGuestFavoritesIntoAccount } from '../storage/guest-favorites';
import { favoriteQueryKeys } from './use-favorites';

export function useMergeGuestFavoritesOnSignIn() {
  const { userId } = useAuth();
  const mergedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      mergedForUserRef.current = null;
      return;
    }
    if (mergedForUserRef.current === userId) return;

    let cancelled = false;

    void (async () => {
      try {
        await mergeGuestFavoritesIntoAccount(userId);
        if (cancelled) return;
        mergedForUserRef.current = userId;
        await queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.all });
      } catch (err) {
        console.warn('Guest favorites merge failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);
}
