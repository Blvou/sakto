import { getClientStorage } from '@/src/lib/storage';
import { supabase } from '@/src/lib/supabase';

const VIEWER_KEY_STORAGE = 'listing_viewer_key';

function createAnonymousViewerKey(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable key for view dedupe — auth uid or persisted anon id. */
export async function getListingViewerKey(userId: string | null | undefined): Promise<string> {
  if (userId) return userId;

  const storage = getClientStorage();
  const existing = await storage.getItem(VIEWER_KEY_STORAGE);
  if (existing) return existing;

  const next = createAnonymousViewerKey();
  await storage.setItem(VIEWER_KEY_STORAGE, next);
  return next;
}

export async function incrementListingView(
  listingId: string,
  viewerKey: string
): Promise<number | null> {
  const { data, error } = await supabase.rpc('increment_listing_view', {
    p_listing_id: listingId,
    p_viewer_key: viewerKey,
  });

  if (error) {
    console.warn('[incrementListingView]', error.message);
    return null;
  }

  return typeof data === 'number' ? data : null;
}
