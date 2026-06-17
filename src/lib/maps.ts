import { Linking, Platform } from 'react-native';

/** Ermita, Manila — default pickup area for seed/mock listings without coords. */
export const MANILA_DEFAULT_COORDS = {
  latitude: 14.5784,
  longitude: 120.9842,
} as const;

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface VehicleLocationInput {
  lat?: number | null;
  lng?: number | null;
  location?: string | null;
  city?: string | null;
}

export function resolveVehicleCoordinates(
  input?: VehicleLocationInput | null
): MapCoordinates {
  if (input?.lat != null && input?.lng != null) {
    return { latitude: input.lat, longitude: input.lng };
  }

  return { ...MANILA_DEFAULT_COORDS };
}

function buildMapsUrl(coords: MapCoordinates, label: string): string {
  const { latitude, longitude } = coords;
  const encodedLabel = encodeURIComponent(label);

  if (Platform.OS === 'ios') {
    return `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedLabel}`;
  }

  if (Platform.OS === 'android') {
    return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export async function openMapsNavigation(
  coords: MapCoordinates,
  label = 'Pickup location'
): Promise<boolean> {
  const primaryUrl = buildMapsUrl(coords, label);
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;

  try {
    const canOpen = await Linking.canOpenURL(primaryUrl);
    await Linking.openURL(canOpen ? primaryUrl : fallbackUrl);
    return true;
  } catch {
    try {
      await Linking.openURL(fallbackUrl);
      return true;
    } catch {
      return false;
    }
  }
}
