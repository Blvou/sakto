import type { InfiniteData } from '@tanstack/react-query';
import type { ListingCardItem, ListingsPage } from '../types';

export function flattenListings(
  data: InfiniteData<ListingsPage> | undefined
): ListingCardItem[] {
  if (!data?.pages.length) return [];
  return data.pages.flatMap((page) => page.items);
}
