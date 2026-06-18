import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

interface NotificationsState {
  items: AppNotification[];
  add: (item: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  add: (item) =>
    set((state) => ({
      items: [
        {
          ...item,
          id: `${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.items,
      ].slice(0, 50),
    })),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().items.filter((n) => !n.read).length,
}));
