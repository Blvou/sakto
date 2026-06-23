import type { ImageSource } from 'expo-image';

/** Use the full URL (incl. ?v=) as cache key so avatar updates are not masked by disk cache. */
export function avatarImageSource(uri: string): ImageSource {
  return { uri, cacheKey: uri };
}
