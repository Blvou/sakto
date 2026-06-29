import type { ListingCardItem } from '@/src/features/listings/types';
import { DEMO_LISTING_ATTRIBUTES } from '@/src/features/listings/constants/demo-attributes';
import { resolveListingCategoryId } from '@/src/features/listings/constants/category-tree';
import { matchesListingQuery } from '@/src/features/search/utils/filter-listings';

export const LISTING_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'most_viewed', label: 'Most viewed' },
] as const;

export type ListingSortOption = (typeof LISTING_SORT_OPTIONS)[number]['id'];

export const DEFAULT_LISTING_SORT: ListingSortOption = 'newest';

export interface AttributeRangeFilter {
  min?: number | null;
  max?: number | null;
}

export interface ListingSearchParams {
  category?: string | null;
  query?: string | null;
  sort?: ListingSortOption;
  priceMin?: number | null;
  priceMax?: number | null;
  locationFilter?: string | null;
  attributeFilters?: Record<string, string>;
  attributeRangeFilters?: Record<string, AttributeRangeFilter>;
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

export function listingSortIdToShortLabel(sort: ListingSortOption): string {
  switch (sort) {
    case 'price_asc':
      return 'Lowest price';
    case 'price_desc':
      return 'Highest price';
    case 'most_viewed':
      return 'Most viewed';
    default:
      return 'Newest';
  }
}

export function buildListingSearchParams(options: {
  category?: string | null;
  query?: string;
  sort?: ListingSortOption;
  priceMin?: number | null;
  priceMax?: number | null;
  locationFilter?: string | null;
  attributeFilters?: Record<string, string>;
  attributeRangeFilters?: Record<string, AttributeRangeFilter>;
}): ListingSearchParams {
  const attributeFilters = Object.fromEntries(
    Object.entries(options.attributeFilters ?? {}).filter(([, value]) => value.trim().length > 0)
  );

  const attributeRangeFilters = Object.fromEntries(
    Object.entries(options.attributeRangeFilters ?? {}).filter(
      ([, range]) => range.min != null || range.max != null
    )
  );

  return {
    category: options.category ?? null,
    query: options.query?.trim() || null,
    sort: options.sort ?? DEFAULT_LISTING_SORT,
    priceMin: options.priceMin ?? null,
    priceMax: options.priceMax ?? null,
    locationFilter: options.locationFilter?.trim() || null,
    attributeFilters: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
    attributeRangeFilters:
      Object.keys(attributeRangeFilters).length > 0 ? attributeRangeFilters : undefined,
  };
}

function matchesPriceRange(price: number, priceMin?: number | null, priceMax?: number | null): boolean {
  if (priceMin != null && price < priceMin) return false;
  if (priceMax != null && price > priceMax) return false;
  return true;
}

function parseNumericAttribute(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesAttributeFilters(
  listingId: string,
  attributeFilters: Record<string, string> | undefined,
  attributeRangeFilters: Record<string, AttributeRangeFilter> | undefined
): boolean {
  const attrs = DEMO_LISTING_ATTRIBUTES[listingId] ?? {};

  if (attributeFilters) {
    for (const [key, value] of Object.entries(attributeFilters)) {
      if (attrs[key] !== value) return false;
    }
  }

  if (attributeRangeFilters) {
    for (const [key, range] of Object.entries(attributeRangeFilters)) {
      const numeric = parseNumericAttribute(attrs[key]);
      if (numeric == null) return false;
      if (range.min != null && numeric < range.min) return false;
      if (range.max != null && numeric > range.max) return false;
    }
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
  const locationFilter = params.locationFilter ?? '';

  return items.filter((listing) => {
    if (query && !matchesListingQuery(listing, query)) return false;
    if (category && resolveListingCategoryId(listing.id, listing.category) !== category) return false;
    if (locationFilter && !listing.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (!matchesPriceRange(listing.price, params.priceMin, params.priceMax)) return false;
    if (
      !matchesAttributeFilters(
        listing.id,
        params.attributeFilters,
        params.attributeRangeFilters
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
