import { getCategoryLabel } from '@/src/features/listings/constants/categories';
import {
  getAttributeFieldLabel,
  getAttributeFieldsForCategory,
} from '@/src/features/listings/constants/attribute-fields';
import { DEMO_LISTING_ATTRIBUTES } from '@/src/features/listings/constants/demo-attributes';
import type { ListingAttributes } from '@/src/features/listings/types';

export interface ListingSpecItem {
  label: string;
  value: string;
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

  const fieldDefs = getAttributeFieldsForCategory(category);
  const usedKeys = new Set<string>();

  for (const field of fieldDefs) {
    const value = merged[field.key];
    if (value) {
      specs.push({ label: field.label, value });
      usedKeys.add(field.key);
    }
  }

  for (const [key, value] of Object.entries(merged)) {
    if (usedKeys.has(key)) continue;
    specs.push({ label: getAttributeFieldLabel(key, category), value });
  }

  return specs;
}
