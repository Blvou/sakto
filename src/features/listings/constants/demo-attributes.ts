import type { ListingAttributes } from '@/src/features/listings/types';

/** Fallback specs for demo listing IDs when Supabase is not configured. */
export const DEMO_LISTING_ATTRIBUTES: Record<string, ListingAttributes> = {
  'a0000000-0000-4000-8000-000000000001': {
    condition: 'Used — good',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    storage: '128 GB',
    color: 'Space Gray',
  },
  'a0000000-0000-4000-8000-000000000002': {
    condition: 'Used — like new',
    brand: 'Nike',
    model: 'Air Max 90',
    size: '42',
    color: 'White/Red',
  },
  'a0000000-0000-4000-8000-000000000003': {
    condition: 'Used — good',
    brand: 'IKEA',
    model: 'Kallax',
    dimensions: '77 x 77 cm',
    color: 'White',
  },
  'a0000000-0000-4000-8000-000000000004': {
    condition: 'Used — good',
    brand: 'Sony',
    model: 'DualSense',
    platform: 'PS5',
    color: 'White',
  },
  'a0000000-0000-4000-8000-000000000005': {
    condition: 'Used — good',
    brand: 'Samsung',
    model: 'Galaxy A54 5G',
    storage: '128 GB',
    network: '5G',
  },
  'a0000000-0000-4000-8000-000000000006': {
    condition: 'Used — vintage',
    brand: "Levi's",
    size: 'M',
    material: 'Denim',
    color: 'Blue',
  },
};
