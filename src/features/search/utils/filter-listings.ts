import type { ListingCardItem } from '@/src/features/listings/types';
import { BROWSE_CATEGORIES } from '@/src/features/listings/constants/categories';

export interface CategorySection {
  id: string;
  label: string;
  emoji: string;
  listings: ListingCardItem[];
}

function matchesQuery(listing: ListingCardItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    listing.title.toLowerCase().includes(normalized) ||
    listing.location.toLowerCase().includes(normalized)
  );
}

export function filterBrowseListings(
  listings: ListingCardItem[],
  options: { query?: string; categoryId?: string | null }
): ListingCardItem[] {
  const { query = '', categoryId = null } = options;

  return listings.filter((listing) => {
    if (!matchesQuery(listing, query)) return false;
    if (!categoryId) return true;
    if (categoryId === 'scooters') return false;
    if (categoryId === 'more') return listing.category === 'more';
    return listing.category === categoryId;
  });
}

export function groupListingsByCategory(listings: ListingCardItem[]): CategorySection[] {
  const grouped = new Map<string, ListingCardItem[]>();

  for (const listing of listings) {
    const categoryId = listing.category ?? 'more';
    const bucket = grouped.get(categoryId) ?? [];
    bucket.push(listing);
    grouped.set(categoryId, bucket);
  }

  return BROWSE_CATEGORIES.filter((category) => category.id !== 'scooters')
    .map((category) => ({
      id: category.id,
      label: category.label,
      emoji: category.emoji,
      listings: grouped.get(category.id) ?? [],
    }))
    .filter((section) => section.listings.length > 0);
}
