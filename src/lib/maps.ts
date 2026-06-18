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

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const EARTH_RADIUS_KM = 6371;

export function hasValidCoordinates(
  input?: { lat?: number | null; lng?: number | null } | null
): input is { lat: number; lng: number } {
  return input?.lat != null && input?.lng != null;
}

export function resolveVehicleCoordinates(
  input?: VehicleLocationInput | null
): MapCoordinates | null {
  if (hasValidCoordinates(input)) {
    return { latitude: input.lat, longitude: input.lng };
  }

  return null;
}

export function haversineDistanceKm(a: MapCoordinates, b: MapCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function boundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export function toMapRegion(coords: MapCoordinates, delta = 0.08) {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function sortByDistance<T extends { lat?: number | null; lng?: number | null }>(
  items: T[],
  userCoords: MapCoordinates
): T[] {
  return [...items].sort((a, b) => {
    const distA =
      hasValidCoordinates(a)
        ? haversineDistanceKm(userCoords, { latitude: a.lat, longitude: a.lng })
        : Number.POSITIVE_INFINITY;
    const distB =
      hasValidCoordinates(b)
        ? haversineDistanceKm(userCoords, { latitude: b.lat, longitude: b.lng })
        : Number.POSITIVE_INFINITY;
    return distA - distB;
  });
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
