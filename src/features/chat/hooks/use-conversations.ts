import { useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchConversationsPage, fetchUnreadTotal } from '../api/conversations';
import { chatQueryKeys } from '../types';
import {
  asConversationsCache,
  flattenConversations,
  type ConversationsPage,
} from '../utils/conversations-cache';
import { deriveUnreadTotal } from '../utils/unread-cache';

export function useConversations() {
  const { userId, isInitialized } = useAuth();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: chatQueryKeys.conversations,
    queryFn: ({ pageParam }) => {
      if (!userId) throw new Error('Not authenticated');
      return fetchConversationsPage(userId, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isInitialized && !!userId,
    staleTime: 60_000,
  });

  const conversations = useMemo(() => flattenConversations(query.data), [query.data]);

  useEffect(() => {
    if (conversations.length) {
      queryClient.setQueryData(chatQueryKeys.unreadTotal, deriveUnreadTotal(conversations));
    }
  }, [conversations, queryClient]);

  return {
    ...query,
    data: conversations,
    conversations,
  };
}

export function useUnreadTotal() {
  const { userId, isInitialized } = useAuth();
  const queryClient = useQueryClient();

  // Observe conversations cache without fetching — same pattern as useThreadSnapshotReady.
  const { data: conversationsData } = useQuery<InfiniteData<ConversationsPage>>({
    queryKey: chatQueryKeys.conversations,
    queryFn: async () => {
      const cached = queryClient.getQueryData<InfiniteData<ConversationsPage>>(
        chatQueryKeys.conversations
      );
      if (cached) return cached;
      throw new Error('Conversations not loaded');
    },
    enabled: false,
    staleTime: Infinity,
  });

  const derivedTotal = useMemo(() => {
    if (!conversationsData) return undefined;
    return deriveUnreadTotal(flattenConversations(conversationsData));
  }, [conversationsData]);

  const query = useQuery({
    queryKey: chatQueryKeys.unreadTotal,
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchUnreadTotal(userId);
    },
    enabled: isInitialized && !!userId && derivedTotal === undefined,
    staleTime: 60_000,
  });

  return {
    ...query,
    data: derivedTotal ?? query.data ?? 0,
  };
}
