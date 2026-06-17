#!/usr/bin/env node
/**
 * Static chat security audit for Sakto.
 * Checks SQL migrations and client API code without network calls.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const CHAT_TABLES = [
  'messages',
  'conversations',
  'conversation_participants',
  'message_translations',
  'message_receipts',
];

const CHAT_RPC = ['get_conversation_previews', 'get_unread_total'];

const CHAT_API_GLOB = [
  'src/features/chat/api/messages.ts',
  'src/features/chat/api/conversations.ts',
  'src/features/chat/api/receipts.ts',
  'src/features/chat/hooks/use-realtime-messages.ts',
  'supabase/functions/translate/index.ts',
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
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
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
  for (const table of CHAT_TABLES) {
    const rlsPattern = new RegExp(
      `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
      'i'
    );
    if (rlsPattern.test(sql)) {
      pass(`RLS enabled on public.${table}`);
    } else {
      fail(`RLS not enabled on public.${table} (no migration match)`);
    }

    const policyCount = (
      sql.match(new RegExp(`on\\s+public\\.${table}\\s+for`, 'gi')) ?? []
    ).length;
    if (policyCount >= 2) {
      pass(`public.${table} has ${policyCount} RLS policies`);
    } else if (policyCount === 1) {
      warn(`public.${table} has only 1 RLS policy — verify all operations covered`);
    } else {
      fail(`public.${table} has no RLS policies in migrations`);
    }
  }

  if (/sender_id\s*=\s*auth\.uid\(\)/i.test(sql)) {
    pass('messages insert policy binds sender_id to auth.uid()');
  } else {
    fail('messages insert policy missing sender_id = auth.uid() check');
  }

  if (/auth\.uid\(\)\s*=\s*p_user_id/i.test(sql)) {
    pass('RPC functions enforce auth.uid() = p_user_id');
  } else {
    fail('RPC preview/unread functions missing auth.uid() = p_user_id guard');
  }

  if (/create\s+or\s+replace\s+function\s+public\.is_conversation_participant/i.test(sql)) {
    pass('is_conversation_participant() helper exists');
  } else {
    fail('is_conversation_participant() helper missing');
  }

  if (/security\s+definer[\s\S]*?set\s+search_path\s*=\s*public/i.test(sql)) {
    pass('SECURITY DEFINER functions set search_path = public');
  } else {
    warn('Could not verify search_path on all SECURITY DEFINER functions');
  }

  if (/alter\s+publication\s+supabase_realtime\s+add\s+table\s+public\.messages/i.test(sql)) {
    pass('messages table published to supabase_realtime');
  } else {
    warn('messages may not be in supabase_realtime publication');
  }
}

function auditClientCode() {
  for (const rel of CHAT_API_GLOB) {
    const content = readFile(rel);
    if (!content) continue;

    if (/\.select\s*\(\s*['"]\*['"]\s*\)/.test(content)) {
      fail(`${rel}: uses select('*') — risk of excessive data exposure`);
    } else {
      pass(`${rel}: no select('*')`);
    }
  }

  const messagesApi = readFile('src/features/chat/api/messages.ts');
  if (messagesApi && /\.insert\s*\(\{[\s\S]*sender_id:/m.test(messagesApi)) {
    pass('sendMessage sets sender_id (RLS must still enforce auth.uid())');
  }

  const realtime = readFile('src/features/chat/hooks/use-realtime-messages.ts');
  if (realtime && /conversation_id=eq\./.test(realtime)) {
    pass('Realtime subscription filters by conversation_id');
  } else {
    warn('Realtime hook may not filter postgres_changes by conversation_id');
  }

  const translateFn = readFile('supabase/functions/translate/index.ts');
  if (translateFn) {
    if (/getUser\(\)/.test(translateFn) && /Authorization/.test(translateFn)) {
      pass('translate Edge Function requires Authorization + getUser()');
    } else {
      fail('translate Edge Function missing auth gate');
    }
    if (/Access-Control-Allow-Origin['"]:\s*['"]\*['"]/.test(translateFn)) {
      warn('translate uses CORS * — acceptable for native; restrict if web clients added');
    }
    if (/GOOGLE_TRANSLATE_API_KEY/.test(translateFn) && !/Deno\.env/.test(translateFn)) {
      fail('translate may hardcode GOOGLE_TRANSLATE_API_KEY');
    } else {
      pass('translate reads API key from Deno.env (not hardcoded)');
    }
  }

  const supabaseLib = readFile('src/lib/supabase.ts');
  if (supabaseLib) {
    if (/service.?role|SECRET|sb_secret/i.test(supabaseLib)) {
      fail('src/lib/supabase.ts may contain service role / secret key');
    } else {
      pass('Client supabase.ts uses anon key only');
    }
  }
}

function auditEnvExample() {
  const example = readFile('.env.example');
  if (example && !/SECRET|SERVICE_ROLE|GOOGLE_TRANSLATE/i.test(example)) {
    pass('.env.example exposes only public Supabase vars');
  } else {
    warn('.env.example may include secrets — use Edge Function secrets instead');
  }
}

function printReport() {
  const passed = results.filter((r) => r.level === 'pass');
  const failed = results.filter((r) => r.level === 'fail');
  const warnings = results.filter((r) => r.level === 'warn');

  console.log('\n# Chat Security Audit (static)\n');
  console.log(`Passed: ${passed.length} | Failed: ${failed.length} | Warnings: ${warnings.length}\n`);

  if (failed.length) {
    console.log('## Failures');
    for (const r of failed) console.log(`  🔴 ${r.message}`);
    console.log();
  }
  if (warnings.length) {
    console.log('## Warnings');
    for (const r of warnings) console.log(`  🟡 ${r.message}`);
    console.log();
  }

  return failed.length === 0 ? 0 : 1;
}

const sql = readMigrations();
auditMigrations(sql);
auditClientCode();
auditEnvExample();

const code = printReport();
process.exit(code);
