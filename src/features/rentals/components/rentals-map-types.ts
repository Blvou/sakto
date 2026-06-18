import type { MapCoordinates } from '@/src/lib/maps';

export interface RentalsMapHandle {
  centerOnUser: (coords: MapCoordinates) => void;
}
