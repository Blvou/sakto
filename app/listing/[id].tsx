import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, MapPin, MessageCircle, Pencil, Share2, Shield, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Avatar } from '@/src/design-system/components/Avatar';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useStartConversation } from '@/src/features/chat/hooks/use-start-conversation';
import { useDeleteListing } from '@/src/features/listings/hooks/use-delete-listing';
import { formatTimeAgo, useListing } from '@/src/features/listings/hooks/use-listing';
import { resolveListingImage } from '@/src/features/listings/utils/listing-images';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const { data: listing, isLoading, isError, refetch } = useListing(id);
  const { userId } = useAuth();
  const startConversation = useStartConversation();
  const deleteListing = useDeleteListing();

  const isOwner = !!userId && !!listing && listing.seller_id === userId;

  const handleDelete = () => {
    if (!listing) return;
    Alert.alert('Delete listing', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteListing.mutate(listing.id),
      },
    ]);
  };

  const imageSource = listing
    ? resolveListingImage(listing.id, listing.image_url)
    : undefined;

  if (isLoading) {
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
        <Pressable onPress={() => refetch()} style={{ marginTop: 16 }}>
          <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  const sellerAvatar = listing.seller.avatar_url;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={imageSource!}
            style={{ width: '100%', height: 320, backgroundColor: colors.border }}
            contentFit="cover"
            cachePolicy="memory-disk"
            accessibilityLabel={listing.title}
          />
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 56,
              left: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft color={colors.textPrimary} size={22} />
          </Pressable>
          <View style={{ position: 'absolute', top: 56, right: 16, flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 color={colors.textPrimary} size={20} />
            </Pressable>
            <Pressable
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart color={colors.secondary} size={20} />
            </Pressable>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ ...typography.price, color: colors.primary, marginTop: 8, fontSize: 28 }}>
            {formatPrice(listing.price)}
          </Text>
          <Text style={{ ...typography.h2, color: colors.textPrimary, marginTop: 8 }}>{listing.title}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 }}>
            <MapPin color={colors.textSecondary} size={14} />
            <Text style={{ ...typography.body, color: colors.textSecondary }}>
              {listing.location ?? 'Philippines'} • Posted {formatTimeAgo(listing.created_at)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 20,
              padding: 16,
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Avatar uri={sellerAvatar} name={listing.seller.display_name} size={48} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  ...typography.body,
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  color: colors.textPrimary,
                }}
              >
                {listing.seller.display_name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Shield color={colors.success} size={12} />
                <Text style={{ ...typography.caption, color: colors.success, marginLeft: 4 }}>
                  Seller
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 24 }}>Description</Text>
          <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 8, lineHeight: 22 }}>
            {listing.description ??
              `Well-maintained item in excellent condition. Meet-up in ${listing.location ?? 'your area'}.`}
          </Text>

          {listing.category && (
            <>
              <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 24 }}>Details</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ ...typography.body, color: colors.textSecondary }}>Category</Text>
                <Text
                  style={{
                    ...typography.body,
                    color: colors.textPrimary,
                    fontFamily: 'PlusJakartaSans_500Medium',
                  }}
                >
                  {listing.category}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          padding: 16,
          paddingBottom: 32,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 12,
        }}
      >
        {isOwner ? (
          <>
            <Pressable
              onPress={() => router.push(`/listing/${listing.id}/edit`)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                minHeight: 52,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 8,
              }}
            >
              <Pencil color={colors.primary} size={20} />
              <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={deleteListing.isPending}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                minHeight: 52,
                borderWidth: 1,
                borderColor: colors.secondary,
                gap: 8,
                opacity: deleteListing.isPending ? 0.7 : 1,
              }}
            >
              {deleteListing.isPending ? (
                <ActivityIndicator color={colors.secondary} size="small" />
              ) : (
                <>
                  <Trash2 color={colors.secondary} size={20} />
                  <Text style={{ ...typography.body, color: colors.secondary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    Delete
                  </Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => startConversation.mutate(listing.id)}
              disabled={startConversation.isPending}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
                borderRadius: 12,
                minHeight: 52,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 8,
                opacity: startConversation.isPending ? 0.7 : 1,
              }}
            >
              {startConversation.isPending ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  <MessageCircle color={colors.primary} size={20} />
                  <Text style={{ ...typography.body, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    Chat
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.secondary,
                borderRadius: 12,
                minHeight: 52,
              }}
            >
              <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
                Make offer
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
