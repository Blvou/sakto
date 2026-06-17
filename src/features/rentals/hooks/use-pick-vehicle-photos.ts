import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';

const MAX_PHOTOS = 10;

export interface PickedVehiclePhoto {
  uri: string;
}

export function usePickVehiclePhotos() {
  const [photos, setPhotos] = useState<PickedVehiclePhoto[]>([]);

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

      const picked = result.assets.map((asset) => ({ uri: asset.uri }));
      setPhotos((current) => [...current, ...picked].slice(0, MAX_PHOTOS));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not open photo library'));
    }
  }, [photos.length]);

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
  };
}
