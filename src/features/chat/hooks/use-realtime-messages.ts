import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { chatQueryKeys } from '../types';
import type { Message } from '../types';
import { appendMessageToCache, confirmOptimisticMessage } from '../utils/message-cache';
import { patchRecipientReadAt } from '../utils/receipt-cache';
import { bumpConversationOnMessage } from '../utils/unread-cache';

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          if (newMessage.sender_id === userId) {
            queryClient.setQueryData<InfiniteData<Message[]>>(
              chatQueryKeys.messages(conversationId),
              (old) => confirmOptimisticMessage(old, newMessage)
            );
          } else {
            queryClient.setQueryData<InfiniteData<Message[]>>(
              chatQueryKeys.messages(conversationId),
              (old) => appendMessageToCache(old, newMessage)
            );
          }

          bumpConversationOnMessage(queryClient, conversationId, newMessage, userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { user_id: string; last_read_at: string };
          if (row.user_id !== userId) {
            patchRecipientReadAt(queryClient, conversationId, row.last_read_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, userId]);
}
