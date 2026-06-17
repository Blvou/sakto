import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import type { CropRegion } from '../types';

interface ApplyImageCropOptions {
  maxWidth?: number;
  maxHeight?: number;
  compress?: number;
  base64?: boolean;
}

export async function applyImageCrop(
  uri: string,
  crop: CropRegion,
  options: ApplyImageCropOptions = {},
): Promise<{ uri: string; base64?: string }> {
  const actions: Parameters<typeof manipulateAsync>[1] = [{ crop }];

  if (options.maxWidth ?? options.maxHeight) {
    actions.push({
      resize: {
        width: options.maxWidth,
        height: options.maxHeight,
      },
    });
  }

  const result = await manipulateAsync(uri, actions, {
    compress: options.compress ?? 0.8,
    format: SaveFormat.JPEG,
    base64: options.base64 ?? false,
  });

  return {
    uri: result.uri,
    base64: result.base64,
  };
}
