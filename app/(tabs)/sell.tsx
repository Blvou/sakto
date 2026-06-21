import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter, type Href } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/src/design-system/components/EmptyState';
import { ErrorState } from '@/src/design-system/components/ErrorState';
import { ListSkeleton } from '@/src/design-system/components/ListSkeleton';
import { typography } from '@/src/design-system/tokens';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { MyListingRow } from '@/src/features/listings/components/MyListingRow';
import { PostListingBar } from '@/src/features/listings/components/PostListingBar';
import { useMyListings } from '@/src/features/listings/hooks/use-my-listings';
import type { MyListingItem } from '@/src/features/listings/types';
import { useRequireAuth } from '@/src/hooks/use-require-auth';
import { useResponsive, getTabBarHeight } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

type ListingTab = 'active' | 'archive';

export default function MyListingsTabScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const requireAuth = useRequireAuth();
  const { horizontalPadding } = useResponsive();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const [activeTab, setActiveTab] = useState<ListingTab>('active');

  const { data: listings = [], isLoading, isError, refetch, isRefetching } = useMyListings();

  const filteredListings = useMemo(() => {
    if (activeTab === 'active') {
      return listings.filter((item) => item.status === 'active');
    }
    return listings.filter((item) => item.status === 'sold' || item.status === 'archived');
  }, [activeTab, listings]);

  const activeCount = useMemo(
    () => listings.filter((item) => item.status === 'active').length,
    [listings]
  );
  const archiveCount = useMemo(
    () => listings.filter((item) => item.status === 'sold' || item.status === 'archived').length,
    [listings]
  );

  const handlePostListing = useCallback(() => {
    if (!requireAuth({ message: 'Sign in to post a listing', returnTo: '/publish/listing' as Href })) {
      return;
    }
    router.push('/publish/listing' as Href);
  }, [requireAuth, router]);

  const handleListingPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}`);
    },
    [router]
  );

  const handleEditPress = useCallback(
    (id: string) => {
      router.push(`/listing/${id}/edit`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: MyListingItem }) => (
      <MyListingRow listing={item} onPress={handleListingPress} onEditPress={handleEditPress} />
    ),
    [handleEditPress, handleListingPress]
  );

  const listEmpty = useMemo(() => {
    if (isLoading || isError) return null;

    if (!userId) {
      return (
        <EmptyState
          icon={FileText}
          title="Sign in to manage listings"
          description="Post items for sale or services you offer."
          actionLabel="Sign in"
          onAction={() => requireAuth({ message: 'Sign in to post a listing', returnTo: '/(tabs)/sell' })}
        />
      );
    }

    return (
      <EmptyState
        icon={FileText}
        title={activeTab === 'active' ? 'No active listings' : 'Archive is empty'}
        description={
          activeTab === 'active'
            ? 'Use the button below to post your first listing.'
            : 'Sold and archived listings will appear here.'
        }
      />
    );
  }, [activeTab, isError, isLoading, requireAuth, userId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 56, paddingHorizontal: horizontalPadding }}>
        <Text style={{ ...typography.h1, color: colors.textPrimary, marginBottom: 16 }}>My listings</Text>

        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {(
            [
              { id: 'active' as const, label: 'Active', count: activeCount },
              { id: 'archive' as const, label: 'Archive', count: archiveCount },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  paddingBottom: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isSelected ? colors.textPrimary : 'transparent',
                }}
              >
                <Text
                  style={{
                    ...typography.body,
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    fontFamily: isSelected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 ? `  ${tab.count}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <ListSkeleton count={4} itemHeight={96} />
        </View>
      ) : isError ? (
        <ErrorState title="Could not load your listings" onRetry={() => refetch()} />
      ) : (
        <FlashList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: tabBarHeight + 88,
            flexGrow: filteredListings.length === 0 ? 1 : 0,
          }}
          ListEmptyComponent={listEmpty}
        />
      )}

      {userId ? <PostListingBar onPress={handlePostListing} /> : null}
    </View>
  );
}
