import { memo } from 'react';
import { MessageBubble } from './MessageBubble';
import { resolveMessageDeliveryStatus } from '../utils/message-status';
import type { Message, MessageDeliveryStatus } from '../types';
import type { PreferredLang } from '@/src/lib/database.types';

interface Props {
  message: Message;
  userId: string | null;
  targetLang: PreferredLang;
  recipientLastReadAt: string | null;
  deliveredMessageIds: ReadonlySet<string>;
  onTranslate: (messageId: string, text: string, targetLang: PreferredLang) => Promise<string>;
  isTranslating: boolean;
}

function getDeliveryStatus(
  message: Message,
  userId: string | null,
  recipientLastReadAt: string | null,
  deliveredMessageIds: ReadonlySet<string>
): MessageDeliveryStatus | null {
  if (!userId || message.sender_id !== userId) return null;
  return resolveMessageDeliveryStatus(
    message,
    { recipientLastReadAt, deliveredMessageIds },
    true
  );
}

export const ChatMessageItem = memo(
  function ChatMessageItem({
    message,
    userId,
    targetLang,
    recipientLastReadAt,
    deliveredMessageIds,
    onTranslate,
    isTranslating,
  }: Props) {
    const isOwn = message.sender_id === userId;
    const deliveryStatus = isOwn
      ? getDeliveryStatus(message, userId, recipientLastReadAt, deliveredMessageIds)
      : null;

    return (
      <MessageBubble
        message={message}
        isOwn={isOwn}
        targetLang={targetLang}
        deliveryStatus={deliveryStatus}
        onTranslate={onTranslate}
        isTranslating={isTranslating}
      />
    );
  },
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.body === next.message.body &&
    prev.message.created_at === next.message.created_at &&
    prev.userId === next.userId &&
    prev.targetLang === next.targetLang &&
    prev.isTranslating === next.isTranslating &&
    (prev.message.sender_id !== prev.userId ||
      (prev.recipientLastReadAt === next.recipientLastReadAt &&
        prev.deliveredMessageIds === next.deliveredMessageIds))
);
