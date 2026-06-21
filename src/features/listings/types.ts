import type { Database } from '@/src/lib/database.types';
import type { ProfilePreview } from '@/src/features/profile/types';

export type ListingStatus = 'active' | 'sold' | 'archived';

export type ListingAttributes = Record<string, string>;

export type ListingReportReason = 'spam' | 'fraud' | 'prohibited' | 'wrong_category' | 'other';

export const LISTING_REPORT_REASONS: ReadonlyArray<{ id: ListingReportReason; label: string }> = [
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'fraud', label: 'Suspected fraud' },
  { id: 'prohibited', label: 'Prohibited item' },
  { id: 'wrong_category', label: 'Wrong category' },
  { id: 'other', label: 'Other' },
];

export type ListingRow = Database['public']['Tables']['listings']['Row'];

export type ListingImage = number | { uri: string };

export interface ListingCardItem {
  id: string;
  title: string;
  price: number;
  location: string;
  timeAgo: string;
  image: ListingImage;
  category: string | null;
  badge?: 'urgent' | 'top';
  liked?: boolean;
}

export interface ListingDetail extends ListingRow {
  seller: ProfilePreview;
  media_urls: string[];
}

export interface MyListingItem extends ListingCardItem {
  status: ListingStatus;
}

export const LISTINGS_PAGE_SIZE = 20;

export type ListingsPageCursor = {
  created_at: string;
  id: string;
};

export interface ListingsPage {
  items: ListingCardItem[];
  nextCursor: ListingsPageCursor | undefined;
}

export const listingQueryKeys = {
  all: ['listings'] as const,
  list: ['listings', 'list'] as const,
  detail: (id: string) => ['listings', id] as const,
  mine: (sellerId: string) => ['listings', 'mine', sellerId] as const,
  stats: (sellerId: string) => ['listings', 'stats', sellerId] as const,
  report: (listingId: string, userId: string) => ['listings', 'report', listingId, userId] as const,
};
