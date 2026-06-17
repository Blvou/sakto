import type { Message, MessageDeliveryStatus, MessageReceiptState } from '../types';

export function resolveMessageDeliveryStatus(
  message: Message,
  receiptState: MessageReceiptState | undefined,
  isOwn: boolean
): MessageDeliveryStatus | null {
  if (!isOwn) return null;

  if (message.id.startsWith('temp-')) {
    return 'sending';
  }

  const { recipientLastReadAt, deliveredMessageIds } = receiptState ?? {
    recipientLastReadAt: null,
    deliveredMessageIds: new Set<string>(),
  };

  if (
    recipientLastReadAt &&
    new Date(message.created_at).getTime() <= new Date(recipientLastReadAt).getTime()
  ) {
    return 'read';
  }

  if (deliveredMessageIds.has(message.id)) {
    return 'delivered';
  }

  return 'sent';
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
