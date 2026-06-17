import { supabase } from '@/src/lib/supabase';
import type { Profile } from '../types';

const PROFILE_COLUMNS = 'id, display_name, avatar_url, preferred_lang' as const;

export async function fetchMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}
