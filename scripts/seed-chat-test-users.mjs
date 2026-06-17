#!/usr/bin/env node
/**
 * Ensures buyer@local.com and seller@local.com exist in Supabase Auth
 * and seller has at least one active listing for chat tests.
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

async function ensureUser(client, email, password, displayName) {
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (!signIn.error && signIn.data.session) {
    console.log(`  ✓ signed in: ${email}`);
    return signIn.data;
  }

  const signUp = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (signUp.error) {
    throw new Error(`${email}: ${signUp.error.message}`);
  }
  if (!signUp.data.session) {
    throw new Error(
      `${email}: no session after signUp — disable email confirmation in Supabase Auth`
    );
  }

  console.log(`  ✓ created: ${email}`);
  return signUp.data;
}

async function ensureSellerListing(client, sellerId) {
  const { data: existing } = await client
    .from('listings')
    .select('id, title')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .limit(1);

  if (existing?.length) {
    console.log(`  ✓ seller listing exists: ${existing[0].title} (${existing[0].id})`);
    return existing[0].id;
  }

  const { data: created, error } = await client
    .from('listings')
    .insert({
      seller_id: sellerId,
      title: 'Chat test listing',
      price: 1500,
      location: 'Manila',
      status: 'active',
    })
    .select('id')
    .single();

  if (error) throw new Error(`listing: ${error.message}`);
  console.log(`  ✓ created seller listing: ${created.id}`);
  return created.id;
}

async function main() {
  const env = { ...process.env, ...loadEnv() };
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or ANON_KEY in .env');
    process.exit(1);
  }

  const base = createClient(url, anonKey, { auth: { persistSession: false } });

  console.log('\nSeeding chat test users...\n');

  const buyer = await ensureUser(
    base,
    env.TEST_BUYER_EMAIL ?? 'buyer@local.com',
    env.TEST_BUYER_PASSWORD ?? 'buyer1',
    'Test Buyer'
  );

  const seller = await ensureUser(
    base,
    env.TEST_SELLER_EMAIL ?? 'seller@local.com',
    env.TEST_SELLER_PASSWORD ?? 'seller1',
    'Test Seller'
  );

  if (env.AUDIT_CHAT_USER_A_EMAIL && env.AUDIT_CHAT_USER_A_PASSWORD) {
    await ensureUser(
      base,
      env.AUDIT_CHAT_USER_A_EMAIL,
      env.AUDIT_CHAT_USER_A_PASSWORD,
      'Audit User A'
    );
  }

  if (env.AUDIT_CHAT_USER_B_EMAIL && env.AUDIT_CHAT_USER_B_PASSWORD) {
    await ensureUser(
      base,
      env.AUDIT_CHAT_USER_B_EMAIL,
      env.AUDIT_CHAT_USER_B_PASSWORD,
      'Audit User B'
    );
  }

  const sellerClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${seller.session.access_token}` } },
  });

  const listingId = await ensureSellerListing(sellerClient, seller.user.id);

  console.log('\nDone.');
  console.log(`  Buyer:  ${buyer.user.id}`);
  console.log(`  Seller: ${seller.user.id}`);
  console.log(`  Listing: ${listingId}\n`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
