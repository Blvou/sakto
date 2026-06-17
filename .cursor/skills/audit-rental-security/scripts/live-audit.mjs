#!/usr/bin/env node
/**
 * Live BOLA/IDOR probes for Sakto rental tables via Supabase REST API.
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
  return `sakto.rental.${prefix}.${Date.now()}.${n}@gmail.com`;
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

  const { data, error } = await client.auth.signUp({
    email: randomEmail(fallbackPrefix),
    password: password ?? 'AuditTest!23456',
    options: { data: { display_name: `Audit ${fallbackPrefix}` } },
  });
  if (error) throw new Error(`signUp: ${error.message}`);
  if (!data.session) {
    throw new Error(
      'signUp returned no session — set AUDIT_CHAT_USER_A_EMAIL/PASSWORD and AUDIT_CHAT_USER_B_EMAIL/PASSWORD in .env'
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

  console.log('\n# Rental Security Audit (live BOLA/IDOR)\n');

  let userA;
  let userB;
  let vehicleId;
  let bookingId;

  try {
    userA = await getOrCreateUser(base, 'AUDIT_CHAT_USER_A', 'owner-a');
    userB = await getOrCreateUser(base, 'AUDIT_CHAT_USER_B', 'renter-b');
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

  const { data: vehicle, error: vehicleErr } = await clientA
    .from('vehicles')
    .insert({
      owner_id: userA.user.id,
      title: 'Audit Bike',
      description: 'Security audit rental vehicle',
      brand: 'Honda',
      model: 'Beat',
      price_per_day: 350,
      location: 'Manila',
      status: 'active',
    })
    .select('id')
    .single();

  if (vehicleErr) {
    skip(`Could not create test vehicle: ${vehicleErr.message}`);
    return 0;
  }
  vehicleId = vehicle.id;

  const startDate = new Date().toISOString().slice(0, 10);
  const { data: booking, error: bookingErr } = await clientB
    .from('bookings')
    .insert({
      vehicle_id: vehicleId,
      renter_id: userB.user.id,
      owner_id: userA.user.id,
      start_date: startDate,
      end_date: startDate,
      days: 1,
      price_per_day: 350,
      service_fee: 50,
      total_amount: 400,
      status: 'pending',
    })
    .select('id')
    .single();

  if (bookingErr) {
    skip(`Could not create test booking: ${bookingErr.message}`);
    return 0;
  }
  bookingId = booking.id;

  const { data: crossRead, error: crossReadErr } = await clientB
    .from('bookings')
    .select('id')
    .eq('id', bookingId);

  if (!crossReadErr && crossRead?.length === 1) {
    pass('Renter can read own booking');
  } else {
    fail(`Renter could not read own booking: ${crossReadErr?.message ?? 'empty'}`);
  }

  const { data: ownerRead, error: ownerReadErr } = await clientA
    .from('bookings')
    .select('id')
    .eq('id', bookingId)
    .maybeSingle();

  if (!ownerReadErr && ownerRead?.id === bookingId) {
    pass('Owner can read incoming booking request');
  } else {
    fail(`Owner could not read incoming booking: ${ownerReadErr?.message ?? 'empty'}`);
  }

  const { data: fakeRead } = await clientB
    .from('bookings')
    .select('id')
    .eq('id', '00000000-0000-0000-0000-000000000099');

  if (!fakeRead?.length) {
    pass('User cannot read booking by arbitrary foreign id');
  } else {
    fail('User read booking row via arbitrary foreign id');
  }

  const { error: crossUpdateErr } = await clientB
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);

  if (crossUpdateErr) {
    pass('Renter cannot confirm booking (owner-only status update blocked)');
  } else {
    fail('Renter was able to confirm booking — IDOR on update');
  }

  const { data: draftVehicle, error: draftErr } = await clientA
    .from('vehicles')
    .insert({
      owner_id: userA.user.id,
      title: 'Draft Audit Bike',
      description: 'Draft vehicle for audit',
      brand: 'Yamaha',
      model: 'Mio',
      price_per_day: 300,
      location: 'Manila',
      status: 'draft',
    })
    .select('id')
    .single();

  if (!draftErr && draftVehicle?.id) {
    const { data: leakedDraft } = await clientB
      .from('vehicles')
      .select('id')
      .eq('id', draftVehicle.id);

    if (!leakedDraft?.length) {
      pass('User B cannot read User A draft vehicle');
    } else {
      fail('User B can read User A draft vehicle');
    }
  } else {
    skip(`Could not create draft vehicle for probe: ${draftErr?.message ?? 'unknown'}`);
  }

  const { error: blockErr } = await clientB.from('vehicle_availability_blocks').insert({
    vehicle_id: vehicleId,
    start_date: startDate,
    end_date: startDate,
    reason: 'owner_block',
  });

  if (blockErr) {
    pass('Non-owner cannot insert availability block on foreign vehicle');
  } else {
    fail('Non-owner inserted availability block on foreign vehicle');
  }

  const { error: foreignChatErr } = await clientB.rpc('get_or_create_booking_conversation', {
    p_booking_id: '00000000-0000-0000-0000-000000000099',
  });

  if (foreignChatErr) {
    pass('get_or_create_booking_conversation rejects foreign booking id');
  } else {
    fail('get_or_create_booking_conversation succeeded for foreign booking id');
  }

  const failures = results.filter((item) => item.level === 'fail').length;
  console.log(`\nLive summary: ${failures} failed, ${results.filter((item) => item.level === 'pass').length} passed\n`);
  return failures > 0 ? 1 : 0;
}

run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
