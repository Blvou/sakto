import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getClientStorage } from './storage';

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  envUrl.length > 0 &&
  envKey.length > 0 &&
  !envUrl.includes('your-project');

// Placeholder prevents crash when .env is missing; API calls are blocked via isSupabaseConfigured.
const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured
  ? envKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getClientStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
