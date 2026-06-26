import type { Href } from 'expo-router';
import {
  Bike,
  Building2,
  Car,
  CarFront,
  Cog,
  HandHelping,
  Store,
  type LucideIcon,
} from 'lucide-react-native';

export interface HubCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  href: Href;
}

export const HUB_CATEGORIES: HubCategory[] = [
  { id: 'transport', label: 'Transport', icon: Car, href: '/transport' as Href },
  { id: 'real-estate', label: 'Real Estate', icon: Building2, href: '/browse/real-estate' as Href },
  { id: 'services', label: 'Services', icon: HandHelping, href: '/browse/services' as Href },
  { id: 'marketplace', label: 'Marketplace', icon: Store, href: '/marketplace/search' as Href },
];

export interface TransportSubcategory {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Href;
  comingSoon?: boolean;
}

export const TRANSPORT_SUBCATEGORIES: TransportSubcategory[] = [
  { id: 'moto-buy', label: 'Buy motorcycle', icon: Bike, href: '/browse/moto-buy' as Href },
  { id: 'auto-buy', label: 'Buy car', icon: CarFront, href: '/browse/auto-buy' as Href },
  { id: 'moto-rent', label: 'Rent motorcycle', icon: Bike, href: '/search' as Href },
  { id: 'auto-rent', label: 'Rent car', icon: Car, comingSoon: true },
  { id: 'parts', label: 'Parts', icon: Cog, href: '/browse/parts' as Href },
];

export const BROWSE_CATEGORY_LABELS: Record<string, string> = {
  'moto-buy': 'Buy motorcycle',
  'auto-buy': 'Buy car',
  parts: 'Parts',
  'real-estate': 'Real Estate',
  services: 'Services',
  marketplace: 'Marketplace',
};

export const LISTING_BROWSE_SLUGS = [
  'moto-buy',
  'auto-buy',
  'parts',
  'real-estate',
  'services',
  'marketplace',
] as const;

export type ListingBrowseSlug = (typeof LISTING_BROWSE_SLUGS)[number];

export function getBrowseTitle(slug: string): string {
  return BROWSE_CATEGORY_LABELS[slug] ?? 'Browse';
}

export function isListingBrowseSlug(slug: string): slug is ListingBrowseSlug {
  return (LISTING_BROWSE_SLUGS as readonly string[]).includes(slug);
}
