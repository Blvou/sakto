import type { PreferredLang } from '@/src/lib/database.types';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_lang: PreferredLang;
}

/** Subset used in listings, chat headers, and conversation list. */
export type ProfilePreview = Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;

export const profileQueryKeys = {
  my: (userId: string) => ['my-profile', userId] as const,
};
