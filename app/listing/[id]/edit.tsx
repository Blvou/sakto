import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { typography } from '@/src/design-system/tokens';
import { LISTING_CATEGORIES } from '@/src/features/listings/constants/categories';
import { useListing } from '@/src/features/listings/hooks/use-listing';
import { useDeleteListing } from '@/src/features/listings/hooks/use-delete-listing';
import { useUpdateListing } from '@/src/features/listings/hooks/use-update-listing';
import { updateListingSchema } from '@/src/features/listings/schemas';
import { useTheme } from '@/src/hooks/use-theme';
import { useRequireAuth } from '@/src/hooks/use-require-auth';

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const { data: listing, isLoading } = useListing(id);
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('electronics');

  useEffect(() => {
    requireAuth({ message: 'Sign in to edit a listing', returnTo: `/listing/${id}/edit` });
  }, [id, requireAuth]);

  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description ?? '');
    setPrice(String(listing.price));
    setLocation(listing.location ?? '');
    setCategory(listing.category ?? 'electronics');
  }, [listing]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(() => {
    if (!id) return;

    const parsed = updateListingSchema.safeParse({
      title,
      description,
      price,
      location,
      category,
      imageUrl: listing?.image_url ?? '',
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the form fields');
      return;
    }

    updateListing.mutate({ listingId: id, input: parsed.data });
  }, [description, id, listing?.image_url, location, price, title, category, updateListing]);

  const handleDelete = useCallback(() => {
    if (!id || !listing) return;

    Alert.alert(
      'Delete listing?',
      `"${listing.title}" will be removed permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteListing.mutate(id),
        },
      ]
    );
  }, [deleteListing, id, listing]);

  const selectedCategory = useMemo(
    () => LISTING_CATEGORIES.find((item) => item.id === category) ?? LISTING_CATEGORIES[0],
    [category]
  );

  if (isLoading || !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

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
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </Pressable>
        <Text style={{ ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
          Edit listing
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: 8 }}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
          {LISTING_CATEGORIES.map((item) => {
            const isSelected = category === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setCategory(item.id)}
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

        <Pressable
          onPress={handleSave}
          disabled={updateListing.isPending}
          style={{
            minHeight: 52,
            borderRadius: 14,
            backgroundColor: colors.textPrimary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: updateListing.isPending ? 0.7 : 1,
          }}
        >
          {updateListing.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={{ ...typography.h3, color: colors.background, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              Save · {selectedCategory.label}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleDelete}
          disabled={deleteListing.isPending}
          style={{
            marginTop: 16,
            minHeight: 52,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: deleteListing.isPending ? 0.7 : 1,
          }}
          accessibilityRole="button"
          accessibilityLabel="Delete listing"
        >
          {deleteListing.isPending ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <>
              <Trash2 color={colors.secondary} size={18} />
              <Text style={{ ...typography.body, color: colors.secondary, fontFamily: 'PlusJakartaSans_700Bold' }}>
                Delete listing
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
