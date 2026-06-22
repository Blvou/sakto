import type { ListingAttributes } from '@/src/features/listings/types';

export function sanitizeListingAttributes(value: ListingAttributes | undefined): ListingAttributes {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, attrValue]) => typeof attrValue === 'string' && attrValue.trim().length > 0)
  );
}
