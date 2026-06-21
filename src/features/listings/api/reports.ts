import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import type { ListingReportReason } from '../types';

export async function submitListingReport(
  listingId: string,
  reporterId: string,
  reason: ListingReportReason,
  details?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return;
  }

  const { error } = await supabase.from('listing_reports').insert({
    listing_id: listingId,
    reporter_id: reporterId,
    reason,
    details: details ?? null,
  });

  if (error) throw error;
}

export async function hasUserReportedListing(
  listingId: string,
  reporterId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data, error } = await supabase
    .from('listing_reports')
    .select('id')
    .eq('listing_id', listingId)
    .eq('reporter_id', reporterId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
