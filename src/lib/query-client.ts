import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      gcTime: 1000 * 60 * 60 * 24,
    },
    mutations: {
      retry: 1,
    },
  },
});

let persistenceStarted = false;

/** Must run on the client only — avoids `window is not defined` during web SSR. */
export function setupQueryPersistence(): void {
  if (persistenceStarted || typeof window === 'undefined') return;
  persistenceStarted = true;

  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'sakto-query-cache-v2',
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Never persist pending/error queries — causes "dehydrated as pending ended up rejecting" on web.
        if (query.state.status !== 'success') return false;
        const key = query.queryKey[0];
        return key === 'conversations' || key === 'messages' || key === 'rentals';
      },
    },
  });
}
