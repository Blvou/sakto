import type { InfiniteData } from '@tanstack/react-query';
import type { Message } from '../types';

const PAGE_SIZE = 30;

export function appendMessageToCache(
  old: InfiniteData<Message[]> | undefined,
  newMessage: Message
): InfiniteData<Message[]> {
  if (!old?.pages.length) {
    return { pages: [[newMessage]], pageParams: [undefined] };
  }

  const pages = [...old.pages];
  const recentPage = pages[0];

  if (recentPage.some((message) => message.id === newMessage.id)) {
    return old;
  }

  pages[0] = [...recentPage, newMessage];
  return { ...old, pages };
}

export function prependOptimisticMessage(
  old: InfiniteData<Message[]> | undefined,
  optimistic: Message
): InfiniteData<Message[]> {
  if (!old?.pages.length) {
    return { pages: [[optimistic]], pageParams: [undefined] };
  }

  const pages = [...old.pages];
  pages[0] = [...pages[0], optimistic];
  return { ...old, pages };
}

/** Swap temp optimistic row for the server message (or dedupe if Realtime already added it). */
export function confirmOptimisticMessage(
  old: InfiniteData<Message[]> | undefined,
  serverMessage: Message
): InfiniteData<Message[]> {
  if (!old?.pages.length) {
    return { pages: [[serverMessage]], pageParams: [undefined] };
  }

  const pages = [...old.pages];
  const withoutMatchingTemp = pages[0].filter(
    (message) =>
      !(
        message.id.startsWith('temp-') &&
        message.sender_id === serverMessage.sender_id &&
        message.body === serverMessage.body
      )
  );

  if (withoutMatchingTemp.some((message) => message.id === serverMessage.id)) {
    pages[0] = withoutMatchingTemp;
  } else {
    pages[0] = [...withoutMatchingTemp, serverMessage];
  }

  return { ...old, pages };
}

export function restoreMessagesCache(
  previous: InfiniteData<Message[]> | undefined
): InfiniteData<Message[]> | undefined {
  return previous;
}

export function flattenMessages(data: InfiniteData<Message[]> | undefined): Message[] {
  if (!data?.pages.length) return [];
  return [...data.pages].reverse().flat();
}

export { PAGE_SIZE as MESSAGES_PAGE_SIZE };
