import { useEffect, useState, type ReactNode } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { toast } from 'sonner-native';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { updateListingSchema } from '@/src/features/listings/schemas';
import { useListing } from '@/src/features/listings/hooks/use-listing';
import { useUpdateListing } from '@/src/features/listings/hooks/use-update-listing';
import type { ListingStatus } from '@/src/features/listings/types';

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
];

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const { data: listing, isLoading, isError } = useListing(id);
  const updateListing = useUpdateListing();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<ListingStatus>('active');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!listing || initialized) return;
    setTitle(listing.title);
    setPrice(String(listing.price));
    setDescription(listing.description ?? '');
    setLocation(listing.location ?? '');
    setCategory(listing.category ?? 'Electronics');
    setStatus(listing.status ?? 'active');
    setInitialized(true);
  }, [listing, initialized]);

  const isOwner = !!userId && !!listing && listing.seller_id === userId;

  const handleSave = () => {
    if (!id) return;

    const parsed = updateListingSchema.safeParse({
      title,
      description,
      price,
      location,
      category,
      status,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Check your input';
      toast.error(firstIssue);
      return;
    }

    updateListing.mutate({ listingId: id, input: parsed.data });
  };

  if (isLoading || !initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
          Listing not found
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!isOwner) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
          You can only edit your own listings
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          >
            <ArrowLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text style={{ ...typography.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
            Edit listing
          </Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}>
        <Field label="Title" colors={colors}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Item title"
            placeholderTextColor={colors.textSecondary}
            style={inputStyle(colors)}
          />
        </Field>

        <Field label="Description" colors={colors}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{ ...inputStyle(colors), minHeight: 120 }}
          />
        </Field>

        <Field label="Price (₱)" colors={colors}>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="2500"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            style={{ ...inputStyle(colors), fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold', color: colors.primary }}
          />
        </Field>

        <Field label="Location" colors={colors}>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City or area"
            placeholderTextColor={colors.textSecondary}
            style={inputStyle(colors)}
          />
        </Field>

        <Field label="Category" colors={colors}>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Electronics"
            placeholderTextColor={colors.textSecondary}
            style={inputStyle(colors)}
          />
        </Field>

        <Field label="Status" colors={colors}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map((option) => {
              const selected = status === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setStatus(option.value)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? `${colors.primary}15` : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      ...typography.caption,
                      color: selected ? colors.primary : colors.textSecondary,
                      fontFamily: selected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleSave}
          disabled={updateListing.isPending}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 12,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: updateListing.isPending ? 0.7 : 1,
          }}
        >
          {updateListing.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
              Save changes
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: ReactNode;
}) {
  return (
    <View>
      <Text
        style={{
          ...typography.body,
          color: colors.textPrimary,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function inputStyle(colors: ReturnType<typeof useTheme>['colors']) {
  return {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular' as const,
    color: colors.textPrimary,
    minHeight: 52,
  };
}
