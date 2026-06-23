import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';
import { getErrorMessage } from '@/src/lib/errors';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import type { CropRegion, PendingCropImage } from '@/src/features/media/types';
import { listingQueryKeys } from '@/src/features/listings/types';
import { uploadProfileAvatar } from '../api/avatar';
import { prepareAvatarImage } from '../utils/prepare-avatar-image';
import { profileQueryKeys, type Profile } from '../types';

export function useUploadAvatar() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [pendingCrop, setPendingCrop] = useState<PendingCropImage | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ uri, crop }: { uri: string; crop: CropRegion }) => {
      if (!userId) throw new Error('Sign in to change your avatar');

      const prepared = await prepareAvatarImage({ uri, crop });
      return uploadProfileAvatar(userId, prepared.base64);
    },
    onSuccess: (avatarUrl) => {
      if (!avatarUrl || !userId) return;
      queryClient.setQueryData<Profile>(profileQueryKeys.my(userId), (current) =>
        current ? { ...current, avatar_url: avatarUrl } : current,
      );
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.my(userId) });
      void queryClient.invalidateQueries({ queryKey: listingQueryKeys.all });
      toast.success('Avatar updated');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not update avatar'));
    },
  });

  const pickMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Sign in to change your avatar');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Photo library access is required to set an avatar');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setPendingCrop({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not open photo library'));
    },
  });

  const confirmCrop = useCallback(
    async (crop: CropRegion) => {
      if (!pendingCrop) return;
      const { uri } = pendingCrop;
      setPendingCrop(null);
      await uploadMutation.mutateAsync({ uri, crop });
    },
    [pendingCrop, uploadMutation],
  );

  const cancelCrop = useCallback(() => {
    setPendingCrop(null);
  }, []);

  return {
    pickAvatar: pickMutation.mutate,
    pendingCrop,
    confirmCrop,
    cancelCrop,
    isPicking: pickMutation.isPending,
    isUploading: uploadMutation.isPending,
    isPending: pickMutation.isPending || uploadMutation.isPending,
  };
}
