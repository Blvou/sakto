import { isSupabaseConfigured } from './supabase';

/** Use bundled mock catalog only when Supabase env vars are missing at build time. */
export function shouldUseCatalogMock(): boolean {
  return !isSupabaseConfigured;
}
