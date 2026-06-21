import { getCategoryLabel } from '@/src/features/listings/constants/categories';
import { DEMO_LISTING_ATTRIBUTES } from '@/src/features/listings/constants/demo-attributes';
import type { ListingAttributes } from '@/src/features/listings/types';

export interface ListingSpecItem {
  label: string;
  value: string;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  condition: 'Condition',
  brand: 'Brand',
  model: 'Model',
  storage: 'Storage',
  color: 'Color',
  size: 'Size',
  platform: 'Platform',
  network: 'Network',
  dimensions: 'Dimensions',
  material: 'Material',
  year: 'Year',
  mileage: 'Mileage',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  area: 'Area',
};

function formatAttributeLabel(key: string): string {
  if (ATTRIBUTE_LABELS[key]) return ATTRIBUTE_LABELS[key];
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeAttributes(value: ListingAttributes | null | undefined): ListingAttributes {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value).filter(
    ([, attrValue]) => typeof attrValue === 'string' && attrValue.trim().length > 0
  );
  return Object.fromEntries(entries);
}

interface ResolveListingSpecsInput {
  id: string;
  category: string | null;
  attributes?: ListingAttributes | null;
}

export function resolveListingSpecs({
  id,
  category,
  attributes,
}: ResolveListingSpecsInput): ListingSpecItem[] {
  const merged: ListingAttributes = {
    ...DEMO_LISTING_ATTRIBUTES[id],
    ...normalizeAttributes(attributes),
  };

  const specs: ListingSpecItem[] = [];

  if (category) {
    specs.push({ label: 'Category', value: getCategoryLabel(category) });
  }

  for (const [key, value] of Object.entries(merged)) {
    specs.push({ label: formatAttributeLabel(key), value });
  }

  return specs;
}
