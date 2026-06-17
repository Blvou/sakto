import { supabase } from '@/src/lib/supabase';
import type { PreferredLang } from '@/src/lib/database.types';
import type { Message as ChatMessage, MessageTranslation } from '../types';
import { translateWithMyMemory } from './translate-fallback';

export interface FetchMessagesOptions {
  limit?: number;
  before?: string;
}

export async function fetchMessages(
  conversationId: string,
  options?: FetchMessagesOptions
): Promise<ChatMessage[]> {
  const limit = options?.limit ?? 50;

  let query = supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (options?.before) {
    query = query.lt('created_at', options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<ChatMessage> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message cannot be empty');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: trimmed,
    })
    .select('id, conversation_id, sender_id, body, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchCachedTranslation(
  messageId: string,
  targetLang: PreferredLang
): Promise<MessageTranslation | null> {
  const { data, error } = await supabase
    .from('message_translations')
    .select('id, message_id, target_lang, translated_body, created_at')
    .eq('message_id', messageId)
    .eq('target_lang', targetLang)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function cacheTranslation(
  messageId: string,
  targetLang: PreferredLang,
  translatedBody: string
): Promise<MessageTranslation> {
  const { data, error } = await supabase
    .from('message_translations')
    .upsert(
      {
        message_id: messageId,
        target_lang: targetLang,
        translated_body: translatedBody,
      },
      { onConflict: 'message_id,target_lang' }
    )
    .select('id, message_id, target_lang, translated_body, created_at')
    .single();

  if (error) throw error;
  return data;
}

export interface TranslateResponse {
  translatedText: string;
  detectedSourceLang: string;
}

export async function translateMessage(
  messageId: string,
  text: string,
  targetLang: PreferredLang,
  _sourceLang?: PreferredLang
): Promise<TranslateResponse> {
  try {
    const { data, error } = await supabase.functions.invoke<TranslateResponse>('translate', {
      body: { messageId, text, targetLang },
    });

    if (!error && data?.translatedText) {
      return data;
    }
  } catch {
    // Edge Function not deployed or unreachable — use fallback below.
  }

  return translateWithMyMemory(text, targetLang);
}
