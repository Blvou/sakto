import { decode } from 'base64-arraybuffer';
import { supabase } from '@/src/lib/supabase';

const AVATAR_BUCKET = 'avatars';

function avatarObjectPath(userId: string): string {
  return `${userId}/avatar-${Date.now()}.jpg`;
}

async function removeStaleAvatars(userId: string, keepPath: string): Promise<void> {
  const { data: objects, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId);
  if (error || !objects?.length) return;

  const keepName = keepPath.split('/').pop();
  const stalePaths = objects
    .filter((object) => object.name.startsWith('avatar') && object.name !== keepName)
    .map((object) => `${userId}/${object.name}`);

  if (stalePaths.length === 0) return;

  const { error: removeError } = await supabase.storage.from(AVATAR_BUCKET).remove(stalePaths);
  if (removeError) {
    console.warn('Could not remove stale avatars:', removeError.message);
  }
}

export async function uploadProfileAvatar(userId: string, imageBase64: string): Promise<string> {
  const path = avatarObjectPath(userId);
  const arrayBuffer = decode(imageBase64);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      cacheControl: 'max-age=31536000, immutable',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = data.publicUrl;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (profileError) throw profileError;

  void removeStaleAvatars(userId, path);

  return avatarUrl;
}
