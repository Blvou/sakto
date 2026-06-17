import { supabase } from '@/src/lib/supabase';
import type { PreferredLang } from '@/src/lib/database.types';
import type { ConversationPreview, Profile } from '../types';
import type { ConversationsPage } from '../utils/conversations-cache';
import { CONVERSATIONS_PAGE_SIZE } from '../utils/conversations-cache';
import type { CreateConversationResult } from '../utils/seed-conversation-cache';

type ConversationPreviewRow = {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  listing_image_url: string | null;
  other_user_id: string;
  other_user_display_name: string;
  other_user_avatar_url: string | null;
  other_user_preferred_lang: PreferredLang;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
};

type RpcConversationResult = {
  id: string;
  listing_id: string;
  listing_title: string | null;
  listing_image_url: string | null;
  other_user: Profile;
};

function mapPreviewRow(row: ConversationPreviewRow): ConversationPreview {
  const otherUser: Profile = {
    id: row.other_user_id,
    display_name: row.other_user_display_name,
    avatar_url: row.other_user_avatar_url,
    preferred_lang: row.other_user_preferred_lang,
  };

  return {
    id: row.id,
    listing_id: row.listing_id,
    listing_title: row.listing_title,
    listing_image_url: row.listing_image_url,
    other_user: otherUser,
    last_message: row.last_message,
    last_message_at: row.last_message_at,
    unread_count: Number(row.unread_count),
  };
}

function mapRpcResult(data: RpcConversationResult): CreateConversationResult {
  return {
    id: data.id,
    listing_id: data.listing_id,
    listing_title: data.listing_title,
    listing_image_url: data.listing_image_url,
    other_user: data.other_user,
  };
}

export async function fetchConversationsPage(
  userId: string,
  cursor?: string,
  limit = CONVERSATIONS_PAGE_SIZE
): Promise<ConversationsPage> {
  const { data, error } = await supabase.rpc('get_conversation_previews', {
    p_user_id: userId,
    p_limit: limit,
    p_cursor: cursor ?? null,
  });

  if (error) throw error;

  const items = ((data ?? []) as ConversationPreviewRow[]).map(mapPreviewRow);
  const last = items[items.length - 1];

  return {
    items,
    nextCursor:
      items.length === limit && last?.last_message_at ? last.last_message_at : undefined,
  };
}

/** @deprecated Use fetchConversationsPage for paginated conversation lists. */
export async function fetchConversations(userId: string): Promise<ConversationPreview[]> {
  const page = await fetchConversationsPage(userId);
  return page.items;
}

/** One Supabase round-trip: validate listing, find or create conversation, return meta for UI cache. */
export async function getOrCreateConversation(
  listingId: string,
  buyerId: string
): Promise<CreateConversationResult> {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_listing_id: listingId,
    p_buyer_id: buyerId,
  });

  if (error) throw error;
  if (!data) throw new Error('Could not start chat');

  return mapRpcResult(data as RpcConversationResult);
}

export async function fetchUnreadTotal(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_unread_total', {
    p_user_id: userId,
  });

  if (error) throw error;
  return Number(data ?? 0);
}
