import type { CropRegion } from '../types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export { MIN_ZOOM, MAX_ZOOM };

export function getBaseScale(
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
): number {
  'worklet';
  return Math.max(cropWidth / imageWidth, cropHeight / imageHeight);
}

export function getCropDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectWidth: number,
  aspectHeight: number,
): { cropWidth: number; cropHeight: number } {
  const maxWidth = containerWidth * 0.92;
  const maxHeight = containerHeight * 0.92;
  const aspect = aspectWidth / aspectHeight;

  let cropWidth = maxWidth;
  let cropHeight = cropWidth / aspect;

  if (cropHeight > maxHeight) {
    cropHeight = maxHeight;
    cropWidth = cropHeight * aspect;
  }

  return { cropWidth, cropHeight };
}

export function clampTranslation(
  translateX: number,
  translateY: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  cropWidth: number,
  cropHeight: number,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  'worklet';
  const baseScale = getBaseScale(imageWidth, imageHeight, cropWidth, cropHeight);
  const displayW = imageWidth * baseScale * scale;
  const displayH = imageHeight * baseScale * scale;

  const cropLeft = (containerWidth - cropWidth) / 2;
  const cropTop = (containerHeight - cropHeight) / 2;
  const cropRight = cropLeft + cropWidth;
  const cropBottom = cropTop + cropHeight;

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const minTranslateX = cropRight - centerX - displayW / 2;
  const maxTranslateX = cropLeft - centerX + displayW / 2;
  const minTranslateY = cropBottom - centerY - displayH / 2;
  const maxTranslateY = cropTop - centerY + displayH / 2;

  return {
    x: Math.min(Math.max(translateX, minTranslateX), maxTranslateX),
    y: Math.min(Math.max(translateY, minTranslateY), maxTranslateY),
  };
}

export function computeCropRegion(params: {
  imageWidth: number;
  imageHeight: number;
  cropWidth: number;
  cropHeight: number;
  containerWidth: number;
  containerHeight: number;
  translateX: number;
  translateY: number;
  scale: number;
}): CropRegion {
  const {
    imageWidth,
    imageHeight,
    cropWidth,
    cropHeight,
    containerWidth,
    containerHeight,
    translateX,
    translateY,
    scale,
  } = params;

  const baseScale = getBaseScale(imageWidth, imageHeight, cropWidth, cropHeight);
  const displayW = imageWidth * baseScale * scale;
  const displayH = imageHeight * baseScale * scale;
  const pixelRatioX = imageWidth / displayW;
  const pixelRatioY = imageHeight / displayH;

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const imageLeft = centerX - displayW / 2 + translateX;
  const imageTop = centerY - displayH / 2 + translateY;

  const cropLeft = (containerWidth - cropWidth) / 2;
  const cropTop = (containerHeight - cropHeight) / 2;

  let originX = Math.round((cropLeft - imageLeft) * pixelRatioX);
  let originY = Math.round((cropTop - imageTop) * pixelRatioY);
  let width = Math.round(cropWidth * pixelRatioX);
  let height = Math.round(cropHeight * pixelRatioY);

  originX = Math.max(0, Math.min(originX, imageWidth - 1));
  originY = Math.max(0, Math.min(originY, imageHeight - 1));
  width = Math.max(1, Math.min(width, imageWidth - originX));
  height = Math.max(1, Math.min(height, imageHeight - originY));

  return { originX, originY, width, height };
}
