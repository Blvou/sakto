import { decode } from 'base64-arraybuffer';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/src/lib/supabase';

const BUCKET = 'vehicle-photos';
const MAX_DIMENSION = 1200;

function randomStorageId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function prepareVehiclePhotoBase64(uri: string): Promise<string> {
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

export async function uploadVehiclePhotos(userId: string, localUris: string[]): Promise<string[]> {
  const storagePaths: string[] = [];

  for (const uri of localUris) {
    const base64 = await prepareVehiclePhotoBase64(uri);
    const storagePath = `${userId}/${randomStorageId()}.jpg`;
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

    if (error) throw error;
    storagePaths.push(storagePath);
  }

  return storagePaths;
}
