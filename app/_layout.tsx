import { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import 'react-native-reanimated';
import '../global.css';

import { useAppStore } from '@/src/stores/app-store';
import { useTheme } from '@/src/hooks/use-theme';
import { AppProviders } from '@/src/providers/app-providers';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { colors } = useTheme();
  const systemScheme = useRNColorScheme();
  const preference = useAppStore((s) => s.colorScheme);
  const scheme = preference === 'system' ? systemScheme : preference;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_600SemiBold' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="listing/[id]"
        options={{ title: 'Listing', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="listing/[id]/edit"
        options={{ title: 'Edit Listing', presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="my-listings"
        options={{ title: 'My Bikes', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="bookings/[id]"
        options={{ title: 'Booking', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="bookings/index"
        options={{ title: 'My Bookings', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="bookings/owner"
        options={{ title: 'Rental Requests', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="scooter/[id]"
        options={{ title: 'Rent Scooter', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="rentals/map"
        options={{ title: 'Bikes Map', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="publish/index"
        options={{ title: 'List a Bike', presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: 'Notifications', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="favorites"
        options={{ title: 'Favorites', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="search"
        options={{ title: 'Find bikes', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="transport/index"
        options={{ title: 'Transport', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="browse/[category]"
        options={{ title: 'Browse', presentation: 'card', headerShown: false }}
      />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{ title: 'Chat', headerShown: false, presentation: 'card' }}
      />
    </Stack>
  );
}
