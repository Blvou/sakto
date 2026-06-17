import type { Database } from '@/src/lib/database.types';
import type { ProfilePreview } from '@/src/features/profile/types';

export type VehicleStatus = Database['public']['Tables']['vehicles']['Row']['status'];
export type BookingStatus = Database['public']['Tables']['bookings']['Row']['status'];
export type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
export type VehiclePhotoRow = Database['public']['Tables']['vehicle_photos']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type VehicleImage = number | { uri: string };

export interface VehicleCardItem {
  id: string;
  title: string;
  model: string;
  pricePerDay: number;
  location: string;
  distanceKm: number | null;
  image: VehicleImage;
  instant: boolean;
  rating: number | null;
  reviewCount: number;
}

export interface VehicleDetail extends VehicleRow {
  photos: VehiclePhotoRow[];
  owner: ProfilePreview;
}

export interface BookingItem extends BookingRow {
  vehicle: Pick<VehicleRow, 'id' | 'title' | 'price_per_day' | 'location'> & {
    photos: Pick<VehiclePhotoRow, 'storage_path' | 'sort_order'>[];
  };
  owner?: ProfilePreview;
  renter?: ProfilePreview;
}

export const VEHICLES_PAGE_SIZE = 20;

export type VehiclesPageCursor = {
  created_at: string;
  id: string;
};

export interface VehicleSearchParams {
  query?: string;
  city?: string;
  limit?: number;
}

export interface VehiclesPage {
  items: VehicleCardItem[];
  nextCursor: VehiclesPageCursor | undefined;
}

export const rentalQueryKeys = {
  all: ['rentals'] as const,
  vehicles: ['rentals', 'vehicles'] as const,
  vehicleList: (params?: VehicleSearchParams) =>
    ['rentals', 'vehicles', params?.query ?? '', params?.city ?? ''] as const,
  vehicleDetail: (id: string) => ['rentals', 'vehicles', id] as const,
  renterBookings: (userId: string) => ['rentals', 'bookings', 'renter', userId] as const,
  ownerBookings: (userId: string) => ['rentals', 'bookings', 'owner', userId] as const,
};
