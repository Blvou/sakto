import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const memory = new Map<string, string>();

const serverStorage: StorageAdapter = {
  getItem: async (key) => memory.get(key) ?? null,
  setItem: async (key, value) => {
    memory.set(key, value);
  },
  removeItem: async (key) => {
    memory.delete(key);
  },
};

/** Safe for Expo web SSR (Node has no `window`). Uses AsyncStorage only in the browser / native. */
export function getClientStorage(): StorageAdapter {
  if (typeof window === 'undefined') {
    return serverStorage;
  }
  return AsyncStorage;
}
