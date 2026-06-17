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

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  location: string;
  timeAgo: string;
  image: ProductImage;
  badge?: 'urgent' | 'top';
  liked?: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
}

export const categories: Category[] = [
  { id: 'scooters', label: 'Scooters', emoji: '🛵', highlight: true },
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'auto', label: 'Auto', emoji: '🚗' },
  { id: 'jobs', label: 'Jobs', emoji: '💼' },
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'more', label: 'More', emoji: '⚡' },
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
    title: 'Sell faster',
    subtitle: 'Boost your listing for ₱49',
    backgroundColor: '#FF6B00',
    textColor: '#FFFFFF',
  },
  {
    id: '3',
    title: 'Verified sellers',
    subtitle: 'Shop with confidence',
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

export const listings: MarketplaceListing[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    title: 'iPhone 13 Pro 128GB — Space Gray',
    price: 25000,
    location: 'Makati',
    timeAgo: '2h ago',
    image: require('../../../../assets/listings/l1.png'),
    badge: 'top',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    title: 'Nike Air Max 90 — Size 42',
    price: 3500,
    location: 'Quezon City',
    timeAgo: '5h ago',
    image: require('../../../../assets/listings/l2.png'),
    badge: 'urgent',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    title: 'IKEA Kallax Shelf — White',
    price: 4500,
    location: 'Pasig',
    timeAgo: '1d ago',
    image: require('../../../../assets/listings/l3.png'),
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    title: 'PS5 DualSense Controller',
    price: 2200,
    location: 'Manila',
    timeAgo: '3h ago',
    image: require('../../../../assets/listings/l4.png'),
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    title: 'Samsung Galaxy A54 5G',
    price: 12000,
    location: 'Taguig',
    timeAgo: '6h ago',
    image: require('../../../../assets/listings/l5.png'),
    badge: 'top',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    title: 'Vintage Denim Jacket — M',
    price: 800,
    location: 'Cebu City',
    timeAgo: '12h ago',
    image: require('../../../../assets/listings/l6.png'),
  },
];

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}
