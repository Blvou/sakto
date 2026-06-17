import type { QueryClient } from '@tanstack/react-query';
import { fetchConversationsPage } from '../api/conversations';
import { chatQueryKeys } from '../types';
import { fetchAndHydrateThreadSnapshot } from './thread-cache';

export function prefetchThreadSnapshot(
  queryClient: QueryClient,
  conversationId: string,
  userId: string
): Promise<void> {
  return fetchAndHydrateThreadSnapshot(queryClient, conversationId, userId).then(() => undefined);
}

export function prefetchConversations(queryClient: QueryClient, userId: string): Promise<void> {
  return queryClient.prefetchInfiniteQuery({
    queryKey: chatQueryKeys.conversations,
    queryFn: ({ pageParam }) => fetchConversationsPage(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    staleTime: 60_000,
  });
}

/** @deprecated Use prefetchThreadSnapshot */
export function prefetchConversationMessages(
  queryClient: QueryClient,
  conversationId: string,
  userId: string
): Promise<void> {
  return prefetchThreadSnapshot(queryClient, conversationId, userId);
}
