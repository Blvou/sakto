import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { fetchThreadSnapshot } from '../api/thread-snapshot';
import { chatQueryKeys } from '../types';
import { hasWarmThreadCache, hydrateThreadCaches } from '../utils/thread-cache';

export function useThreadSnapshot(conversationId: string) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const cacheWarm = !!conversationId && hasWarmThreadCache(queryClient, conversationId);

  return useQuery({
    queryKey: chatQueryKeys.threadSnapshot(conversationId),
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const snapshot = await fetchThreadSnapshot(conversationId, userId);
      hydrateThreadCaches(queryClient, conversationId, snapshot);
      return snapshot;
    },
    enabled: !!conversationId && !!userId && !cacheWarm,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useThreadSnapshotReady(conversationId: string): boolean {
  const queryClient = useQueryClient();

  // Share query state with useThreadSnapshot — enabled:false avoids a second network fetch.
  const { isSuccess, isError } = useQuery({
    queryKey: chatQueryKeys.threadSnapshot(conversationId),
    queryFn: async () => {
      const cached = queryClient.getQueryData(chatQueryKeys.threadSnapshot(conversationId));
      if (cached) return cached;
      throw new Error('Thread snapshot not loaded');
    },
    enabled: false,
    staleTime: Infinity,
  });

  if (!conversationId) return false;
  if (hasWarmThreadCache(queryClient, conversationId)) return true;
  return isSuccess || isError;
}
