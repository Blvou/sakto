import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
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

  const setFromExistingMedia = useCallback((media: ListingMediaItem[]) => {
    setPhotos(media.map((item) => createDraft(item.url, item.id)));
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
        quality: 0.9,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const nextPhotos = result.assets.map((asset) => createDraft(asset.uri));
      setPhotos((current) => [...current, ...nextPhotos].slice(0, MAX_PHOTOS));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open photo library'));
    }
  }, [photos.length]);

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
  }, []);

  return {
    photos,
    setFromExistingMedia,
    pickPhotos,
    removePhoto,
    movePhotoToCover,
    resetPhotos,
    maxPhotos: MAX_PHOTOS,
  };
}
