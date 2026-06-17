#!/usr/bin/env node
/**
 * Live BOLA/IDOR probes for Sakto chat via Supabase REST API.
 * Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

/** @type {{ level: 'pass' | 'fail' | 'skip'; message: string }[]} */
const results = [];

function pass(msg) {
  results.push({ level: 'pass', message: msg });
  console.log(`  ✅ ${msg}`);
}

function fail(msg) {
  results.push({ level: 'fail', message: msg });
  console.log(`  🔴 ${msg}`);
}

function skip(msg) {
  results.push({ level: 'skip', message: msg });
  console.log(`  ⏭️  ${msg}`);
}

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

function randomEmail(prefix) {
  const n = Math.floor(Math.random() * 1e9);
  return `sakto.${prefix}.${Date.now()}.${n}@gmail.com`;
}

async function getOrCreateUser(client, envPrefix, fallbackPrefix) {
  const email = process.env[`${envPrefix}_EMAIL`];
  const password = process.env[`${envPrefix}_PASSWORD`];

  if (email && password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`signIn ${email}: ${error.message}`);
    if (!data.session) throw new Error(`signIn ${email}: no session`);
    return data;
  }

  return signUp(client, randomEmail(fallbackPrefix), password ?? 'AuditTest!23456', `Audit ${fallbackPrefix}`);
}

async function signUp(client, email, password, displayName) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw new Error(`signUp ${email}: ${error.message}`);
  if (!data.session) {
    throw new Error(
      'signUp returned no session — disable email confirmation in Supabase Auth or set AUDIT_CHAT_USER_A_EMAIL/PASSWORD and AUDIT_CHAT_USER_B_EMAIL/PASSWORD in .env'
    );
  }
  return data;
}

