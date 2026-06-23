import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import type { CropRegion, PendingCropImage } from '@/src/features/media/types';
import { applyImageCrop } from '@/src/features/media/utils/apply-image-crop';
import { getErrorMessage } from '@/src/lib/errors';
import type { ListingMediaItem, ListingPhotoDraft } from '../types';

const MAX_PHOTOS = 10;

function createDraft(uri: string, mediaId?: string): ListingPhotoDraft {
  return {
    key: mediaId ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uri,
    mediaId,
    isNew: !mediaId,
  };
}

export function useListingPhotoDrafts() {
  const [photos, setPhotos] = useState<ListingPhotoDraft[]>([]);
  const [pendingCrop, setPendingCrop] = useState<PendingCropImage | null>(null);
  const [queuedAssets, setQueuedAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [recropKey, setRecropKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const setFromExistingMedia = useCallback((media: ListingMediaItem[]) => {
    setPhotos(media.map((item) => createDraft(item.url, item.id)));
  }, []);

  const startNextCrop = useCallback((assets: ImagePicker.ImagePickerAsset[]) => {
    const [nextAsset, ...rest] = assets;
    setQueuedAssets(rest);
    if (nextAsset) {
      setPendingCrop({
        uri: nextAsset.uri,
        width: nextAsset.width,
        height: nextAsset.height,
      });
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
        throw new Error('Photo library access is required to add listing photos');
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

      setRecropKey(null);
      const [first, ...rest] = result.assets;
      if (!first) return;

      setQueuedAssets(rest);
      setPendingCrop({
        uri: first.uri,
        width: first.width,
        height: first.height,
      });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open photo library'));
    }
  }, [photos.length]);

  const recropPhoto = useCallback(
    (key: string) => {
      const photo = photos.find((item) => item.key === key);
      if (!photo) return;

      setQueuedAssets([]);
      setRecropKey(key);
      setPendingCrop({ uri: photo.uri });
    },
    [photos]
  );

  const confirmCrop = useCallback(
    async (crop: CropRegion) => {
      if (!pendingCrop || isProcessing) return;

      setIsProcessing(true);
      try {
        const result = await applyImageCrop(pendingCrop.uri, crop, {
          maxWidth: 1200,
          compress: 0.85,
        });

        if (recropKey) {
          setPhotos((current) =>
            current.map((photo) =>
              photo.key === recropKey
                ? {
                    ...photo,
                    uri: result.uri,
                    isNew: true,
                  }
                : photo
            )
          );
          setRecropKey(null);
          setPendingCrop(null);
          setQueuedAssets([]);
          return;
        }

        setPhotos((current) => [...current, createDraft(result.uri)].slice(0, MAX_PHOTOS));

        const remainingSlots = MAX_PHOTOS - (photos.length + 1);
        if (queuedAssets.length > 0 && remainingSlots > 0) {
          startNextCrop(queuedAssets.slice(0, remainingSlots));
          setQueuedAssets((current) => current.slice(remainingSlots));
        } else {
          setPendingCrop(null);
          setQueuedAssets([]);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Could not process photo'));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, pendingCrop, photos.length, queuedAssets, recropKey, startNextCrop]
  );

  const cancelCrop = useCallback(() => {
    if (recropKey) {
      setRecropKey(null);
      setPendingCrop(null);
      return;
    }

    if (queuedAssets.length > 0 && photos.length < MAX_PHOTOS) {
      startNextCrop(queuedAssets);
      setQueuedAssets([]);
      return;
    }

    setPendingCrop(null);
    setQueuedAssets([]);
  }, [photos.length, queuedAssets, recropKey, startNextCrop]);

  const removePhoto = useCallback((key: string) => {
    setPhotos((current) => current.filter((photo) => photo.key !== key));
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

  const resetPhotos = useCallback(() => {
    setPhotos([]);
    setPendingCrop(null);
    setQueuedAssets([]);
    setRecropKey(null);
  }, []);

  return {
    photos,
    setFromExistingMedia,
    pickPhotos,
    recropPhoto,
    removePhoto,
    movePhotoToCover,
    resetPhotos,
    maxPhotos: MAX_PHOTOS,
    pendingCrop,
    confirmCrop,
    cancelCrop,
    isProcessing,
  };
}
