import type { ListingCardItem } from '@/src/features/listings/types';
import { DEMO_LISTING_ATTRIBUTES } from '@/src/features/listings/constants/demo-attributes';
import { resolveListingCategoryId } from '@/src/features/listings/constants/categories';
import { matchesListingQuery } from '@/src/features/search/utils/filter-listings';

export const LISTING_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'most_viewed', label: 'Most viewed' },
] as const;

export type ListingSortOption = (typeof LISTING_SORT_OPTIONS)[number]['id'];

export const DEFAULT_LISTING_SORT: ListingSortOption = 'newest';

export interface ListingSearchParams {
  category?: string | null;
  query?: string | null;
  sort?: ListingSortOption;
  priceMin?: number | null;
  priceMax?: number | null;
  attributeFilters?: Record<string, string>;
}

export function sanitizeListingSearchTerm(value: string): string {
  return value.trim().replace(/[%_]/g, '');
}

export function listingSortLabelToId(label: string): ListingSortOption {
  const match = LISTING_SORT_OPTIONS.find((option) => option.label === label);
  return match?.id ?? DEFAULT_LISTING_SORT;
}

export function listingSortIdToLabel(sort: ListingSortOption): string {
  return LISTING_SORT_OPTIONS.find((option) => option.id === sort)?.label ?? 'Newest';
}

export function buildListingSearchParams(options: {
  category?: string | null;
  query?: string;
  sort?: ListingSortOption;
  priceMin?: number | null;
  priceMax?: number | null;
  attributeFilters?: Record<string, string>;
}): ListingSearchParams {
  const attributeFilters = Object.fromEntries(
    Object.entries(options.attributeFilters ?? {}).filter(([, value]) => value.trim().length > 0)
  );

  return {
    category: options.category ?? null,
    query: options.query?.trim() || null,
    sort: options.sort ?? DEFAULT_LISTING_SORT,
    priceMin: options.priceMin ?? null,
    priceMax: options.priceMax ?? null,
    attributeFilters: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
  };
}

function matchesPriceRange(price: number, priceMin?: number | null, priceMax?: number | null): boolean {
  if (priceMin != null && price < priceMin) return false;
  if (priceMax != null && price > priceMax) return false;
  return true;
}

function matchesAttributeFilters(
  listingId: string,
  category: string | null,
  attributeFilters: Record<string, string> | undefined
): boolean {
  if (!attributeFilters || Object.keys(attributeFilters).length === 0) return true;

  const attrs = DEMO_LISTING_ATTRIBUTES[listingId] ?? {};

  for (const [key, value] of Object.entries(attributeFilters)) {
    if (attrs[key] !== value) return false;
  }

  return true;
}

export function sortListingItems(
  items: ListingCardItem[],
  sort: ListingSortOption = DEFAULT_LISTING_SORT
): ListingCardItem[] {
  const copy = [...items];

  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price || a.id.localeCompare(b.id));
    case 'most_viewed':
      return copy.sort(
        (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0) || a.id.localeCompare(b.id)
      );
    case 'newest':
    default:
      return copy;
  }
}

export function filterListingItems(
  items: ListingCardItem[],
  params: ListingSearchParams
): ListingCardItem[] {
  const query = params.query ?? '';
  const category = params.category;

  return items.filter((listing) => {
    if (query && !matchesListingQuery(listing, query)) return false;
    if (category && listing.category !== category) return false;
    if (!matchesPriceRange(listing.price, params.priceMin, params.priceMax)) return false;
    if (
      !matchesAttributeFilters(
        listing.id,
        resolveListingCategoryId(listing.id, listing.category),
        params.attributeFilters
      )
    ) {
      return false;
    }
    return true;
  });
}

export function applyListingDiscovery(
  items: ListingCardItem[],
  params: ListingSearchParams
): ListingCardItem[] {
  const filtered = filterListingItems(items, params);
  return sortListingItems(filtered, params.sort ?? DEFAULT_LISTING_SORT);
}
