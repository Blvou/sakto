import type { ListingAttributes } from '@/src/features/listings/types';
import {
  getAttributeFieldsForCategory,
  isValidSelectValue,
} from '../constants/attribute-fields';

export function sanitizeListingAttributes(
  value: ListingAttributes | undefined,
  categoryId?: string | null
): ListingAttributes {
  if (!value) return {};

  const fields = getAttributeFieldsForCategory(categoryId);
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, attrValue]) => typeof attrValue === 'string' && attrValue.trim().length > 0)
      .filter(([key, attrValue]) => {
        const field = fieldByKey.get(key);
        if (!field) return false;
        if (field.type === 'select') {
          return isValidSelectValue(field, attrValue.trim());
        }
        return true;
      })
      .map(([key, attrValue]) => [key, attrValue.trim()])
  );
}
