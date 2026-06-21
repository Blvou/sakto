import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { hasUserReportedListing, submitListingReport } from '../api/reports';
import { reportListingSchema } from '../schemas';
import { listingQueryKeys, type ListingReportReason } from '../types';

export function useHasReportedListing(listingId: string | undefined) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: listingQueryKeys.report(listingId ?? '', userId ?? ''),
    queryFn: () => {
      if (!listingId || !userId) return false;
      return hasUserReportedListing(listingId, userId);
    },
    enabled: !!listingId && !!userId,
    staleTime: 5 * 60_000,
  });
}

export function useReportListing(listingId: string | undefined) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reason,
      details,
    }: {
      reason: ListingReportReason;
      details?: string;
    }) => {
      if (!listingId || !userId) throw new Error('Sign in to report a listing');

      const parsed = reportListingSchema.safeParse({ listingId, reason, details });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid report');
      }

      await submitListingReport(listingId, userId, reason, details);
    },
    onSuccess: () => {
      if (listingId && userId) {
        queryClient.setQueryData(listingQueryKeys.report(listingId, userId), true);
      }
      toast.success('Report submitted. Thank you for helping keep Sakto safe.');
    },
    onError: (err) => {
      const message = getErrorMessage(err, 'Could not submit report');
      if (message.toLowerCase().includes('duplicate') || message.includes('unique')) {
        toast.error('You already reported this listing');
        return;
      }
      toast.error(message);
    },
  });
}
