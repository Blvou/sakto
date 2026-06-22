import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { hideConversation } from '../api/conversations';
import { chatQueryKeys } from '../types';
import { removeConversationFromCache } from '../utils/unread-cache';

interface HideConversationVariables {
  conversationId: string;
  leaveThread?: boolean;
}

export function useHideConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ conversationId }: HideConversationVariables) => {
      await hideConversation(conversationId);
      return conversationId;
    },
    onMutate: async ({ conversationId }) => {
      removeConversationFromCache(queryClient, conversationId);
    },
    onSuccess: (conversationId, variables) => {
      queryClient.removeQueries({ queryKey: chatQueryKeys.messages(conversationId) });
      queryClient.removeQueries({ queryKey: chatQueryKeys.threadSnapshot(conversationId) });
      queryClient.removeQueries({ queryKey: chatQueryKeys.messageReceipts(conversationId) });
      toast.success('Chat deleted');

      if (variables.leaveThread) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/chat');
        }
      }
    },
    onError: (err, _variables, _context) => {
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
      toast.error(getErrorMessage(err, 'Could not delete chat'));
    },
  });
}
