#!/usr/bin/env node
/**
 * Seeds demo rental scooters + photos for TEST_SELLER (seller@local.com by default).
 * Usage: node scripts/seed-rental-vehicles.mjs
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
    lat: 14.5784,
    lng: 120.9832,
    instant_booking: true,
    image: 's1.png',
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
    lat: 14.5635,
    lng: 120.9985,
    instant_booking: true,
    image: 's2.png',
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
    lat: 14.5547,
    lng: 121.0244,
    instant_booking: false,
    image: 's3.png',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000004',
    title: 'Suzuki Smash 115',
    description: 'Budget-friendly manual scooter — ideal for students and quick errands around BGC.',
    brand: 'Suzuki',
    model: 'Smash 115',
    year: 2020,
    price_per_day: 280,
    location: 'BGC, Taguig',
    city: 'Taguig',
    lat: 14.5515,
    lng: 121.047,
    instant_booking: true,
    image: 's1.png',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000005',
    title: 'Honda PCX 160 Electric',
    description: 'Quiet electric scooter for eco-friendly rides. Charger adapter included.',
    brand: 'Honda',
    model: 'PCX Electric',
    year: 2024,
    price_per_day: 550,
    location: 'Quezon City',
    city: 'Quezon City',
    lat: 14.676,
    lng: 121.0437,
    instant_booking: false,
    image: 's2.png',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000006',
    title: 'Yamaha NMAX 155',
    description: 'Premium maxi-scooter with storage under seat. Popular for airport and mall runs.',
    brand: 'Yamaha',
    model: 'NMAX 155',
    year: 2023,
    price_per_day: 500,
    location: 'Pasay, Metro Manila',
    city: 'Pasay',
    lat: 14.5378,
    lng: 120.9986,
    instant_booking: true,
    image: 's3.png',
  },
];

function loadEnvFiles() {
  const env = { ...process.env };
  for (const file of ['.env.vercel.production', '.env']) {
    const envPath = path.join(ROOT, file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (value) env[key] = value;
    }
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

async function uploadVehiclePhoto(client, ownerId, vehicleId, imageFile) {
  const imagePath = path.join(ROOT, 'assets/scooters', imageFile);
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Missing image: ${imagePath}`);
  }

  const storagePath = `${ownerId}/demo-${vehicleId}.png`;
  const buffer = fs.readFileSync(imagePath);

  const { error: uploadError } = await client.storage.from('vehicle-photos').upload(storagePath, buffer, {
    upsert: true,
    contentType: 'image/png',
    cacheControl: '3600',
  });

  if (uploadError) throw new Error(`upload ${imageFile}: ${uploadError.message}`);
  return storagePath;
}

async function ensureDemoVehicles(client, ownerId) {
  for (const vehicle of DEMO_VEHICLES) {
    const { image, ...vehicleRow } = vehicle;
    const payload = {
      ...vehicleRow,
      owner_id: ownerId,
      status: 'active',
    };

    const { data: existing } = await client
      .from('vehicles')
      .select('id, title')
      .eq('id', vehicle.id)
      .maybeSingle();

    if (existing) {
      const { error } = await client.from('vehicles').update(payload).eq('id', vehicle.id);
      if (error) throw new Error(`update ${vehicle.title}: ${error.message}`);
      console.log(`  ✓ updated vehicle: ${vehicle.title}`);
    } else {
      const { error } = await client.from('vehicles').insert(payload);
      if (error) throw new Error(`insert ${vehicle.title}: ${error.message}`);
      console.log(`  ✓ created vehicle: ${vehicle.title}`);
    }

    const storagePath = await uploadVehiclePhoto(client, ownerId, vehicle.id, image);

    await client.from('vehicle_photos').delete().eq('vehicle_id', vehicle.id);

    const { error: photoError } = await client.from('vehicle_photos').insert({
      vehicle_id: vehicle.id,
      storage_path: storagePath,
      sort_order: 0,
    });

    if (photoError) throw new Error(`photo ${vehicle.title}: ${photoError.message}`);
    console.log(`  ✓ photo: ${vehicle.title}`);
  }
}

async function main() {
  const env = loadEnvFiles();
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const base = createClient(url, anonKey, { auth: { persistSession: false } });

  console.log('\nSeeding demo rental scooters...\n');

  const seller = await ensureSellerSession(
    base,
    env.TEST_SELLER_EMAIL ?? 'seller@local.com',
    env.TEST_SELLER_PASSWORD ?? 'seller1',
    'Demo Host'
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
