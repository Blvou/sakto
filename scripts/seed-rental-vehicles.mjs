#!/usr/bin/env node
/**
 * Seeds demo rental scooters for TEST_SELLER (seller@local.com by default).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DEMO_VEHICLES = [
  {
    id: 'b0000000-0000-4000-8000-000000000001',
    title: 'Honda Beat 2022',
    description:
      'Well-maintained Honda Beat for daily city rides around Manila. Helmet included on request.',
    brand: 'Honda',
    model: 'Beat',
    year: 2022,
    price_per_day: 350,
    location: 'Ermita, Manila',
    city: 'Manila',
    instant_booking: true,
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    title: 'Yamaha Mio i125',
    description: 'Fuel-efficient Yamaha Mio for short commutes and errands in Metro Manila.',
    brand: 'Yamaha',
    model: 'Mio i125',
    year: 2021,
    price_per_day: 300,
    location: 'Malate, Manila',
    city: 'Manila',
    instant_booking: true,
  },
  {
    id: 'b0000000-0000-4000-8000-000000000003',
    title: 'Honda Click 160',
    description:
      'Comfortable Honda Click with enough power for longer rides. Great for tourists and locals.',
    brand: 'Honda',
    model: 'Click 160',
    year: 2023,
    price_per_day: 400,
    location: 'Makati, Metro Manila',
    city: 'Makati',
    instant_booking: false,
  },
];

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

async function ensureSellerSession(client, email, password, displayName) {
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (!signIn.error && signIn.data.session) {
    console.log(`  ✓ signed in seller: ${email}`);
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

  console.log(`  ✓ created seller: ${email}`);
  return signUp.data;
}

async function ensureDemoVehicles(client, ownerId) {
  for (const vehicle of DEMO_VEHICLES) {
    const { data: existing } = await client
      .from('vehicles')
      .select('id, title')
      .eq('id', vehicle.id)
      .maybeSingle();

    const payload = {
      ...vehicle,
      owner_id: ownerId,
      status: 'active',
    };

    if (existing) {
      const { error } = await client.from('vehicles').update(payload).eq('id', vehicle.id);
      if (error) throw new Error(`update ${vehicle.title}: ${error.message}`);
      console.log(`  ✓ updated vehicle: ${vehicle.title}`);
      continue;
    }

    const { error } = await client.from('vehicles').insert(payload);
    if (error) throw new Error(`insert ${vehicle.title}: ${error.message}`);
    console.log(`  ✓ created vehicle: ${vehicle.title}`);
  }
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

  console.log('\nSeeding rental scooters for seller...\n');

  const seller = await ensureSellerSession(
    base,
    env.TEST_SELLER_EMAIL ?? 'seller@local.com',
    env.TEST_SELLER_PASSWORD ?? 'seller1',
    'Test Seller'
  );

  const sellerClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${seller.session.access_token}` } },
  });

  await ensureDemoVehicles(sellerClient, seller.user.id);

  console.log('\nDone.');
  console.log(`  Seller: ${seller.user.id}`);
  console.log(`  Vehicles: ${DEMO_VEHICLES.length}\n`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
