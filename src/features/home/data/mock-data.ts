import { DEMO_VEHICLE_IMAGES, DEMO_VEHICLES } from '@/src/features/rentals/data/demo-vehicles';

export type ProductImage = number;

export interface Category {
  id: string;
  label: string;
  emoji: string;
  highlight?: boolean;
}

export interface ScooterListing {
  id: string;
  model: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  image: ProductImage;
  instant: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  href?: string;
  category?: string;
}

export const categories: Category[] = [
  { id: 'nearby', label: 'Nearby', emoji: '📍', highlight: true },
  { id: 'electric', label: 'Electric', emoji: '⚡' },
  { id: 'manual', label: 'Manual', emoji: '🛵' },
  { id: 'hourly', label: 'By hour', emoji: '⏱️' },
  { id: 'daily', label: 'By day', emoji: '📅' },
  { id: 'popular', label: 'Popular', emoji: '🔥' },
];

export const promoBanners: PromoBanner[] = [
  {
    id: '1',
    title: 'Scooter rental -20%',
    subtitle: 'First ride free this week',
    backgroundColor: '#0066FF',
    textColor: '#FFFFFF',
    href: '/rentals/map',
  },
  {
    id: '2',
    title: 'List your bike',
    subtitle: 'Earn ₱300–500/day renting out',
    backgroundColor: '#FF6B00',
    textColor: '#FFFFFF',
    href: '/publish?type=scooter',
  },
  {
    id: '3',
    title: 'Electric bikes',
    subtitle: 'Browse eco-friendly rides',
    backgroundColor: '#00C853',
    textColor: '#FFFFFF',
    category: 'electric',
  },
];

export const scooters: ScooterListing[] = DEMO_VEHICLES.map((vehicle) => ({
  id: vehicle.mockId,
  model: vehicle.title,
  pricePerDay: vehicle.pricePerDay,
  rating: vehicle.rating,
  reviewCount: vehicle.reviewCount,
  distanceKm: vehicle.distanceKm,
  image: DEMO_VEHICLE_IMAGES[vehicle.imageKey],
  instant: vehicle.instant,
}));

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}
