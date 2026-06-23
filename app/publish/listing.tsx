import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { typography } from '@/src/design-system/tokens';
import { LISTING_CATEGORIES } from '@/src/features/listings/constants/categories';
import { pruneAttributesForCategory } from '@/src/features/listings/constants/attribute-fields';
import { ListingAttributesFields } from '@/src/features/listings/components/ListingAttributesFields';
import { ListingPhotoPicker } from '@/src/features/listings/components/ListingPhotoPicker';
import { useCreateListing } from '@/src/features/listings/hooks/use-create-listing';
import { useListingPhotoDrafts } from '@/src/features/listings/hooks/use-listing-photo-drafts';
import { createListingMutationSchema } from '@/src/features/listings/schemas';
import { ImageCropModal } from '@/src/features/media/components/ImageCropModal';
import { useTheme } from '@/src/hooks/use-theme';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import type { ListingAttributes } from '@/src/features/listings/types';

export default function PublishListingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const createListing = useCreateListing();
  const { photos, pickPhotos, recropPhoto, removePhoto, movePhotoToCover, maxPhotos, pendingCrop, confirmCrop, cancelCrop } =
    useListingPhotoDrafts();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Manila, Metro Manila');
  const [category, setCategory] = useState(
    typeof categoryParam === 'string' && categoryParam !== 'marketplace'
      ? categoryParam
      : LISTING_CATEGORIES[0].id
  );
  const [attributes, setAttributes] = useState<ListingAttributes>({});

  useEffect(() => {
    requireAuth({ message: 'Sign in to post a listing', returnTo: '/publish/listing' as Href });
  }, [requireAuth]);

  useEffect(() => {
    if (typeof categoryParam === 'string' && categoryParam !== 'marketplace') {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = useCallback((nextCategory: string) => {
    setCategory(nextCategory);
    setAttributes((prev) => pruneAttributesForCategory(prev, nextCategory));
  }, []);

  const selectedCategory = useMemo(
    () => LISTING_CATEGORIES.find((item) => item.id === category) ?? LISTING_CATEGORIES[0],
    [category]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePublish = useCallback(() => {
    const parsed = createListingMutationSchema.safeParse({
      title,
      description,
      price,
      location,
      category,
      attributes,
      photos: photos.map((photo) => ({
        uri: photo.uri,
        mediaId: photo.mediaId,
      })),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the form fields');
      return;
    }

    createListing.mutate(parsed.data);
  }, [attributes, category, createListing, description, location, photos, price, title]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </Pressable>
        <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
          Post listing
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <ListingPhotoPicker
          photos={photos}
          maxPhotos={maxPhotos}
          onPickPhotos={pickPhotos}
          onRemovePhoto={removePhoto}
          onMovePhotoToCover={movePhotoToCover}
          onRecropPhoto={recropPhoto}
        />

        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
          {LISTING_CATEGORIES.map((item) => {
            const isSelected = category === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleCategoryChange(item.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? `${colors.primary}12` : colors.surface,
                }}
              >
                <Text
                  style={{
                    ...typography.caption,
                    color: isSelected ? colors.primary : colors.textPrimary,
                    fontFamily: isSelected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                  }}
                >
                  {item.emoji} {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What are you selling or offering?"
          placeholderTextColor={colors.textSecondary}
          style={{
            ...typography.body,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe condition, features, and pickup details"
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
          style={{
            ...typography.body,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            minHeight: 120,
            marginBottom: 16,
          }}
        />

        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Price (PHP)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          style={{
            ...typography.body,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="City or area"
          placeholderTextColor={colors.textSecondary}
          style={{
            ...typography.body,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 24,
          }}
        />

        <ListingAttributesFields categoryId={category} value={attributes} onChange={setAttributes} />

        <Pressable
          onPress={handlePublish}
          disabled={createListing.isPending}
          style={{
            minHeight: 52,
            borderRadius: 14,
            backgroundColor: colors.textPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: createListing.isPending ? 0.7 : 1,
          }}
        >
          {createListing.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text
              style={{
                ...typography.h3,
                color: colors.background,
                fontFamily: 'PlusJakartaSans_600SemiBold',
              }}
            >
              Publish · {selectedCategory.label}
            </Text>
          )}
        </Pressable>
      </ScrollView>
      <ImageCropModal
        visible={pendingCrop !== null}
        imageUri={pendingCrop?.uri ?? ''}
        imageWidth={pendingCrop?.width}
        imageHeight={pendingCrop?.height}
        aspectRatio={{ width: 1, height: 1 }}
        onConfirm={confirmCrop}
        onCancel={cancelCrop}
      />
    </KeyboardAvoidingView>
  );
}
