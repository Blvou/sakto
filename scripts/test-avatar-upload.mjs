#!/usr/bin/env node
/**
 * Programmatic avatar upload test (storage + profiles.avatar_url).
 * Usage: node scripts/test-avatar-upload.mjs [--seller] [path-to-jpeg]
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

async function main() {
  const env = { ...process.env, ...loadEnv() };
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const args = process.argv.slice(2);
  const useSeller = args.includes('--seller');
  const imageArg = args.find((arg) => arg !== '--seller');
  const email = useSeller
    ? (env.TEST_SELLER_EMAIL ?? 'seller@local.com')
    : (env.TEST_BUYER_EMAIL ?? 'buyer@local.com');
  const password = useSeller
    ? (env.TEST_SELLER_PASSWORD ?? 'seller1')
    : (env.TEST_BUYER_PASSWORD ?? 'buyer1');

  if (!url || !anonKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  }

  const imagePath =
    imageArg ?? path.join(ROOT, 'assets/test/test-avatar.jpg');
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: auth, error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr) throw new Error(`signIn: ${signErr.message}`);

  const userId = auth.user.id;
  const storagePath = `${userId}/avatar.jpg`;
  const buffer = fs.readFileSync(imagePath);

  const { error: uploadError } = await supabase.storage.from('avatars').upload(storagePath, buffer, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '3600',
  });
  if (uploadError) throw new Error(`upload: ${uploadError.message}`);

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);
  if (profileError) throw new Error(`profile: ${profileError.message}`);

  const { data: profile, error: verifyError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .single();
  if (verifyError) throw new Error(`verify: ${verifyError.message}`);
  if (!profile?.avatar_url) throw new Error('verify: avatar_url is still null');

  console.log('Avatar upload OK');
  console.log('  account:', useSeller ? 'seller' : 'buyer');
  console.log('  user:', userId);
  console.log('  path:', storagePath);
  console.log('  url:', avatarUrl);
  console.log('  profile.avatar_url:', profile.avatar_url);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
