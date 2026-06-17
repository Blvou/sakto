import { decode } from 'base64-arraybuffer';
import { supabase } from '@/src/lib/supabase';

const AVATAR_BUCKET = 'avatars';

function avatarObjectPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export async function uploadProfileAvatar(userId: string, imageBase64: string): Promise<string> {
  const path = avatarObjectPath(userId);
  const arrayBuffer = decode(imageBase64);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, arrayBuffer, {
      upsert: true,
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (profileError) throw profileError;

  return avatarUrl;
}
