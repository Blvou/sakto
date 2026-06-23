import type { ListingAttributes } from '@/src/features/listings/types';
import { getCategoryAttributesValidationError } from '../constants/attribute-fields';
import { sanitizeListingAttributes } from './sanitize-attributes';

export function validateListingCategoryAttributes(
  category: string | null | undefined,
  attributes: ListingAttributes | undefined
): string | null {
  return getCategoryAttributesValidationError(category, sanitizeListingAttributes(attributes));
}
