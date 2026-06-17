import type { Database } from '@/src/lib/database.types';
import type { ProfilePreview } from '@/src/features/profile/types';

export type ListingStatus = 'active' | 'sold' | 'archived';

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
};
