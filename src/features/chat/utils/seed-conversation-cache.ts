import type { QueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type { ConversationPreview, Profile } from '../types';
import { chatQueryKeys } from '../types';
import { updateConversationsCache, type ConversationsPage } from './conversations-cache';
import { syncUnreadTotalFromConversations } from './unread-cache';

export interface CreateConversationResult {
  id: string;
  listing_id: string;
  listing_title: string | null;
  listing_image_url: string | null;
  other_user: Profile;
}

export function seedConversationCaches(
  queryClient: QueryClient,
  result: CreateConversationResult
): void {
  const preview: ConversationPreview = {
    id: result.id,
    listing_id: result.listing_id,
    listing_title: result.listing_title,
    listing_image_url: result.listing_image_url,
    other_user: result.other_user,
    last_message: null,
    last_message_at: null,
    unread_count: 0,
  };

  queryClient.setQueryData<InfiniteData<ConversationsPage>>(chatQueryKeys.conversations, (old) =>
    updateConversationsCache(old, (conversations) => [
      preview,
      ...conversations.filter((conversation) => conversation.id !== result.id),
    ])
  );

  queryClient.setQueryData(['conversation-meta', result.id], {
    otherUser: result.other_user,
    listingTitle: result.listing_title,
  });

  syncUnreadTotalFromConversations(queryClient);
}
