import { supabase } from '@/src/lib/supabase';
import type { MessageReceiptState } from '../types';

export async function fetchMessageReceiptState(
  conversationId: string,
  recipientId: string
): Promise<MessageReceiptState> {
  const [participantResult, receiptsResult] = await Promise.all([
    supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', recipientId)
      .maybeSingle(),
    supabase
      .from('message_receipts')
      .select('message_id, messages!inner(conversation_id)')
      .eq('user_id', recipientId)
      .eq('messages.conversation_id', conversationId),
  ]);

  if (participantResult.error) throw participantResult.error;
  if (receiptsResult.error) throw receiptsResult.error;

  return {
    recipientLastReadAt: participantResult.data?.last_read_at ?? null,
    deliveredMessageIds: new Set(receiptsResult.data?.map((row) => row.message_id) ?? []),
  };
}

export async function markMessagesDelivered(
  messageIds: string[],
  recipientId: string
): Promise<void> {
  const uniqueIds = [...new Set(messageIds.filter((id) => !id.startsWith('temp-')))];
  if (!uniqueIds.length) return;

  const rows = uniqueIds.map((messageId) => ({
    message_id: messageId,
    user_id: recipientId,
  }));

  const { error } = await supabase
    .from('message_receipts')
    .upsert(rows, { onConflict: 'message_id,user_id', ignoreDuplicates: true });

  if (error) throw error;
}
