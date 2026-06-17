import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import type { Message } from '../types';
import { chatQueryKeys } from '../types';
import { asConversationsCache, flattenConversations } from '../utils/conversations-cache';
import { scheduleConversationsInvalidation } from '../utils/invalidate-conversations';
import { bumpConversationOnMessage } from '../utils/unread-cache';

const REALTIME_CONVERSATION_LIMIT = 100;
const RESUBSCRIBE_DEBOUNCE_MS = 300;

function buildMessagesFilter(conversationIds: string[]): string | null {
  if (!conversationIds.length) return null;
  return `conversation_id=in.(${conversationIds.join(',')})`;
}

/**
 * Patch conversation list from Realtime instead of invalidating on every global
 * conversations.updated_at change (which fired for all users' chats).
 */
export function useRealtimeConversationList(userId: string | null) {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const subscribe = () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const data = queryClient.getQueryData(chatQueryKeys.conversations);
      const conversationIds = flattenConversations(asConversationsCache(data))
        .slice(0, REALTIME_CONVERSATION_LIMIT)
        .map((conversation) => conversation.id);

      const messagesFilter = buildMessagesFilter(conversationIds);

      let channel = supabase.channel(`conversations-list:${userId}:${conversationIds.length}`);

      if (messagesFilter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: messagesFilter,
          },
          (payload) => {
            const message = payload.new as Message;
            bumpConversationOnMessage(queryClient, message.conversation_id, message, userId, {
              incrementUnread: true,
            });
          }
        );
      }

      channel = channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          scheduleConversationsInvalidation();
        }
      );

      channelRef.current = channel.subscribe();
    };

    subscribe();

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.queryKey[0] === chatQueryKeys.conversations[0]
      ) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(subscribe, RESUBSCRIBE_DEBOUNCE_MS);
      }
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      unsubscribe();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, queryClient]);
}
