import { useEffect, useRef } from 'react';
import { getListingViewerKey, incrementListingView } from '../api/listing-views';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

/** Fire-and-forget view count increment when a listing detail opens. */
export function useIncrementListingView(listingId: string | undefined, enabled: boolean) {
  const { userId } = useAuth();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !listingId || trackedRef.current === listingId) return;

    trackedRef.current = listingId;

    void (async () => {
      const viewerKey = await getListingViewerKey(userId);
      await incrementListingView(listingId, viewerKey);
    })();
  }, [enabled, listingId, userId]);
}
