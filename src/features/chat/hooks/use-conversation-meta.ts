import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import type { ConversationPreview, Profile } from '../types';
import { chatQueryKeys } from '../types';
import { flattenConversations, asConversationsCache } from '../utils/conversations-cache';

export interface ConversationMeta {
  otherUser: Profile;
  listingTitle: string | null;
}

async function fetchConversationMeta(conversationId: string, userId: string): Promise<ConversationMeta> {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      listings ( title ),
      conversation_participants ( user_id, profiles ( id, display_name, avatar_url, preferred_lang ) )
    `
    )
    .eq('id', conversationId)
    .single();

  if (error) throw error;

  type MetaRow = {
    id: string;
    listings: { title: string } | null;
    conversation_participants: Array<{
      user_id: string;
      profiles: Profile;
    }>;
  };

  const row = data as unknown as MetaRow;
  const otherUser = row.conversation_participants.find((p) => p.user_id !== userId)?.profiles ?? null;
  if (!otherUser) throw new Error('Conversation not found');

  return { otherUser, listingTitle: row.listings?.title ?? null };
}

export function getConversationMetaFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string
): ConversationMeta | undefined {
  const data = queryClient.getQueryData(chatQueryKeys.conversations);
  const preview = flattenConversations(asConversationsCache(data)).find(
    (conversation) => conversation.id === conversationId
  );
  if (!preview) return undefined;

  return {
    otherUser: preview.other_user,
    listingTitle: preview.vehicle_title ?? preview.listing_title,
  };
}

export function useConversationMeta(conversationId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const cachedMeta =
    getConversationMetaFromCache(queryClient, conversationId) ??
    queryClient.getQueryData<ConversationMeta>(['conversation-meta', conversationId]);

  return useQuery({
    queryKey: ['conversation-meta', conversationId],
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchConversationMeta(conversationId, userId);
    },
    enabled: !!conversationId && !!userId && !cachedMeta,
    initialData: cachedMeta,
    staleTime: 5 * 60_000,
  });
}
