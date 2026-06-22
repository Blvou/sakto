import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { chatTypography } from '@/src/features/chat/constants/typography';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { ConversationListItem } from '@/src/features/chat/components/ConversationListItem';
import { useConversations } from '@/src/features/chat/hooks/use-conversations';
import { useHideConversation } from '@/src/features/chat/hooks/use-hide-conversation';
import { useRealtimeConversationList } from '@/src/features/chat/hooks/use-realtime-conversation-list';
import { prefetchThreadSnapshot, prefetchConversations } from '@/src/features/chat/utils/prefetch-chat';
import type { ConversationPreview } from '@/src/features/chat/types';
import { confirmDestructive } from '@/src/lib/confirm';

function ChatSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="90%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const { horizontalPadding, listBottomPadding } = useResponsive();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const {
    conversations,
    isPending,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations();
  const hideConversation = useHideConversation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useRealtimeConversationList(userId);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        void prefetchConversations(queryClient, userId);
      }
    }, [queryClient, userId])
  );

  const handleConversationPress = useCallback(
    (conversationId: string) => {
      router.push(`/chat/${conversationId}`);
    },
    [router]
  );

  const handleConversationPressIn = useCallback(
    (conversationId: string) => {
      if (userId) {
        void prefetchThreadSnapshot(queryClient, conversationId, userId);
      }
    },
    [queryClient, userId]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDeletePress = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      const title = conversation?.other_user.display_name ?? 'this chat';

      confirmDestructive({
        title: 'Delete chat?',
        message: `Messages with ${title} will be removed from your inbox.`,
        onConfirm: () => {
          setDeletingId(conversationId);
          hideConversation.mutate(
            { conversationId },
            { onSettled: () => setDeletingId(null) }
          );
        },
      });
    },
    [conversations, hideConversation]
  );

  const keyExtractor = useCallback((item: ConversationPreview) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: ConversationPreview }) => (
      <ConversationListItem
        conversation={item}
        onPress={handleConversationPress}
        onPressIn={handleConversationPressIn}
        onDeletePress={handleDeletePress}
        isDeleting={deletingId === item.id && hideConversation.isPending}
      />
    ),
    [deletingId, handleConversationPress, handleConversationPressIn, handleDeletePress, hideConversation.isPending]
  );

  const showSkeleton = isPending && conversations.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: 56, paddingHorizontal: horizontalPadding, paddingBottom: 16 }}>
        <Text style={{ ...chatTypography.title, color: colors.textPrimary }}>Messages</Text>
      </View>

      {showSkeleton ? (
        <ChatSkeleton />
      ) : isError && conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ ...chatTypography.body, color: colors.textSecondary, textAlign: 'center' }}>
            Could not load messages. Check your connection.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              marginTop: 16,
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            {isRefetching ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ ...chatTypography.bodySemibold, color: '#FFF' }}>
                Retry
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: listBottomPadding, flexGrow: 1 }}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          drawDistance={300}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ ...chatTypography.headline, color: colors.textPrimary }}>No messages yet</Text>
              <Text
                style={{
                  ...chatTypography.body,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Start a chat from any listing to connect with sellers
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
