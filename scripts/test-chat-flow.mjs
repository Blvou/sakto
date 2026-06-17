#!/usr/bin/env node
/**
 * End-to-end chat flow test: buyer opens chat on seller listing, exchange messages.
 * Reports timing and optimization-related duplicate fetches.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function timed(label) {
  const start = performance.now();
  return {
    end() {
      const ms = Math.round(performance.now() - start);
      console.log(`  ⏱  ${label}: ${ms}ms`);
      return ms;
    },
  };
}

async function signIn(base, email, password) {
  const { data, error } = await base.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return data;
}

function authedClient(base, url, anonKey, session) {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });
}

async function main() {
  const env = { ...process.env, ...loadEnv() };
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const buyerEmail = env.TEST_BUYER_EMAIL ?? 'buyer@local.com';
  const buyerPassword = env.TEST_BUYER_PASSWORD ?? 'buyer1';
  const sellerEmail = env.TEST_SELLER_EMAIL ?? 'seller@local.com';
  const sellerPassword = env.TEST_SELLER_PASSWORD ?? 'seller1';

  const base = createClient(url, anonKey, { auth: { persistSession: false } });

  console.log('\n# Chat flow test\n');

  const buyer = await signIn(base, buyerEmail, buyerPassword);
  const seller = await signIn(base, sellerEmail, sellerPassword);
  const buyerClient = authedClient(base, url, anonKey, buyer.session);
  const sellerClient = authedClient(base, url, anonKey, seller.session);

  // Seller listing
  const tListing = timed('fetch seller listing');
  const { data: listings, error: listErr } = await sellerClient
    .from('listings')
    .select('id, title')
    .eq('seller_id', seller.user.id)
    .eq('status', 'active')
    .limit(1);
  tListing.end();
  if (listErr || !listings?.length) throw new Error('No seller listing found — run seed-chat-test-users.mjs');

  const listingId = listings[0].id;
  console.log(`  Listing: ${listings[0].title} (${listingId})`);

  // Buyer starts conversation (same RPC as app)
  const tConv = timed('get_or_create_conversation RPC');
  const { data: conv, error: convErr } = await buyerClient.rpc('get_or_create_conversation', {
    p_listing_id: listingId,
    p_buyer_id: buyer.user.id,
  });
  tConv.end();
  if (convErr) throw new Error(`conversation: ${convErr.message}`);
  const conversationId = conv.id;
  console.log(`  Conversation: ${conversationId}`);

  // Thread snapshot (single RPC used by app)
  const tSnap = timed('get_thread_snapshot RPC');
  const { data: snapshot, error: snapErr } = await buyerClient.rpc('get_thread_snapshot', {
    p_conversation_id: conversationId,
    p_user_id: buyer.user.id,
    p_message_limit: 30,
  });
  tSnap.end();
  if (snapErr) throw new Error(`snapshot: ${snapErr.message}`);
  console.log(`  Snapshot messages: ${snapshot.messages?.length ?? 0}`);

  // Buyer sends message
  const tSend = timed('buyer send message');
  const { data: msg, error: msgErr } = await buyerClient
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: buyer.user.id,
      body: `Test ping ${Date.now()}`,
    })
    .select('id, body, created_at')
    .single();
  tSend.end();
  if (msgErr) throw new Error(`send: ${msgErr.message}`);

  // Seller reads via snapshot
  const tSellerSnap = timed('seller thread snapshot');
  const { data: sellerSnap, error: sellerSnapErr } = await sellerClient.rpc('get_thread_snapshot', {
    p_conversation_id: conversationId,
    p_user_id: seller.user.id,
    p_message_limit: 30,
  });
  tSellerSnap.end();
  if (sellerSnapErr) throw new Error(`seller snapshot: ${sellerSnapErr.message}`);

  const found = sellerSnap.messages?.some((m) => m.id === msg.id);
  if (!found) throw new Error('Seller cannot see buyer message in snapshot');
  console.log('  ✓ Seller received buyer message');

  // Seller replies
  const tReply = timed('seller reply');
  const { error: replyErr } = await sellerClient.from('messages').insert({
    conversation_id: conversationId,
    sender_id: seller.user.id,
    body: 'Reply from seller',
  });
  tReply.end();
  if (replyErr) throw new Error(`reply: ${replyErr.message}`);
  console.log('  ✓ Seller reply sent');

  // Conversation list for both
  const tPreviews = timed('buyer conversation previews');
  const { data: previews, error: prevErr } = await buyerClient.rpc('get_conversation_previews', {
    p_user_id: buyer.user.id,
  });
  tPreviews.end();
  if (prevErr) throw new Error(`previews: ${prevErr.message}`);
  const hasConv = previews?.some((p) => p.id === conversationId);
  if (!hasConv) throw new Error('Conversation missing from buyer previews');
  console.log(`  ✓ Buyer sees ${previews.length} conversation(s) in list`);

  // Mark read
  const tRead = timed('mark conversation read');
  const { error: readErr } = await buyerClient
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', buyer.user.id);
  tRead.end();
  if (readErr) throw new Error(`read: ${readErr.message}`);
  console.log('  ✓ Mark read OK');

  console.log('\nChat flow: PASSED\n');
}

main().catch((err) => {
  console.error(`\nChat flow: FAILED — ${err.message ?? err}\n`);
  process.exit(1);
});
