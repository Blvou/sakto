import type { PreferredLang } from '@/src/lib/database.types';
import type { Profile } from '@/src/features/profile/types';

export type { Profile };

export interface ConversationPreview {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  listing_image_url: string | null;
  booking_id: string | null;
  vehicle_title: string | null;
  vehicle_image_url: string | null;
  other_user: Profile;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface MessageTranslation {
  id: string;
  message_id: string;
  target_lang: PreferredLang;
  translated_body: string;
  created_at?: string;
}

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface MessageReceiptState {
  recipientLastReadAt: string | null;
  deliveredMessageIds: ReadonlySet<string>;
}

export const chatQueryKeys = {
  all: ['chat'] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  messageReceipts: (conversationId: string) => ['message-receipts', conversationId] as const,
  threadSnapshot: (conversationId: string) => ['thread-snapshot', conversationId] as const,
  translation: (messageId: string, targetLang: PreferredLang) =>
    ['translation', messageId, targetLang] as const,
  unreadTotal: ['unread-total'] as const,
};
