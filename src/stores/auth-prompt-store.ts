import { create } from 'zustand';
import type { Href } from 'expo-router';

interface AuthPromptState {
  visible: boolean;
  message: string;
  returnTo?: Href;
  open: (options?: { message?: string; returnTo?: Href }) => void;
  close: () => void;
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  visible: false,
  message: 'Sign in to continue',
  returnTo: undefined,
  open: (options) =>
    set({
      visible: true,
      message: options?.message ?? 'Sign in to continue',
      returnTo: options?.returnTo,
    }),
  close: () => set({ visible: false, returnTo: undefined }),
}));
