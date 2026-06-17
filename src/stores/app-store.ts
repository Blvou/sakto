import { create } from 'zustand';

interface AppState {
  colorScheme: 'light' | 'dark' | 'system';
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  colorScheme: 'system',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
}));
