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
  },
  {
    id: '2',
    title: 'List your bike',
    subtitle: 'Earn ₱300–500/day renting out',
    backgroundColor: '#FF6B00',
    textColor: '#FFFFFF',
  },
  {
    id: '3',
    title: 'Verified hosts',
    subtitle: 'Rent with confidence',
    backgroundColor: '#00C853',
    textColor: '#FFFFFF',
  },
];

export const scooters: ScooterListing[] = [
  {
    id: 's1',
    model: 'Honda Beat',
    pricePerDay: 350,
    rating: 4.8,
    reviewCount: 120,
    distanceKm: 1.2,
    image: require('../../../../assets/scooters/s1.png'),
    instant: true,
  },
  {
    id: 's2',
    model: 'Yamaha Mio',
    pricePerDay: 300,
    rating: 4.6,
    reviewCount: 89,
    distanceKm: 0.8,
    image: require('../../../../assets/scooters/s2.png'),
    instant: true,
  },
  {
    id: 's3',
    model: 'Honda Click',
    pricePerDay: 400,
    rating: 4.9,
    reviewCount: 203,
    distanceKm: 2.1,
    image: require('../../../../assets/scooters/s3.png'),
    instant: false,
  },
];

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}
