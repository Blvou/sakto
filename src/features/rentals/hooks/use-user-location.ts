import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { MANILA_DEFAULT_COORDS, type MapCoordinates } from '@/src/lib/maps';

const LOCATION_CACHE_KEY = 'rentals_user_location_v1';

export type UserLocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface CachedLocation {
  coords: MapCoordinates;
  savedAt: number;
}

interface UseUserLocationResult {
  status: UserLocationStatus;
  coords: MapCoordinates;
  isUsingFallback: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

async function readCachedLocation(): Promise<MapCoordinates | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    return parsed.coords;
  } catch {
    return null;
  }
}

async function writeCachedLocation(coords: MapCoordinates): Promise<void> {
  try {
    const payload: CachedLocation = { coords, savedAt: Date.now() };
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore cache write failures
  }
}

export function useUserLocation(requestOnMount = true): UseUserLocationResult {
  const [status, setStatus] = useState<UserLocationStatus>('idle');
  const [coords, setCoords] = useState<MapCoordinates>(MANILA_DEFAULT_COORDS);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);

    const cached = await readCachedLocation();
    if (cached) {
      setCoords(cached);
    }

    try {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== Location.PermissionStatus.GRANTED) {
        setStatus('denied');
        setIsUsingFallback(true);
        setCoords(cached ?? MANILA_DEFAULT_COORDS);
        setError('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoords: MapCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCoords(nextCoords);
      setIsUsingFallback(false);
      setStatus('granted');
      await writeCachedLocation(nextCoords);
    } catch (err) {
      setStatus('error');
      setIsUsingFallback(true);
      setCoords(cached ?? MANILA_DEFAULT_COORDS);
      setError(err instanceof Error ? err.message : 'Could not get location');
    }
  }, []);

  useEffect(() => {
    if (!requestOnMount) return;
    void refresh();
  }, [refresh, requestOnMount]);

  return {
    status,
    coords,
    isUsingFallback,
    error,
    refresh,
  };
}
