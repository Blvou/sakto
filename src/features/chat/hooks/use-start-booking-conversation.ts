import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getOrCreateBookingConversation } from '../api/conversations';
import { prefetchThreadSnapshot } from '../utils/prefetch-chat';
import { seedConversationCaches } from '../utils/seed-conversation-cache';

export function useStartBookingConversation() {
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!userId) throw new Error('Sign in to start a chat');
      const result = await getOrCreateBookingConversation(bookingId);
      seedConversationCaches(queryClient, result);
      void prefetchThreadSnapshot(queryClient, result.id, userId);
      return result;
    },
    onSuccess: (result) => {
      router.push(`/chat/${result.id}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not start chat'));
    },
  });
}
