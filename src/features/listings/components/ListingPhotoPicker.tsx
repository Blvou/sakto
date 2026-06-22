import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Camera, X } from 'lucide-react-native';
import { typography } from '@/src/design-system/tokens';
import { useTheme } from '@/src/hooks/use-theme';
import type { ListingPhotoDraft } from '../types';

interface ListingPhotoPickerProps {
  photos: ListingPhotoDraft[];
  maxPhotos: number;
  onPickPhotos: () => void;
  onRemovePhoto: (key: string) => void;
  onMovePhotoToCover: (index: number) => void;
}

export function ListingPhotoPicker({
  photos,
  maxPhotos,
  onPickPhotos,
  onRemovePhoto,
  onMovePhotoToCover,
}: ListingPhotoPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 12, marginBottom: 20 }}>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>Photos</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {photos.map((photo, index) => (
          <Pressable
            key={photo.key}
            onPress={() => onMovePhotoToCover(index)}
            style={{ width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}
            accessibilityRole="button"
            accessibilityLabel={index === 0 ? 'Cover photo' : `Listing photo ${index + 1}`}
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: '100%', height: '100%', backgroundColor: colors.border }}
              contentFit="cover"
            />
            {index === 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    ...typography.caption,
                    color: '#FFF',
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    fontSize: 10,
                  }}
                >
                  Cover
                </Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => onRemovePhoto(photo.key)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <X color="#FFF" size={14} />
            </Pressable>
          </Pressable>
        ))}
        {photos.length < maxPhotos ? (
          <Pressable
            onPress={onPickPhotos}
            style={{
              width: '31%',
              aspectRatio: 1,
              borderRadius: 12,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.primary}08`,
            }}
            accessibilityRole="button"
            accessibilityLabel="Add photo"
          >
            <Camera color={colors.primary} size={28} strokeWidth={1.5} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onPickPhotos}
        style={{
          minHeight: 52,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={photos.length === 0 ? 'Add photos' : 'Add more photos'}
      >
        <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
          {photos.length === 0 ? 'Add photos' : 'Add more photos'}
        </Text>
      </Pressable>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>
        Up to {maxPhotos} photos. First photo is the cover. Tap a photo to set it as cover.
      </Text>
    </View>
  );
}
