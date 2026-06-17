import { useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchMessages, sendMessage, markConversationRead } from '../api/messages';
import type { ThreadSnapshot } from '../api/thread-snapshot';
import { chatQueryKeys } from '../types';
import type { Message } from '../types';
import { useThreadSnapshotReady } from './use-thread-snapshot';
import {
  flattenMessages,
  MESSAGES_PAGE_SIZE,
  prependOptimisticMessage,
  confirmOptimisticMessage,
  restoreMessagesCache,
} from '../utils/message-cache';
import { bumpConversationOnMessage, clearConversationUnread } from '../utils/unread-cache';

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const snapshotReady = useThreadSnapshotReady(conversationId);

  const query = useInfiniteQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, {
        limit: MESSAGES_PAGE_SIZE,
        before: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < MESSAGES_PAGE_SIZE) return undefined;
      if (lastPageParam === undefined) {
        const snapshot = queryClient.getQueryData<ThreadSnapshot>(
          chatQueryKeys.threadSnapshot(conversationId)
        );
        if (snapshot && !snapshot.has_more_messages) return undefined;
      }
      return lastPage[0]?.created_at;
    },
    enabled: !!conversationId && snapshotReady,
    staleTime: 5 * 60_000,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const messages = useMemo(() => flattenMessages(query.data), [query.data]);

  return {
    ...query,
    messages,
  };
}

export function useMarkConversationRead(conversationId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return markConversationRead(conversationId, userId);
    },
    onSuccess: () => {
      clearConversationUnread(queryClient, conversationId);
    },
  });
}

export function useSendMessage(conversationId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      if (!userId) throw new Error('Not authenticated');
      return sendMessage(conversationId, userId, body);
    },
    retry: false,
    onMutate: (body) => {
      if (!userId) return;

      // Do not await: supabase-js ignores AbortSignal, so cancelQueries would block
      // until any in-flight fetchMessages (e.g. load older) finishes — feels like ~1 min send.
      void queryClient.cancelQueries({ queryKey: chatQueryKeys.messages(conversationId) });

      const previous = queryClient.getQueryData<InfiniteData<Message[]>>(
        chatQueryKeys.messages(conversationId)
      );

      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        body: body.trim(),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<Message[]>>(
        chatQueryKeys.messages(conversationId),
        (old) => prependOptimisticMessage(old, optimistic)
      );

      bumpConversationOnMessage(queryClient, conversationId, optimistic, userId);

      return { previous };
    },
    onSuccess: (serverMessage) => {
      queryClient.setQueryData<InfiniteData<Message[]>>(
        chatQueryKeys.messages(conversationId),
        (old) => confirmOptimisticMessage(old, serverMessage)
      );
    },
    onError: (err, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          chatQueryKeys.messages(conversationId),
          restoreMessagesCache(context.previous)
        );
      }
      const message = err instanceof Error ? err.message : 'Failed to send message';
      toast.error(message);
    },
  });
}
