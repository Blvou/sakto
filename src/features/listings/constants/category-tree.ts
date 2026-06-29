import type { Href } from 'expo-router';
import {
  Bike,
  Briefcase,
  Building2,
  Car,
  CarFront,
  Cog,
  Gamepad2,
  HandHelping,
  Home,
  Laptop,
  LayoutGrid,
  Music,
  Shirt,
  Smartphone,
  Sofa,
  Store,
  Tablet,
  Trophy,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

export interface CategoryNode {
  id: string;
  parentId: string | null;
  label: string;
  icon: LucideIcon;
  leaf: boolean;
  attributeSchemaKey: string;
  browseHref?: Href;
  legacySlugs?: string[];
  sortOrder: number;
}

const CATEGORY_NODES: CategoryNode[] = [
  // Transport (section)
  {
    id: 'transport',
    parentId: null,
    label: 'Transport',
    icon: Car,
    leaf: false,
    attributeSchemaKey: 'transport',
    sortOrder: 1,
  },
  {
    id: 'moto-buy',
    parentId: 'transport',
    label: 'Buy motorcycle',
    icon: Bike,
    leaf: true,
    attributeSchemaKey: 'moto-buy',
    browseHref: '/browse/moto-buy' as Href,
    legacySlugs: ['moto-buy'],
    sortOrder: 1,
  },
  {
    id: 'auto-buy',
    parentId: 'transport',
    label: 'Buy car',
    icon: CarFront,
    leaf: true,
    attributeSchemaKey: 'auto-buy',
    browseHref: '/browse/auto-buy' as Href,
    legacySlugs: ['auto-buy', 'auto'],
    sortOrder: 2,
  },
  {
    id: 'parts-moto',
    parentId: 'transport',
    label: 'Motorcycle parts',
    icon: Cog,
    leaf: true,
    attributeSchemaKey: 'parts',
    browseHref: '/browse/parts-moto' as Href,
    sortOrder: 3,
  },
  {
    id: 'parts-auto',
    parentId: 'transport',
    label: 'Car parts',
    icon: Wrench,
    leaf: true,
    attributeSchemaKey: 'parts',
    browseHref: '/browse/parts-auto' as Href,
    sortOrder: 4,
  },
  {
    id: 'parts-accessories',
    parentId: 'transport',
    label: 'Parts & accessories',
    icon: Cog,
    leaf: true,
    attributeSchemaKey: 'parts',
    browseHref: '/browse/parts-accessories' as Href,
    legacySlugs: ['parts'],
    sortOrder: 5,
  },

  // Real Estate (section)
  {
    id: 'real-estate',
    parentId: null,
    label: 'Real Estate',
    icon: Building2,
    leaf: false,
    attributeSchemaKey: 'real-estate',
    sortOrder: 2,
  },
  {
    id: 'real-estate-rent',
    parentId: 'real-estate',
    label: 'For rent',
    icon: Building2,
    leaf: true,
    attributeSchemaKey: 'real-estate-rent',
    browseHref: '/browse/real-estate-rent' as Href,
    sortOrder: 1,
  },
  {
    id: 'real-estate-sale',
    parentId: 'real-estate',
    label: 'For sale',
    icon: Building2,
    leaf: true,
    attributeSchemaKey: 'real-estate-sale',
    browseHref: '/browse/real-estate-sale' as Href,
    legacySlugs: ['real-estate'],
    sortOrder: 2,
  },

  // Electronics (section)
  {
    id: 'electronics',
    parentId: null,
    label: 'Electronics',
    icon: Smartphone,
    leaf: false,
    attributeSchemaKey: 'electronics',
    sortOrder: 3,
  },
  {
    id: 'electronics-phones',
    parentId: 'electronics',
    label: 'Phones',
    icon: Smartphone,
    leaf: true,
    attributeSchemaKey: 'electronics',
    browseHref: '/browse/electronics-phones' as Href,
    legacySlugs: ['electronics'],
    sortOrder: 1,
  },
  {
    id: 'electronics-laptops',
    parentId: 'electronics',
    label: 'Laptops',
    icon: Laptop,
    leaf: true,
    attributeSchemaKey: 'electronics',
    browseHref: '/browse/electronics-laptops' as Href,
    sortOrder: 2,
  },
  {
    id: 'electronics-tablets',
    parentId: 'electronics',
    label: 'Tablets',
    icon: Tablet,
    leaf: true,
    attributeSchemaKey: 'electronics',
    browseHref: '/browse/electronics-tablets' as Href,
    sortOrder: 3,
  },
  {
    id: 'electronics-appliances',
    parentId: 'electronics',
    label: 'Appliances',
    icon: UtensilsCrossed,
    leaf: true,
    attributeSchemaKey: 'electronics-appliances',
    browseHref: '/browse/electronics-appliances' as Href,
    sortOrder: 4,
  },
  {
    id: 'electronics-accessories',
    parentId: 'electronics',
    label: 'Accessories',
    icon: Smartphone,
    leaf: true,
    attributeSchemaKey: 'electronics-accessories',
    browseHref: '/browse/electronics-accessories' as Href,
    sortOrder: 5,
  },

  // Home & Living (section)
  {
    id: 'home-living',
    parentId: null,
    label: 'Home & Living',
    icon: Home,
    leaf: false,
    attributeSchemaKey: 'home',
    sortOrder: 4,
  },
  {
    id: 'home-furniture',
    parentId: 'home-living',
    label: 'Furniture',
    icon: Sofa,
    leaf: true,
    attributeSchemaKey: 'home',
    browseHref: '/browse/home-furniture' as Href,
    legacySlugs: ['home'],
    sortOrder: 1,
  },
  {
    id: 'home-appliances',
    parentId: 'home-living',
    label: 'Home appliances',
    icon: UtensilsCrossed,
    leaf: true,
    attributeSchemaKey: 'home-appliances',
    browseHref: '/browse/home-appliances' as Href,
    sortOrder: 2,
  },
  {
    id: 'home-decor',
    parentId: 'home-living',
    label: 'Decor',
    icon: LayoutGrid,
    leaf: true,
    attributeSchemaKey: 'home-decor',
    browseHref: '/browse/home-decor' as Href,
    sortOrder: 3,
  },
  {
    id: 'home-kitchen',
    parentId: 'home-living',
    label: 'Kitchen',
    icon: UtensilsCrossed,
    leaf: true,
    attributeSchemaKey: 'home-kitchen',
    browseHref: '/browse/home-kitchen' as Href,
    sortOrder: 4,
  },

  // Clothes (section)
  {
    id: 'fashion',
    parentId: null,
    label: 'Clothes',
    icon: Shirt,
    leaf: false,
    attributeSchemaKey: 'clothing',
    sortOrder: 5,
  },
  {
    id: 'clothing-men',
    parentId: 'fashion',
    label: "Men's clothing",
    icon: Shirt,
    leaf: true,
    attributeSchemaKey: 'clothing-men',
    browseHref: '/browse/clothing-men' as Href,
    sortOrder: 1,
  },
  {
    id: 'clothing-women',
    parentId: 'fashion',
    label: "Women's clothing",
    icon: Shirt,
    leaf: true,
    attributeSchemaKey: 'clothing-women',
    browseHref: '/browse/clothing-women' as Href,
    legacySlugs: ['clothing'],
    sortOrder: 2,
  },
  {
    id: 'clothing-kids',
    parentId: 'fashion',
    label: "Kids' clothing",
    icon: Shirt,
    leaf: true,
    attributeSchemaKey: 'clothing-kids',
    browseHref: '/browse/clothing-kids' as Href,
    sortOrder: 3,
  },
  {
    id: 'clothing-shoes',
    parentId: 'fashion',
    label: 'Shoes',
    icon: Shirt,
    leaf: true,
    attributeSchemaKey: 'clothing-shoes',
    browseHref: '/browse/clothing-shoes' as Href,
    sortOrder: 4,
  },

  // Services (root leaf)
  {
    id: 'services',
    parentId: null,
    label: 'Services',
    icon: HandHelping,
    leaf: true,
    attributeSchemaKey: 'services',
    browseHref: '/browse/services' as Href,
    legacySlugs: ['services'],
    sortOrder: 6,
  },

  // Jobs (root leaf)
  {
    id: 'jobs',
    parentId: null,
    label: 'Jobs',
    icon: Briefcase,
    leaf: true,
    attributeSchemaKey: 'jobs',
    browseHref: '/browse/jobs' as Href,
    legacySlugs: ['jobs'],
    sortOrder: 7,
  },

  // Games & Hobbies (section)
  {
    id: 'games-hobbies',
    parentId: null,
    label: 'Games & Hobbies',
    icon: Gamepad2,
    leaf: false,
    attributeSchemaKey: 'games',
    sortOrder: 8,
  },
  {
    id: 'games-video',
    parentId: 'games-hobbies',
    label: 'Video games',
    icon: Gamepad2,
    leaf: true,
    attributeSchemaKey: 'games',
    browseHref: '/browse/games-video' as Href,
    legacySlugs: ['games'],
    sortOrder: 1,
  },
  {
    id: 'games-board',
    parentId: 'games-hobbies',
    label: 'Board games',
    icon: Gamepad2,
    leaf: true,
    attributeSchemaKey: 'games-board',
    browseHref: '/browse/games-board' as Href,
    sortOrder: 2,
  },
  {
    id: 'hobbies-sports',
    parentId: 'games-hobbies',
    label: 'Sports',
    icon: Trophy,
    leaf: true,
    attributeSchemaKey: 'hobbies-sports',
    browseHref: '/browse/hobbies-sports' as Href,
    sortOrder: 3,
  },
  {
    id: 'hobbies-music',
    parentId: 'games-hobbies',
    label: 'Music',
    icon: Music,
    leaf: true,
    attributeSchemaKey: 'hobbies-music',
    browseHref: '/browse/hobbies-music' as Href,
    sortOrder: 4,
  },

  // Marketplace catch-all (virtual, for search)
  {
    id: 'marketplace',
    parentId: null,
    label: 'Marketplace',
    icon: Store,
    leaf: true,
    attributeSchemaKey: 'default',
    browseHref: '/marketplace/categories' as Href,
    legacySlugs: ['marketplace', 'more'],
    sortOrder: 99,
  },
];

const NODE_BY_ID = new Map(CATEGORY_NODES.map((node) => [node.id, node]));

const LEGACY_SLUG_MAP = new Map<string, string>();
for (const node of CATEGORY_NODES) {
  LEGACY_SLUG_MAP.set(node.id, node.id);
  for (const legacy of node.legacySlugs ?? []) {
    LEGACY_SLUG_MAP.set(legacy, node.id);
  }
}

/** Home screen hub tiles (4). */
export const HOME_HUB_CATEGORY_IDS = [
  'transport',
  'real-estate',
  'services',
  'marketplace',
] as const;

/** Sections browsable inside Marketplace (not on home hub). */
export const MARKETPLACE_SECTION_IDS = [
  'electronics',
  'home-living',
  'fashion',
  'jobs',
  'games-hobbies',
] as const;

function sortByOrder(nodes: CategoryNode[]): CategoryNode[] {
  return [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Home hub: Transport, Real Estate, Services, Marketplace. */
export function getHomeHubCategories(): CategoryNode[] {
  return sortByOrder(
    HOME_HUB_CATEGORY_IDS.map((id) => NODE_BY_ID.get(id)).filter(
      (node): node is CategoryNode => node != null
    )
  );
}

/** Marketplace category picker / shortcuts (goods & hobbies). */
export function getMarketplaceSectionCategories(): CategoryNode[] {
  return sortByOrder(
    MARKETPLACE_SECTION_IDS.map((id) => NODE_BY_ID.get(id)).filter(
      (node): node is CategoryNode => node != null
    )
  );
}

/** All top-level sections except virtual marketplace slug (publish picker). */
export function getRootCategories(): CategoryNode[] {
  return CATEGORY_NODES.filter(
    (node) => node.parentId === null && node.id !== 'marketplace'
  ).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** @deprecated Use getHomeHubCategories(). */
export function getHubCategories(): CategoryNode[] {
  return getHomeHubCategories();
}

export function getChildCategories(parentId: string): CategoryNode[] {
  return CATEGORY_NODES.filter((node) => node.parentId === parentId).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getLeafCategories(): CategoryNode[] {
  return CATEGORY_NODES.filter((node) => node.leaf && node.id !== 'marketplace').sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getCategoryNode(id: string | null | undefined): CategoryNode | undefined {
  if (!id) return undefined;
  const normalized = normalizeCategoryId(id);
  if (!normalized) return undefined;
  return NODE_BY_ID.get(normalized);
}

export function getCategoryPath(leafId: string): CategoryNode[] {
  const normalized = normalizeCategoryId(leafId);
  if (!normalized) return [];

  const path: CategoryNode[] = [];
  let current = NODE_BY_ID.get(normalized);

  while (current) {
    path.unshift(current);
    current = current.parentId ? NODE_BY_ID.get(current.parentId) : undefined;
  }

  return path;
}

export function getCategoryBreadcrumb(leafId: string): string {
  const path = getCategoryPath(leafId);
  if (path.length === 0) return 'Browse';
  return path.map((node) => node.label).join(' › ');
}

export function getCategoryLabel(categoryId: string | null | undefined): string {
  if (!categoryId) return 'All listings';
  if (categoryId === 'scooters') return 'Scooters';
  const node = getCategoryNode(categoryId);
  return node?.label ?? 'All listings';
}

export function getAttributeSchemaKey(categoryId: string | null | undefined): string {
  const node = getCategoryNode(categoryId);
  if (node) return node.attributeSchemaKey;
  return 'default';
}

export function normalizeCategoryId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === 'scooters') return 'scooters';

  const mapped = LEGACY_SLUG_MAP.get(value);
  if (mapped) return mapped;

  const lower = value.toLowerCase();
  for (const [legacy, id] of LEGACY_SLUG_MAP.entries()) {
    if (legacy.toLowerCase() === lower) return id;
  }

  if (NODE_BY_ID.has(value)) return value;
  return null;
}

export function isLeafCategoryId(slug: string): boolean {
  const normalized = normalizeCategoryId(slug);
  if (!normalized) return false;
  const node = NODE_BY_ID.get(normalized);
  return node?.leaf === true;
}

export function isBrowseableCategorySlug(slug: string): boolean {
  const normalized = normalizeCategoryId(slug);
  if (!normalized) return false;
  const node = NODE_BY_ID.get(normalized);
  return node?.leaf === true && normalized !== 'marketplace';
}

export const LISTING_BROWSE_SLUGS = CATEGORY_NODES.filter(
  (node) => node.leaf && node.id !== 'marketplace' && node.browseHref
).map((node) => node.id);

export type ListingBrowseSlug = (typeof LISTING_BROWSE_SLUGS)[number];

export function isListingBrowseSlug(slug: string): slug is ListingBrowseSlug {
  return isBrowseableCategorySlug(slug);
}

export function getBrowseTitle(slug: string): string {
  return getCategoryLabel(slug);
}

/** Transport hub subcategories including rental links. */
export interface TransportHubItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Href;
  comingSoon?: boolean;
}

export function getTransportHubItems(): TransportHubItem[] {
  const buyItems = getChildCategories('transport').map((node) => ({
    id: node.id,
    label: node.label,
    icon: node.icon,
    href: node.browseHref,
  }));

  return [
    ...buyItems,
    { id: 'moto-rent', label: 'Rent motorcycle', icon: Bike, href: '/search' as Href },
    { id: 'auto-rent', label: 'Rent car', icon: Car, comingSoon: true },
  ];
}

/** Demo listing ID → leaf category for offline catalog. */
export const DEMO_LISTING_CATEGORIES: Record<string, string> = {
  'a0000000-0000-4000-8000-000000000001': 'electronics-phones',
  'a0000000-0000-4000-8000-000000000002': 'clothing-shoes',
  'a0000000-0000-4000-8000-000000000003': 'home-furniture',
  'a0000000-0000-4000-8000-000000000004': 'games-video',
  'a0000000-0000-4000-8000-000000000005': 'electronics-phones',
  'a0000000-0000-4000-8000-000000000006': 'clothing-men',
};

export function resolveListingCategoryId(
  listingId: string,
  category: string | null | undefined
): string {
  return normalizeCategoryId(category) ?? DEMO_LISTING_CATEGORIES[listingId] ?? 'marketplace';
}

export { CATEGORY_NODES };
