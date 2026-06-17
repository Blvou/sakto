import type { InfiniteData } from '@tanstack/react-query';
import type { ConversationPreview } from '../types';

export const CONVERSATIONS_PAGE_SIZE = 50;

export interface ConversationsPage {
  items: ConversationPreview[];
  nextCursor: string | undefined;
}

type ConversationsCache =
  | ConversationPreview[]
  | InfiniteData<ConversationPreview[]>
  | InfiniteData<ConversationsPage>
  | undefined;

export type { ConversationsCache };

export function flattenConversations(data: ConversationsCache): ConversationPreview[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (!data.pages.length) return [];

  const firstPage = data.pages[0];
  if (firstPage && typeof firstPage === 'object' && 'items' in firstPage) {
    return (data as InfiniteData<ConversationsPage>).pages.flatMap((page) => page.items);
  }

  return (data as InfiniteData<ConversationPreview[]>).pages.flat();
}

export function updateConversationsCache(
  data: InfiniteData<ConversationsPage> | undefined,
  updater: (flat: ConversationPreview[]) => ConversationPreview[]
): InfiniteData<ConversationsPage> | undefined {
  if (!data?.pages.length) {
    const updated = updater([]);
    if (!updated.length) return data;
    return {
      pages: [
        {
          items: updated,
          nextCursor: updated[updated.length - 1]?.last_message_at ?? undefined,
        },
      ],
      pageParams: [undefined],
    };
  }

  const flat = flattenConversations(data);
  const updated = updater(flat);
  const pageSizes = data.pages.map((page) => page.items.length);
  const pages: ConversationsPage[] = [];
  let offset = 0;

  for (const size of pageSizes) {
    const items = updated.slice(offset, offset + size);
    pages.push({
      items,
      nextCursor: items[items.length - 1]?.last_message_at ?? undefined,
    });
    offset += size;
  }

  if (offset < updated.length && pages.length) {
    const lastPage = pages[pages.length - 1];
    const extra = updated.slice(offset);
    lastPage.items = [...lastPage.items, ...extra];
    lastPage.nextCursor = extra[extra.length - 1]?.last_message_at ?? lastPage.nextCursor;
  }

  return { ...data, pages };
}

export function asConversationsCache(data: unknown): ConversationsCache {
  return data as ConversationsCache;
}
