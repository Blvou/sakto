import { useState } from 'react';
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
import { Image } from 'expo-image';
import { ArrowLeft, Camera, ChevronRight, MapPin, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import { toast } from 'sonner-native';
import { createListingSchema } from '@/src/features/listings/schemas';
import { useCreateListing } from '@/src/features/listings/hooks/use-create-listing';
import { createVehicleMutationSchema } from '@/src/features/rentals/schemas';
import { useCreateVehicle } from '@/src/features/rentals/hooks/use-create-vehicle';
import { usePickVehiclePhotos } from '@/src/features/rentals/hooks/use-pick-vehicle-photos';

const STEPS = ['Photos', 'Details', 'Price', 'Location'] as const;

export default function PublishScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isScooter = type === 'scooter';
  const { colors } = useTheme();
  const router = useRouter();
  const createListing = useCreateListing();
  const createVehicle = useCreateVehicle();
  const { photos, pickPhotos, removePhoto, movePhotoToCover, maxPhotos } = usePickVehiclePhotos();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Manila, Metro Manila');
  const [category, setCategory] = useState('Electronics');
  const [instantBooking] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      if (isScooter && step === 0 && photos.length === 0) {
        toast.error('Add at least one photo');
        return;
      }
      setStep(step + 1);
      return;
    }

    if (isScooter) {
      const parsed = createVehicleMutationSchema.safeParse({
        title,
        description,
        brand,
        model,
        pricePerDay: price,
        location,
        city: location.split(',')[0]?.trim() ?? '',
        instantBooking,
        photoUris: photos.map((photo) => photo.uri),
      });

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]?.message ?? 'Check your input';
        toast.error(firstIssue);
        return;
      }

      createVehicle.mutate(parsed.data);
      return;
    }

    const parsed = createListingSchema.safeParse({
      title,
      description,
      price,
      location,
      category,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message ?? 'Check your input';
      toast.error(firstIssue);
      return;
    }

    createListing.mutate(parsed.data);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => (step > 0 ? setStep(step - 1) : router.back())}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          >
            <ArrowLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text style={{ ...typography.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
            {isScooter ? 'List a scooter' : 'Sell an item'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
          <View
            style={{
              height: 4,
              width: `${progress}%`,
              backgroundColor: colors.primary,
              borderRadius: 2,
            }}
          />
        </View>
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {step === 0 && (
          <View>
            {isScooter ? (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {photos.map((photo, index) => (
                    <Pressable
                      key={photo.uri}
                      onPress={() => movePhotoToCover(index)}
                      style={{ width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' }}
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
                        onPress={() => removePhoto(index)}
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
                      >
                        <X color="#FFF" size={14} />
                      </Pressable>
                    </Pressable>
                  ))}
                  {photos.length < maxPhotos ? (
                    <Pressable
                      onPress={pickPhotos}
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
                    >
                      <Camera color={colors.primary} size={28} strokeWidth={1.5} />
                    </Pressable>
                  ) : null}
                </View>
                <Pressable
                  onPress={pickPhotos}
                  style={{
                    minHeight: 52,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    {photos.length === 0 ? 'Add photos' : 'Add more photos'}
                  </Text>
                </Pressable>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                  Up to {maxPhotos} photos. First photo is the cover. Tap a photo to set it as cover.
                </Text>
              </View>
            ) : (
              <Pressable
                style={{
                  height: 200,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${colors.primary}08`,
                }}
              >
                <Camera color={colors.primary} size={40} strokeWidth={1.5} />
                <Text
                  style={{
                    ...typography.body,
                    color: colors.primary,
                    marginTop: 12,
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                  }}
                >
                  Add photos
                </Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }}>
                  Up to 10 photos. First photo is the cover.
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text
                style={{
                  ...typography.body,
                  color: colors.textPrimary,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  marginBottom: 8,
                }}
              >
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={isScooter ? 'e.g. Honda Beat 2023' : 'e.g. iPhone 13 Pro 128GB'}
                placeholderTextColor={colors.textSecondary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: 'PlusJakartaSans_400Regular',
                  color: colors.textPrimary,
                  minHeight: 52,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  ...typography.body,
                  color: colors.textPrimary,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your item..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  fontSize: 14,
                  fontFamily: 'PlusJakartaSans_400Regular',
                  color: colors.textPrimary,
                  minHeight: 120,
                }}
              />
            </View>
            {isScooter && (
              <>
                <View>
                  <Text
                    style={{
                      ...typography.body,
                      color: colors.textPrimary,
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      marginBottom: 8,
                    }}
                  >
                    Brand
                  </Text>
                  <TextInput
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="e.g. Honda"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      fontSize: 14,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      color: colors.textPrimary,
                      minHeight: 52,
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      ...typography.body,
                      color: colors.textPrimary,
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      marginBottom: 8,
                    }}
                  >
                    Model
                  </Text>
                  <TextInput
                    value={model}
                    onChangeText={setModel}
                    placeholder="e.g. Beat 2023"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      fontSize: 14,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      color: colors.textPrimary,
                      minHeight: 52,
                    }}
                  />
                </View>
              </>
            )}
            {!isScooter && (
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  minHeight: 52,
                }}
              >
                <Text style={{ ...typography.body, color: colors.textPrimary, flex: 1 }}>Category</Text>
                <Text style={{ ...typography.body, color: colors.textSecondary, marginRight: 4 }}>
                  {category}
                </Text>
                <ChevronRight color={colors.textSecondary} size={18} />
              </Pressable>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text
              style={{
                ...typography.body,
                color: colors.textPrimary,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                marginBottom: 8,
              }}
            >
              {isScooter ? 'Price per day (₱)' : 'Price (₱)'}
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder={isScooter ? '350' : '2500'}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                fontSize: 24,
                fontFamily: 'PlusJakartaSans_700Bold',
                color: colors.primary,
                minHeight: 64,
              }}
            />
            <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 8 }}>
              {isScooter
                ? 'Set a competitive daily rate. Average in Manila: ₱300–₱500/day'
                : 'Tip: Check similar listings to price competitively'}
            </Text>
          </View>
        )}

        {step === 3 && (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 56,
                marginBottom: 12,
              }}
            >
              <MapPin color={colors.primary} size={20} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City or area"
                placeholderTextColor={colors.textSecondary}
                style={{
                  ...typography.body,
                  color: colors.textPrimary,
                  flex: 1,
                  marginLeft: 12,
                }}
              />
              <ChevronRight color={colors.textSecondary} size={18} />
            </View>
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>
              Your exact address is only shared after booking or agreement.
            </Text>
          </View>
        )}
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
          onPress={handleNext}
          disabled={createListing.isPending || createVehicle.isPending}
          style={{
            backgroundColor: colors.secondary,
            borderRadius: 12,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: createListing.isPending || createVehicle.isPending ? 0.7 : 1,
          }}
        >
          {createListing.isPending || createVehicle.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
              {step < STEPS.length - 1 ? 'Continue' : isScooter ? 'Publish bike' : 'Publish listing'}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
