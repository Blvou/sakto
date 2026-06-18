import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Sakto',
  slug: 'sakto',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'phapp',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Sakto uses your location to show bikes for rent nearby.',
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'react-native-maps',
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#F7F9FC',
      },
    ],
    'expo-localization',
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Sakto to access your photos to set your profile avatar.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Sakto uses your location to show bikes for rent nearby.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
