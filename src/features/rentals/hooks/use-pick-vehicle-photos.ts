import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import type { CropRegion, PendingCropImage } from '@/src/features/media/types';
import { applyImageCrop } from '@/src/features/media/utils/apply-image-crop';
import { getErrorMessage } from '@/src/lib/errors';

const MAX_PHOTOS = 10;

export interface PickedVehiclePhoto {
  uri: string;
}

export function usePickVehiclePhotos() {
  const [photos, setPhotos] = useState<PickedVehiclePhoto[]>([]);
  const [pendingCrop, setPendingCrop] = useState<PendingCropImage | null>(null);
  const [queuedUris, setQueuedUris] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const startNextCrop = useCallback((uris: string[]) => {
    const [nextUri, ...rest] = uris;
    setQueuedUris(rest);
    if (nextUri) {
      setPendingCrop({ uri: nextUri });
    } else {
      setPendingCrop(null);
    }
  }, []);

  const pickPhotos = useCallback(async () => {
    try {
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) {
        toast.error(`You can add up to ${MAX_PHOTOS} photos`);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Photo library access is required to add bike photos');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 1,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const uris = result.assets.map((asset) => asset.uri);
      const [first, ...rest] = uris;
      if (!first) return;

      setQueuedUris(rest);
      setPendingCrop({
        uri: first,
        width: result.assets[0]?.width,
        height: result.assets[0]?.height,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open photo library'));
    }
  }, [photos.length]);

  const confirmCrop = useCallback(
    async (crop: CropRegion) => {
      if (!pendingCrop || isProcessing) return;

      setIsProcessing(true);
      try {
        const result = await applyImageCrop(pendingCrop.uri, crop, {
          maxWidth: 1200,
          compress: 0.85,
        });

        setPhotos((current) => [...current, { uri: result.uri }].slice(0, MAX_PHOTOS));

        const remainingSlots = MAX_PHOTOS - (photos.length + 1);
        if (queuedUris.length > 0 && remainingSlots > 0) {
          startNextCrop(queuedUris.slice(0, remainingSlots));
          setQueuedUris((current) => current.slice(remainingSlots));
        } else {
          setPendingCrop(null);
          setQueuedUris([]);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Could not process photo'));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, pendingCrop, photos.length, queuedUris, startNextCrop]
  );

  const cancelCrop = useCallback(() => {
    if (queuedUris.length > 0 && photos.length < MAX_PHOTOS) {
      startNextCrop(queuedUris);
      setQueuedUris([]);
      return;
    }
    setPendingCrop(null);
    setQueuedUris([]);
  }, [photos.length, queuedUris, startNextCrop]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }, []);

  const movePhotoToCover = useCallback((index: number) => {
    if (index === 0) return;
    setPhotos((current) => {
      const next = [...current];
      const [photo] = next.splice(index, 1);
      if (!photo) return current;
      next.unshift(photo);
      return next;
    });
  }, []);

  return {
    photos,
    pickPhotos,
    removePhoto,
    movePhotoToCover,
    maxPhotos: MAX_PHOTOS,
    pendingCrop,
    confirmCrop,
    cancelCrop,
    isProcessing,
  };
}
