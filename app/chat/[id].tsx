import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, InteractionManager } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { resolveUserTargetLang } from '@/src/features/chat/api/translate-utils';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { useTheme } from '@/src/hooks/use-theme';
import { chatTypography } from '@/src/features/chat/constants/typography';
import { ChatHeader } from '@/src/features/chat/components/ChatHeader';
import { ChatThreadSkeleton } from '@/src/features/chat/components/ChatThreadSkeleton';
import { MessagesAreaSkeleton } from '@/src/features/chat/components/MessagesAreaSkeleton';
import { ChatMessageItem } from '@/src/features/chat/components/ChatMessageItem';
import { MessageInput } from '@/src/features/chat/components/MessageInput';
import { TranslateHint } from '@/src/features/chat/components/TranslateHint';
import {
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from '@/src/features/chat/hooks/use-messages';
import { useConversationMeta } from '@/src/features/chat/hooks/use-conversation-meta';
import { useMyProfile } from '@/src/features/chat/hooks/use-my-profile';
import { useThreadSnapshot } from '@/src/features/chat/hooks/use-thread-snapshot';
import { useRealtimeMessages } from '@/src/features/chat/hooks/use-realtime-messages';
import {
  useMessageReceipts,
  useMarkIncomingDelivered,
} from '@/src/features/chat/hooks/use-message-receipts';
import { useTranslateMessage } from '@/src/features/chat/hooks/use-translate-message';
import type { Message } from '@/src/features/chat/types';
import type { PreferredLang } from '@/src/lib/database.types';

const EMPTY_DELIVERED = new Set<string>();

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';
  const { userId } = useAuth();
  const { colors } = useTheme();
  const listRef = useRef<FlashListRef<Message>>(null);
  const shouldScrollToEndRef = useRef(true);
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
  const translatingMessageIdRef = useRef(translatingMessageId);
  translatingMessageIdRef.current = translatingMessageId;

  const { isPending: snapshotPending, isError: snapshotError } = useThreadSnapshot(conversationId);
  const { data: meta } = useConversationMeta(conversationId);
  const { data: myProfile } = useMyProfile();

  const targetLang = useMemo(
    () => resolveUserTargetLang(myProfile?.preferred_lang),
    [myProfile?.preferred_lang]
  );

  const {
    messages,
    isPending: messagesPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);
  const markReadMutation = useMarkConversationRead(conversationId);
  const translateMutation = useTranslateMessage();
  const recipientId = meta?.otherUser?.id;
  const { data: receiptState } = useMessageReceipts(conversationId, recipientId, !!recipientId);

  useRealtimeMessages(conversationId);
  useMarkIncomingDelivered(conversationId, messages, userId ?? undefined);

  const isInitialMessagesLoad = messagesPending && messages.length === 0;
  const showBlockingSkeleton = snapshotPending && !meta?.otherUser;

  useEffect(() => {
    if (!conversationId || !userId) return;

    const task = InteractionManager.runAfterInteractions(() => {
      markReadMutation.mutate();
    });

    return () => task.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, userId]);

  useEffect(() => {
    if (!isInitialMessagesLoad && messages.length > 0 && shouldScrollToEndRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: false });
        shouldScrollToEndRef.current = false;
      });
    }
  }, [isInitialMessagesLoad, messages.length]);

  const sendLockRef = useRef(false);

  const handleSend = useCallback(
    (text: string) => {
      if (sendLockRef.current) return;
      sendLockRef.current = true;
      setTimeout(() => {
        sendLockRef.current = false;
      }, 400);

      shouldScrollToEndRef.current = true;
      sendMutation.mutate(text);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    },
    [sendMutation]
  );

  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleTranslate = useCallback(
    async (messageId: string, text: string, lang: PreferredLang) => {
      setTranslatingMessageId(messageId);
      try {
        const result = await translateMutation.mutateAsync({
          messageId,
          text,
          targetLang: lang,
        });
        return result.translatedText;
      } finally {
        setTranslatingMessageId(null);
      }
    },
    [translateMutation]
  );

  const recipientLastReadAt = receiptState?.recipientLastReadAt ?? null;
  const deliveredMessageIds = receiptState?.deliveredMessageIds ?? EMPTY_DELIVERED;

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <ChatMessageItem
        message={item}
        userId={userId}
        targetLang={targetLang}
        recipientLastReadAt={recipientLastReadAt}
        deliveredMessageIds={deliveredMessageIds}
        onTranslate={handleTranslate}
        isTranslating={translatingMessageIdRef.current === item.id}
      />
    ),
    [userId, targetLang, recipientLastReadAt, deliveredMessageIds, handleTranslate]
  );

  const listHeader = useMemo(
    () =>
      isFetchingNextPage ? (
        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : null,
    [isFetchingNextPage, colors.primary]
  );

  if (showBlockingSkeleton) {
    return <ChatThreadSkeleton />;
  }

  if (!meta?.otherUser) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 }}>
        <Text style={{ ...chatTypography.body, color: colors.textSecondary, textAlign: 'center' }}>
          {snapshotError ? 'Could not load conversation. Check your connection.' : 'Conversation not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ChatHeader otherUser={meta.otherUser} listingTitle={meta.listingTitle} />
      <TranslateHint targetLang={targetLang} />

      {isInitialMessagesLoad ? (
        <MessagesAreaSkeleton />
      ) : (
        <FlashList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          extraData={translatingMessageId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          drawDistance={400}
          onStartReached={handleLoadOlder}
          onStartReachedThreshold={0.2}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 }}>
              <Text style={{ ...chatTypography.body, color: colors.textSecondary }}>
                Say hello to start the conversation
              </Text>
            </View>
          }
        />
      )}

      <MessageInput onSend={handleSend} isSending={false} />
    </View>
  );
}
