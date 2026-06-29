import {
  getCategoryLabel,
  getLeafCategories,
  normalizeCategoryId,
  resolveListingCategoryId,
  type CategoryNode,
} from './category-tree';

export interface ListingCategory {
  id: string;
  label: string;
  emoji: string;
  highlight?: boolean;
}

/** @deprecated Use getLeafCategories() from category-tree. Kept for backward compatibility. */
export const LISTING_CATEGORIES: ListingCategory[] = getLeafCategories().map((node) => ({
  id: node.id,
  label: node.label,
  emoji: '',
}));

/** @deprecated Use category picker / hub navigation instead. */
export const BROWSE_CATEGORIES: ListingCategory[] = [
  { id: 'scooters', label: 'Scooters', emoji: '🛵', highlight: true },
  ...LISTING_CATEGORIES,
  { id: 'more', label: 'More', emoji: '⚡' },
];

export {
  getCategoryLabel,
  normalizeCategoryId,
  resolveListingCategoryId,
  getLeafCategories,
  type CategoryNode,
};
