export interface ListingCategory {
  id: string;
  label: string;
  emoji: string;
  highlight?: boolean;
}

/** Marketplace listing categories stored in `listings.category`. */
export const LISTING_CATEGORIES: ListingCategory[] = [
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'auto', label: 'Auto', emoji: '🚗' },
  { id: 'jobs', label: 'Jobs', emoji: '💼' },
  { id: 'games', label: 'Games', emoji: '🎮' },
];

/** Categories shown on Home / Search browse UI (includes scooters + catch-all). */
export const BROWSE_CATEGORIES: ListingCategory[] = [
  { id: 'scooters', label: 'Scooters', emoji: '🛵', highlight: true },
  ...LISTING_CATEGORIES,
  { id: 'more', label: 'More', emoji: '⚡' },
];

const CATEGORY_BY_ID = new Map(LISTING_CATEGORIES.map((c) => [c.id, c]));
const CATEGORY_BY_LABEL = new Map(
  LISTING_CATEGORIES.map((c) => [c.label.toLowerCase(), c.id])
);

const DEMO_LISTING_CATEGORIES: Record<string, string> = {
  'a0000000-0000-4000-8000-000000000001': 'electronics',
  'a0000000-0000-4000-8000-000000000002': 'clothing',
  'a0000000-0000-4000-8000-000000000003': 'home',
  'a0000000-0000-4000-8000-000000000004': 'games',
  'a0000000-0000-4000-8000-000000000005': 'electronics',
  'a0000000-0000-4000-8000-000000000006': 'clothing',
};

export function getCategoryLabel(categoryId: string | null | undefined): string {
  if (!categoryId) return 'More';
  if (categoryId === 'scooters') return 'Scooters';
  if (categoryId === 'more') return 'More';
  return CATEGORY_BY_ID.get(categoryId)?.label ?? 'More';
}

export function normalizeCategoryId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === 'scooters' || value === 'more') return value;
  if (CATEGORY_BY_ID.has(value)) return value;
  return CATEGORY_BY_LABEL.get(value.toLowerCase()) ?? 'more';
}

export function resolveListingCategoryId(
  listingId: string,
  category: string | null | undefined
): string {
  return normalizeCategoryId(category) ?? DEMO_LISTING_CATEGORIES[listingId] ?? 'more';
}
