import type { Href } from 'expo-router';
import {
  getBrowseTitle,
  getHubCategories,
  getTransportHubItems,
  isListingBrowseSlug,
  LISTING_BROWSE_SLUGS,
  type ListingBrowseSlug,
  type TransportHubItem,
} from '@/src/features/listings/constants/category-tree';

export interface HubCategory {
  id: string;
  label: string;
  icon: import('lucide-react-native').LucideIcon;
  href: Href;
}

function hubHrefForNode(node: ReturnType<typeof getHubCategories>[number]): Href {
  if (node.id === 'transport') return '/transport' as Href;
  if (node.browseHref) return node.browseHref;
  if (node.leaf) return `/browse/${node.id}` as Href;
  return `/marketplace/categories?section=${node.id}` as Href;
}

export const HUB_CATEGORIES: HubCategory[] = getHubCategories().map((node) => ({
  id: node.id,
  label: node.label,
  icon: node.icon,
  href: hubHrefForNode(node),
}));

export type TransportSubcategory = TransportHubItem;

export const TRANSPORT_SUBCATEGORIES: TransportSubcategory[] = getTransportHubItems();

export const BROWSE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  LISTING_BROWSE_SLUGS.map((slug) => [slug, getBrowseTitle(slug)])
);

export { LISTING_BROWSE_SLUGS, type ListingBrowseSlug, getBrowseTitle, isListingBrowseSlug };
