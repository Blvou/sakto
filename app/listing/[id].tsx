import { useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ArrowLeft, Heart, MapPin } from 'lucide-react-native';
import { Avatar } from '@/src/design-system/components/Avatar';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { typography } from '@/src/design-system/tokens';
import { useIsFavorite } from '@/src/features/favorites/hooks/use-is-favorite';
import { useToggleFavorite } from '@/src/features/favorites/hooks/use-toggle-favorite';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { useListing } from '@/src/features/listings/hooks/use-listing';
import { resolveListingImage } from '@/src/features/listings/utils/listing-images';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();
  const requireAuth = useRequireAuth();
  const { data: listing, isLoading, isError, refetch, isRefetching } = useListing(id);
  const isFavorite = useIsFavorite(id);
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useToggleFavorite();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavoritePress = useCallback(() => {
    if (!id) return;
    if (!requireAuth({ message: 'Sign in to save favorites', returnTo: `/listing/${id}` as Href })) {
      return;
    }
    toggleFavorite({ listingId: id, isFavorite });
  }, [id, isFavorite, requireAuth, toggleFavorite]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorState title="Listing not found" onRetry={() => refetch()} />
      </View>
    );
  }

  const imageSource = resolveListingImage(listing.id, listing.image_url);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={imageSource}
            style={{ width: '100%', height: 320, backgroundColor: colors.border }}
            contentFit="cover"
            accessibilityLabel={listing.title}
          />
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 8,
              right: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={handleBack}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(0,0,0,0.45)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft color="#FFFFFF" size={22} />
            </Pressable>
            <Pressable
              onPress={handleFavoritePress}
              disabled={isTogglingFavorite}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(0,0,0,0.45)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                color={isFavorite ? colors.secondary : '#FFFFFF'}
                fill={isFavorite ? colors.secondary : 'transparent'}
                size={22}
                strokeWidth={1.75}
              />
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 16, gap: 12 }}>
          <Text style={{ ...typography.price, color: colors.primary }}>{formatPrice(listing.price)}</Text>
          <Text style={{ ...typography.h2, color: colors.textPrimary }}>{listing.title}</Text>

          {listing.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin color={colors.textSecondary} size={14} />
              <Text style={{ ...typography.body, color: colors.textSecondary }}>{listing.location}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Avatar name={listing.seller.display_name} uri={listing.seller.avatar_url} size={40} />
            <View>
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>Seller</Text>
              <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                {listing.seller.display_name}
              </Text>
            </View>
          </View>

          {listing.description ? (
            <Text style={{ ...typography.body, color: colors.textPrimary, marginTop: 8, lineHeight: 22 }}>
              {listing.description}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
