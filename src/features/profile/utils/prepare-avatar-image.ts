import { applyImageCrop } from '@/src/features/media/utils/apply-image-crop';
import type { CropRegion } from '@/src/features/media/types';

const AVATAR_SIZE = 400;

export interface PreparedAvatarImage {
  uri: string;
  base64: string;
}

interface PrepareAvatarImageOptions {
  uri: string;
  crop: CropRegion;
}

export async function prepareAvatarImage({
  uri,
  crop,
}: PrepareAvatarImageOptions): Promise<PreparedAvatarImage> {
  const result = await applyImageCrop(uri, crop, {
    maxWidth: AVATAR_SIZE,
    maxHeight: AVATAR_SIZE,
    compress: 0.8,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Could not process image');
  }

  return {
    uri: result.uri,
    base64: result.base64,
  };
}
