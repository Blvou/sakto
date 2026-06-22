import { decode } from 'base64-arraybuffer';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/src/lib/supabase';

const BUCKET = 'listing-photos';
const MAX_DIMENSION = 1200;

function randomStorageId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

async function prepareListingPhotoBase64(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: 0.8, format: SaveFormat.JPEG, base64: true }
  );

  if (!result.base64) {
    throw new Error('Could not process image');
  }

  return result.base64;
}

export function getListingPhotoPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function listingPhotoUrlToStoragePath(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

export async function uploadListingPhoto(userId: string, localUri: string): Promise<string> {
  if (isRemoteUri(localUri)) return localUri;

  const base64 = await prepareListingPhotoBase64(localUri);
  const storagePath = `${userId}/${randomStorageId()}.jpg`;
  const arrayBuffer = decode(base64);

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;
  return getListingPhotoPublicUrl(storagePath);
}

export async function uploadListingPhotos(userId: string, localUris: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (const uri of localUris) {
    urls.push(await uploadListingPhoto(userId, uri));
  }
  return urls;
}

export async function deleteListingPhotoFromStorage(publicUrl: string): Promise<void> {
  const storagePath = listingPhotoUrlToStoragePath(publicUrl);
  if (!storagePath) return;

  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function syncListingMedia(
  listingId: string,
  sellerId: string,
  urls: string[],
  previousUrls: string[] = []
): Promise<void> {
  const removedUrls = previousUrls.filter((url) => !urls.includes(url));
  await Promise.all(removedUrls.map((url) => deleteListingPhotoFromStorage(url)));

  const { error: deleteMediaError } = await supabase
    .from('listing_media')
    .delete()
    .eq('listing_id', listingId);

  if (deleteMediaError) throw deleteMediaError;

  if (urls.length > 0) {
    const { error: insertMediaError } = await supabase.from('listing_media').insert(
      urls.map((url, sort_order) => ({
        listing_id: listingId,
        url,
        sort_order,
      }))
    );

    if (insertMediaError) throw insertMediaError;
  }

  const { error: updateListingError } = await supabase
    .from('listings')
    .update({ image_url: urls[0] ?? null })
    .eq('id', listingId)
    .eq('seller_id', sellerId);

  if (updateListingError) throw updateListingError;
}
