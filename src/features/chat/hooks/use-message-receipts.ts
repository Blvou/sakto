import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchMessageReceiptState, markMessagesDelivered } from '../api/receipts';
import { chatQueryKeys } from '../types';
import type { Message, MessageReceiptState } from '../types';
import { patchDeliveredInCache } from '../utils/receipt-cache';

export function useMessageReceipts(
  conversationId: string,
  recipientId: string | undefined,
  enabled = true
) {
  const queryClient = useQueryClient();
  const cached = queryClient.getQueryData<MessageReceiptState>(
    chatQueryKeys.messageReceipts(conversationId)
  );

  return useQuery({
    queryKey: chatQueryKeys.messageReceipts(conversationId),
    queryFn: () => {
      if (!recipientId) throw new Error('Recipient not found');
      return fetchMessageReceiptState(conversationId, recipientId);
    },
    enabled: enabled && !!conversationId && !!recipientId && !cached,
    initialData: cached,
    staleTime: 30_000,
  });
}

export function useMarkIncomingDelivered(
  conversationId: string,
  messages: Message[],
  recipientId: string | undefined
) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const deliveredRef = useRef(new Set<string>());
  const pendingRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    deliveredRef.current = new Set();
    pendingRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (!userId || !recipientId || userId !== recipientId || pendingRef.current) return;

    const incomingIds = messagesRef.current
      .filter(
        (message) =>
          message.sender_id !== userId &&
          !message.id.startsWith('temp-') &&
          !deliveredRef.current.has(message.id)
      )
      .map((message) => message.id);

    if (!incomingIds.length) return;

    pendingRef.current = true;

    const task = InteractionManager.runAfterInteractions(() => {
      markMessagesDelivered(incomingIds, userId)
        .then(() => {
          for (const id of incomingIds) {
            deliveredRef.current.add(id);
          }
          patchDeliveredInCache(queryClient, conversationId, incomingIds);
        })
        .catch(() => {
          // Non-blocking: receipts table may not exist until migration is applied.
        })
        .finally(() => {
          pendingRef.current = false;
        });
    });

    return () => task.cancel();
  }, [conversationId, messages.length, recipientId, userId, queryClient]);
}
