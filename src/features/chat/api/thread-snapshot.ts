import { supabase } from '@/src/lib/supabase';
import type { Message, Profile } from '../types';
import { MESSAGES_PAGE_SIZE } from '../utils/message-cache';

export interface ThreadSnapshot {
  other_user: Profile;
  listing_title: string | null;
  messages: Message[];
  has_more_messages: boolean;
  recipient_last_read_at: string | null;
  delivered_message_ids: string[];
}

type RpcThreadSnapshot = {
  other_user: Profile;
  listing_title: string | null;
  messages: Message[];
  has_more_messages: boolean;
  recipient_last_read_at: string | null;
  delivered_message_ids: string[];
};

function mapSnapshot(data: RpcThreadSnapshot): ThreadSnapshot {
  return {
    other_user: data.other_user,
    listing_title: data.listing_title,
    messages: data.messages ?? [],
    has_more_messages: Boolean(data.has_more_messages),
    recipient_last_read_at: data.recipient_last_read_at,
    delivered_message_ids: data.delivered_message_ids ?? [],
  };
}

export async function fetchThreadSnapshot(
  conversationId: string,
  userId: string,
  messageLimit = MESSAGES_PAGE_SIZE
): Promise<ThreadSnapshot> {
  const { data, error } = await supabase.rpc('get_thread_snapshot', {
    p_conversation_id: conversationId,
    p_user_id: userId,
    p_message_limit: messageLimit,
  });

  if (error) throw error;
  if (!data) throw new Error('Could not load conversation');

  return mapSnapshot(data as RpcThreadSnapshot);
}
