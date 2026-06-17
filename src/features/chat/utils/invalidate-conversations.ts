import { queryClient } from '@/src/lib/query-client';
import { chatQueryKeys } from '../types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const DEBOUNCE_MS = 400;

export function scheduleConversationsInvalidation(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations });
    void queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadTotal });
  }, DEBOUNCE_MS);
}

export function cancelConversationsInvalidation(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
