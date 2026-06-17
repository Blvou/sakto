import { create } from 'zustand';

interface AppState {
  isHomeLoading: boolean;
  setHomeLoading: (loading: boolean) => void;
  colorScheme: 'light' | 'dark' | 'system';
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isHomeLoading: false,
  setHomeLoading: (loading) => set({ isHomeLoading: loading }),
  colorScheme: 'system',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
