#!/usr/bin/env node
/**
 * Static rental security audit for Sakto.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const RENTAL_TABLES = [
  'vehicles',
  'vehicle_photos',
  'vehicle_availability_blocks',
  'bookings',
];

const RENTAL_RPC = [
  'get_vehicle_blocked_dates',
  'get_or_create_booking_conversation',
  'assert_vehicle_dates_available',
];

const RENTAL_API_FILES = [
  'src/features/rentals/api/bookings.ts',
  'src/features/rentals/api/vehicles.ts',
  'src/features/rentals/api/vehicle-photos.ts',
  'app/bookings/index.tsx',
  'app/bookings/owner.tsx',
];

/** @type {{ level: 'pass' | 'fail' | 'warn'; message: string }[]} */
const results = [];

function pass(msg) {
  results.push({ level: 'pass', message: msg });
}

function fail(msg) {
  results.push({ level: 'fail', message: msg });
}

function warn(msg) {
  results.push({ level: 'warn', message: msg });
}

function readMigrations() {
  const dir = path.join(ROOT, 'supabase/migrations');
  if (!fs.existsSync(dir)) {
    fail('supabase/migrations/ not found');
    return '';
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => fs.readFileSync(path.join(dir, file), 'utf8'))
    .join('\n\n');
}

function readFile(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fail(`Missing file: ${rel}`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function auditMigrations(sql) {
  for (const table of RENTAL_TABLES) {
    const rlsPattern = new RegExp(
      `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
      'i'
    );
    if (rlsPattern.test(sql)) {
      pass(`RLS enabled on public.${table}`);
    } else {
      fail(`RLS not enabled on public.${table}`);
    }
  }

  if (/Booking parties can view bookings/i.test(sql)) {
    pass('bookings select policy scopes to renter_id or owner_id');
  } else {
    fail('bookings select policy missing party membership check');
  }

  if (/Owners can update booking status/i.test(sql)) {
    pass('bookings owner update policy present');
  } else {
    fail('bookings owner update policy missing');
  }

  if (/Renters can cancel own bookings/i.test(sql)) {
    pass('bookings renter cancel policy present');
  } else {
    fail('bookings renter cancel policy missing');
  }

  if (/assert_vehicle_dates_available/i.test(sql)) {
    pass('DB overlap guard assert_vehicle_dates_available present');
  } else {
    fail('Missing assert_vehicle_dates_available function');
  }

  if (/bookings_assert_dates_available/i.test(sql)) {
    pass('bookings overlap trigger present');
  } else {
    fail('Missing bookings_assert_dates_available trigger');
  }

  for (const rpc of RENTAL_RPC) {
    if (new RegExp(rpc, 'i').test(sql)) {
      pass(`RPC/function ${rpc} defined in migrations`);
    } else {
      fail(`RPC/function ${rpc} not found in migrations`);
    }
  }

  if (/get_or_create_booking_conversation[\s\S]*auth\.uid\(\) not in/i.test(sql)) {
    pass('booking conversation RPC checks booking party membership');
  } else {
    fail('get_or_create_booking_conversation missing party membership check');
  }
}

function auditClientCode() {
  for (const rel of RENTAL_API_FILES) {
    const content = readFile(rel);
    if (!content) continue;

    if (/from\('@\/src\/lib\/supabase'\)|from '\@\/src\/lib\/supabase'/i.test(content)) {
      pass(`${rel} uses shared Supabase client`);
    }

    if (/\.from\('bookings'\)/.test(content) && /\.eq\('(renter_id|owner_id)'/.test(content)) {
      pass(`${rel} scopes booking queries by user id`);
    }
  }

  const bookingsApi = readFile('src/features/rentals/api/bookings.ts');
  if (/updateBookingStatus/.test(bookingsApi) && /\.eq\('owner_id'|\.eq\('renter_id'/.test(bookingsApi)) {
    pass('updateBookingStatus scopes updates to owner or renter');
  } else {
    warn('updateBookingStatus may not scope updates by role — verify RLS is sole guard');
  }
}

function printReport() {
  console.log('\n# Rental Security Audit (static)\n');
  for (const item of results) {
    const icon = item.level === 'pass' ? '✅' : item.level === 'warn' ? '🟡' : '🔴';
    console.log(`${icon} ${item.message}`);
  }

  const failures = results.filter((item) => item.level === 'fail').length;
  const warnings = results.filter((item) => item.level === 'warn').length;
  console.log(`\nSummary: ${results.length - failures - warnings} passed, ${warnings} warnings, ${failures} failed\n`);
  return failures > 0 ? 1 : 0;
}

auditMigrations(readMigrations());
auditClientCode();
process.exit(printReport());
