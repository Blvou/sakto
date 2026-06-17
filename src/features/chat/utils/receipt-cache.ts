import type { QueryClient } from '@tanstack/react-query';
import { chatQueryKeys } from '../types';
import type { MessageReceiptState } from '../types';

export function patchDeliveredInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageIds: string[]
): void {
  if (!messageIds.length) return;

  queryClient.setQueryData<MessageReceiptState>(
    chatQueryKeys.messageReceipts(conversationId),
    (old) => {
      if (!old) return old;
      const deliveredMessageIds = new Set(old.deliveredMessageIds);
      for (const id of messageIds) {
        deliveredMessageIds.add(id);
      }
      return { ...old, deliveredMessageIds };
    }
  );
}

export function patchRecipientReadAt(
  queryClient: QueryClient,
  conversationId: string,
  lastReadAt: string
): void {
  queryClient.setQueryData<MessageReceiptState>(
    chatQueryKeys.messageReceipts(conversationId),
    (old) => {
      if (!old) return { recipientLastReadAt: lastReadAt, deliveredMessageIds: new Set() };
      return { ...old, recipientLastReadAt: lastReadAt };
    }
  );
}
