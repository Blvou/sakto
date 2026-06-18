import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import {
  fetchUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (userId: string) => ['notifications', userId] as const,
};

export function useUserNotifications() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: notificationQueryKeys.list(userId ?? ''),
    queryFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return fetchUserNotifications(userId);
    },
    enabled: !!userId,
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount(): number {
  const { data } = useUserNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return markNotificationRead(notificationId, userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(userId) });
      }
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Not authenticated');
      return markAllNotificationsRead(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(userId) });
      }
    },
  });
}