async function run() {
  const env = { ...process.env, ...loadEnv() };
  Object.assign(process.env, env);
  const url = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !anonKey || url.includes('your-project')) {
    skip('Supabase not configured — set EXPO_PUBLIC_SUPABASE_URL and ANON_KEY in .env');
    return 0;
  }

  const base = createClient(url, anonKey, { auth: { persistSession: false } });

  console.log('\n# Chat Security Audit (live BOLA/IDOR)\n');

  let userA;
  let userB;
  let listingId;
  let conversationId;
  let messageId;

  try {
    userA = await getOrCreateUser(base, 'AUDIT_CHAT_USER_A', 'buyer-a');
    userB = await getOrCreateUser(base, 'AUDIT_CHAT_USER_B', 'buyer-b');
  } catch (err) {
    skip(`Could not create test users: ${err.message}`);
    return 0;
  }

  const clientA = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${userA.session.access_token}` } },
  });
  const clientB = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${userB.session.access_token}` } },
  });

  // Use existing seed listing or create one as A (seller)
  const { data: listings } = await clientA.from('listings').select('id').limit(1);
  if (listings?.length) {
    listingId = listings[0].id;
  } else {
    const { data: createdListing, error: listingErr } = await clientA
      .from('listings')
      .insert({
        seller_id: userA.user.id,
        title: 'Audit listing',
        price: 100,
      })
      .select('id')
      .single();
    if (listingErr) {
      skip(`Could not create test listing: ${listingErr.message}`);
      return 0;
    }
    listingId = createdListing.id;
  }

  // A starts conversation as buyer on a listing (may be own listing — OK for IDOR test)
  const { data: conv, error: convErr } = await clientA
    .from('conversations')
    .insert({ listing_id: listingId, buyer_id: userA.user.id })
    .select('id')
    .single();

  if (convErr) {
    // Maybe conversation exists
    const { data: existing } = await clientA
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', userA.user.id)
      .maybeSingle();
    if (!existing) {
      skip(`Could not create conversation: ${convErr.message}`);
      return 0;
    }
    conversationId = existing.id;
  } else {
    conversationId = conv.id;
    const { data: listing } = await clientA
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();
    const sellerId = listing?.seller_id ?? userA.user.id;
    await clientA.from('conversation_participants').insert([
      { conversation_id: conversationId, user_id: userA.user.id },
      { conversation_id: conversationId, user_id: sellerId },
    ]);
  }

  const { data: msg, error: msgErr } = await clientA
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userA.user.id,
      body: 'audit probe message',
    })
    .select('id')
    .single();

  if (msgErr) {
    skip(`Could not insert test message: ${msgErr.message}`);
    return 0;
  }
  messageId = msg.id;

  // --- BOLA tests: User B attacks User A's resources ---

  const { data: leakedMessages, error: leakErr } = await clientB
    .from('messages')
    .select('id, body')
    .eq('conversation_id', conversationId);

  if (leakErr) {
    pass(`B cannot read A messages (error: ${leakErr.message})`);
  } else if (!leakedMessages?.length) {
    pass('B cannot read A messages (0 rows)');
  } else {
    fail(`BOLA: User B read ${leakedMessages.length} message(s) from A conversation`);
  }

  const { error: spoofErr } = await clientB.from('messages').insert({
    conversation_id: conversationId,
    sender_id: userA.user.id,
    body: 'spoofed sender',
  });
  if (spoofErr) {
    pass(`B cannot insert message with A sender_id (${spoofErr.code ?? 'error'})`);
  } else {
    fail('BOLA: User B inserted message with spoofed sender_id');
  }

  const { data: previews, error: prevErr } = await clientB.rpc('get_conversation_previews', {
    p_user_id: userA.user.id,
  });
  if (prevErr) {
    pass(`B cannot call get_conversation_previews as A (${prevErr.message})`);
  } else if (!previews?.length) {
    pass('B get_conversation_previews(A.id) returns 0 rows');
  } else {
    fail(`BOLA: B fetched ${previews.length} conversation preview(s) for A`);
  }

  const { data: unread, error: unreadErr } = await clientB.rpc('get_unread_total', {
    p_user_id: userA.user.id,
  });
  if (unreadErr) {
    pass(`B cannot call get_unread_total as A (${unreadErr.message})`);
  } else if (Number(unread) === 0) {
    pass('B get_unread_total(A.id) returns 0');
  } else {
    fail(`BOLA: B got unread count ${unread} for A`);
  }

  const { data: translations, error: trErr } = await clientB
    .from('message_translations')
    .select('id')
    .eq('message_id', messageId);
  if (trErr) {
    pass(`B cannot read translations for A message (${trErr.message})`);
  } else if (!translations?.length) {
    pass('B cannot read A message translations (0 rows)');
  } else {
    fail('BOLA: B read message_translations for A message');
  }

  const { data: updated, error: readErr } = await clientB
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userA.user.id)
    .select('user_id');
  if (readErr) {
    pass(`B cannot update A read state (${readErr.message})`);
  } else if (!updated?.length) {
    pass('B cannot update A conversation_participants (0 rows)');
  } else {
    fail('BOLA: B updated A read state in conversation_participants');
  }

  const { error: receiptErr } = await clientB.from('message_receipts').insert({
    message_id: messageId,
    user_id: userB.user.id,
  });
  if (receiptErr) {
    pass(`B cannot mark delivery on A conversation message (${receiptErr.code ?? 'error'})`);
  } else {
    fail('BOLA: B inserted message_receipt for A conversation message');
  }

  // Translate without auth
  const { error: translateAnonErr } = await base.functions.invoke('translate', {
    body: { text: 'hello', targetLang: 'en' },
  });
  if (translateAnonErr) {
    pass('translate rejects unauthenticated invoke');
  } else {
    fail('translate Edge Function allowed unauthenticated request');
  }

  const failed = results.filter((r) => r.level === 'fail').length;
  console.log(`\nLive result: ${results.filter((r) => r.level === 'pass').length} passed, ${failed} failed, ${results.filter((r) => r.level === 'skip').length} skipped\n`);
  return failed > 0 ? 1 : 0;
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('Live audit error:', err);
    process.exit(1);
  });
