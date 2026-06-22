import { getVehiclePhotoSource } from '@/src/features/rentals/api/vehicles';
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
  booking_id: string | null;
  vehicle_title: string | null;
  vehicle_image_path: string | null;
  other_user_id: string;
  other_user_display_name: string;
  other_user_avatar_url: string | null;
  other_user_preferred_lang: PreferredLang;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
};

type RpcListingConversationResult = {
  id: string;
  listing_id: string;
  listing_title: string | null;
  listing_image_url: string | null;
  other_user: Profile;
};

type RpcBookingConversationResult = {
  id: string;
  booking_id: string;
  vehicle_title: string | null;
  vehicle_image_path: string | null;
  other_user: Profile;
};

function resolveVehicleImageUrl(path: string | null): string | null {
  if (!path) return null;
  const source = getVehiclePhotoSource(path);
  return typeof source === 'object' && 'uri' in source ? source.uri : null;
}

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
    booking_id: row.booking_id,
    vehicle_title: row.vehicle_title,
    vehicle_image_url: resolveVehicleImageUrl(row.vehicle_image_path),
    other_user: otherUser,
    last_message: row.last_message,
    last_message_at: row.last_message_at,
    unread_count: Number(row.unread_count),
  };
}

function mapListingRpcResult(data: RpcListingConversationResult): CreateConversationResult {
  return {
    id: data.id,
    listing_id: data.listing_id,
    listing_title: data.listing_title,
    listing_image_url: data.listing_image_url,
    booking_id: null,
    vehicle_title: null,
    vehicle_image_url: null,
    other_user: data.other_user,
  };
}

function mapBookingRpcResult(data: RpcBookingConversationResult): CreateConversationResult {
  return {
    id: data.id,
    listing_id: null,
    listing_title: null,
    listing_image_url: null,
    booking_id: data.booking_id,
    vehicle_title: data.vehicle_title,
    vehicle_image_url: resolveVehicleImageUrl(data.vehicle_image_path),
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

  return mapListingRpcResult(data as RpcListingConversationResult);
}

export async function getOrCreateBookingConversation(
  bookingId: string
): Promise<CreateConversationResult> {
  const { data, error } = await supabase.rpc('get_or_create_booking_conversation', {
    p_booking_id: bookingId,
  });

  if (error) throw error;
  if (!data) throw new Error('Could not start chat');

  return mapBookingRpcResult(data as RpcBookingConversationResult);
}

export async function fetchUnreadTotal(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_unread_total', {
    p_user_id: userId,
  });

  if (error) throw error;
  return Number(data ?? 0);
}

export async function hideConversation(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('hide_conversation', {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
}
