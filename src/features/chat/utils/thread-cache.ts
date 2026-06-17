import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { ThreadSnapshot } from '../api/thread-snapshot';
import type { ConversationMeta } from '../hooks/use-conversation-meta';
import { getConversationMetaFromCache } from '../hooks/use-conversation-meta';
import type { Message, MessageReceiptState } from '../types';
import { chatQueryKeys } from '../types';
import { fetchThreadSnapshot } from '../api/thread-snapshot';
import { MESSAGES_PAGE_SIZE } from './message-cache';

export function hasWarmThreadCache(queryClient: QueryClient, conversationId: string): boolean {
  const meta = getConversationMetaFromCache(queryClient, conversationId);
  const messages = queryClient.getQueryData<InfiniteData<Message[]>>(
    chatQueryKeys.messages(conversationId)
  );
  return !!meta && (messages?.pages?.length ?? 0) > 0;
}

export function hydrateThreadCaches(
  queryClient: QueryClient,
  conversationId: string,
  snapshot: ThreadSnapshot
): void {
  const meta: ConversationMeta = {
    otherUser: snapshot.other_user,
    listingTitle: snapshot.listing_title,
  };

  queryClient.setQueryData(['conversation-meta', conversationId], meta);

  const receiptState: MessageReceiptState = {
    recipientLastReadAt: snapshot.recipient_last_read_at,
    deliveredMessageIds: new Set(snapshot.delivered_message_ids),
  };
  queryClient.setQueryData(chatQueryKeys.messageReceipts(conversationId), receiptState);

  queryClient.setQueryData<InfiniteData<Message[]>>(chatQueryKeys.messages(conversationId), {
    pages: [snapshot.messages],
    pageParams: [undefined],
  });

  queryClient.setQueryData(chatQueryKeys.threadSnapshot(conversationId), snapshot);
}

export async function fetchAndHydrateThreadSnapshot(
  queryClient: QueryClient,
  conversationId: string,
  userId: string
): Promise<ThreadSnapshot> {
  const snapshot = await fetchThreadSnapshot(conversationId, userId, MESSAGES_PAGE_SIZE);
  hydrateThreadCaches(queryClient, conversationId, snapshot);
  return snapshot;
}
