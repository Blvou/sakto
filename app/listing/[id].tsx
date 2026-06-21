import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ArrowLeft, Flag, Heart, MapPin, MessageCircle } from 'lucide-react-native';
import { Avatar } from '@/src/design-system/components/Avatar';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { typography } from '@/src/design-system/tokens';
import { useStartConversation } from '@/src/features/chat/hooks/use-start-conversation';
import { useIsFavorite } from '@/src/features/favorites/hooks/use-is-favorite';
import { useToggleFavorite } from '@/src/features/favorites/hooks/use-toggle-favorite';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { resolveListingCategoryId } from '@/src/features/listings/constants/categories';
import { ListingPhotoGallery } from '@/src/features/listings/components/ListingPhotoGallery';
import { ListingSpecs } from '@/src/features/listings/components/ListingSpecs';
import { ReportListingModal } from '@/src/features/listings/components/ReportListingModal';
import { useHasReportedListing, useReportListing } from '@/src/features/listings/hooks/use-report-listing';
import { useListing } from '@/src/features/listings/hooks/use-listing';
import { formatTimeAgo } from '@/src/features/listings/utils/format-time-ago';
import { resolveListingImage, resolveListingImages } from '@/src/features/listings/utils/listing-images';
import { resolveListingSpecs } from '@/src/features/listings/utils/listing-specs';
import type { ListingCardItem } from '@/src/features/listings/types';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
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
  const { userId } = useAuth();
  const requireAuth = useRequireAuth();
  const { data: listing, isLoading, isError, refetch, isRefetching } = useListing(id);
  const isFavorite = useIsFavorite(id);
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useToggleFavorite();
  const startConversation = useStartConversation();
  const reportListing = useReportListing(id);
  const { data: hasReported = false } = useHasReportedListing(id);
  const [reportVisible, setReportVisible] = useState(false);

  const isOwnListing = !!listing && !!userId && listing.seller_id === userId;

  const photos = useMemo(() => {
    if (!listing) return [];
    return resolveListingImages(listing.id, listing.image_url);
  }, [listing]);

  const specs = useMemo(() => {
    if (!listing) return [];
    return resolveListingSpecs({
      id: listing.id,
      category: listing.category,
      attributes: listing.attributes,
    });
  }, [listing]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavoritePress = useCallback(() => {
    if (!id || !listing) return;
    if (!requireAuth({ message: 'Sign in to save favorites', returnTo: `/listing/${id}` as Href })) {
      return;
    }

    const cardListing: ListingCardItem = {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location ?? 'Philippines',
      timeAgo: formatTimeAgo(listing.created_at),
      image: resolveListingImage(listing.id, listing.image_url),
      category: resolveListingCategoryId(listing.id, listing.category),
      liked: true,
    };

    toggleFavorite({ listingId: id, isFavorite, listing: cardListing });
  }, [id, isFavorite, listing, requireAuth, toggleFavorite]);

  const handleChatPress = useCallback(() => {
    if (!id || !listing) return;
    if (isOwnListing) return;
    if (!requireAuth({ message: 'Sign in to message the seller', returnTo: `/listing/${id}` as Href })) {
      return;
    }
    startConversation.mutate(id);
  }, [id, isOwnListing, listing, requireAuth, startConversation]);

  const handleReportPress = useCallback(() => {
    if (!id || !listing) return;
    if (isOwnListing) return;
    if (hasReported) return;
    if (!requireAuth({ message: 'Sign in to report a listing', returnTo: `/listing/${id}` as Href })) {
      return;
    }
    setReportVisible(true);
  }, [hasReported, id, isOwnListing, listing, requireAuth]);

  const handleReportSubmit = useCallback(
    (reason: Parameters<typeof reportListing.mutate>[0]['reason'], details?: string) => {
      reportListing.mutate(
        { reason, details },
        {
          onSuccess: () => setReportVisible(false),
        }
      );
    },
    [reportListing]
  );

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

  const description =
    listing.description?.trim() ||
    'No description provided yet. Message the seller to ask for more details.';

  const headerOverlay = (
    <>
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
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <ListingPhotoGallery
          images={photos}
          title={listing.title}
          topInset={insets.top}
          overlay={headerOverlay}
        />

        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 8 }}>
          <Text style={{ ...typography.price, color: colors.primary }}>{formatPrice(listing.price)}</Text>
          <Text style={{ ...typography.h2, color: colors.textPrimary, marginTop: 8 }}>{listing.title}</Text>

          {listing.location ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <MapPin color={colors.textSecondary} size={14} />
              <Text style={{ ...typography.body, color: colors.textSecondary }}>{listing.location}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <Avatar name={listing.seller.display_name} uri={listing.seller.avatar_url} size={40} />
            <View>
              <Text style={{ ...typography.caption, color: colors.textSecondary }}>Seller</Text>
              <Text style={{ ...typography.body, color: colors.textPrimary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                {listing.seller.display_name}
              </Text>
            </View>
          </View>

          <Text style={{ ...typography.h3, color: colors.textPrimary, marginTop: 24 }}>Description</Text>
          <Text style={{ ...typography.body, color: colors.textPrimary, marginTop: 8, lineHeight: 22 }}>
            {description}
          </Text>

          <ListingSpecs specs={specs} />

          {!isOwnListing ? (
            <Pressable
              onPress={handleReportPress}
              disabled={hasReported || reportListing.isPending}
              style={{
                marginTop: 28,
                minHeight: 44,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: hasReported ? 0.55 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel={hasReported ? 'Listing already reported' : 'Report listing'}
            >
              <Flag color={colors.textSecondary} size={16} />
              <Text style={{ ...typography.body, color: colors.textSecondary }}>
                {hasReported ? 'You reported this listing' : 'Report listing'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleChatPress}
          disabled={isOwnListing || startConversation.isPending}
          style={{
            minHeight: 52,
            borderRadius: 12,
            backgroundColor: isOwnListing ? colors.border : colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: startConversation.isPending ? 0.75 : 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={isOwnListing ? 'This is your listing' : 'Message seller'}
        >
          {startConversation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MessageCircle color="#FFF" size={20} />
              <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_700Bold' }}>
                {isOwnListing ? 'Your listing' : 'Message seller'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <ReportListingModal
        visible={reportVisible}
        listingTitle={listing.title}
        isSubmitting={reportListing.isPending}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}
