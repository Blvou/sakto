import type { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { ConversationPreview, Message } from '../types';
import { chatQueryKeys } from '../types';
import {
  flattenConversations,
  updateConversationsCache,
  type ConversationsPage,
} from './conversations-cache';

export function deriveUnreadTotal(conversations: ConversationPreview[] | undefined): number {
  if (!conversations?.length) return 0;
  return conversations.reduce((sum, conversation) => sum + conversation.unread_count, 0);
}

export function syncUnreadTotalFromConversations(queryClient: QueryClient): void {
  const data = queryClient.getQueryData<InfiniteData<ConversationsPage>>(chatQueryKeys.conversations);
  const conversations = flattenConversations(data);
  if (conversations.length) {
    queryClient.setQueryData(chatQueryKeys.unreadTotal, deriveUnreadTotal(conversations));
  }
}

export function patchConversationInCache(
  queryClient: QueryClient,
  conversationId: string,
  patch: Partial<Pick<ConversationPreview, 'last_message' | 'last_message_at' | 'unread_count'>>
): void {
  queryClient.setQueryData<InfiniteData<ConversationsPage>>(chatQueryKeys.conversations, (old) =>
    updateConversationsCache(old, (conversations) =>
      conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, ...patch } : conversation
      )
    )
  );
  syncUnreadTotalFromConversations(queryClient);
}

export function clearConversationUnread(
  queryClient: QueryClient,
  conversationId: string
): void {
  patchConversationInCache(queryClient, conversationId, { unread_count: 0 });
}

/** Move conversation to top and update preview after a new message — no network refetch. */
export function bumpConversationOnMessage(
  queryClient: QueryClient,
  conversationId: string,
  message: Message,
  viewerUserId: string,
  options?: { incrementUnread?: boolean }
): void {
  const isIncoming = message.sender_id !== viewerUserId;

  queryClient.setQueryData<InfiniteData<ConversationsPage>>(chatQueryKeys.conversations, (old) =>
    updateConversationsCache(old, (conversations) => {
      const index = conversations.findIndex((conversation) => conversation.id === conversationId);
      if (index === -1) return conversations;

      const current = conversations[index];
      const updated: ConversationPreview = {
        ...current,
        last_message: message.body,
        last_message_at: message.created_at,
        unread_count:
          options?.incrementUnread && isIncoming
            ? current.unread_count + 1
            : current.unread_count,
      };

      return [updated, ...conversations.filter((_, i) => i !== index)];
    })
  );

  syncUnreadTotalFromConversations(queryClient);
}
