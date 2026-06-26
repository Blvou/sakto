import { resolveListingCategoryId } from '@/src/features/listings/constants/categories';
import { syncListingMedia } from '@/src/features/listings/api/listing-photos';
import { sanitizeListingAttributes } from '@/src/features/listings/utils/sanitize-attributes';
import { supabase } from '@/src/lib/supabase';
import { getClientStorage } from '@/src/lib/storage';
import type { CreateListingInput, UpdateListingInput } from '../schemas';
import type {
  ListingCardItem,
  ListingDetail,
  ListingRow,
  ListingsPage,
  ListingsPageCursor,
  MyListingItem,
} from '../types';
import { LISTINGS_PAGE_SIZE } from '../types';
import {
  applyListingDiscovery,
  DEFAULT_LISTING_SORT,
  type ListingSearchParams,
  type ListingSortOption,
  sanitizeListingSearchTerm,
} from '../utils/listing-filters';
import { formatTimeAgo } from '../utils/format-time-ago';
import { resolveListingImage } from '../utils/listing-images';

const DEMO_SEEDED_KEY = 'demo_listings_seeded';

export const DEMO_LISTINGS = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    title: 'iPhone 13 Pro 128GB — Space Gray',
    price: 25000,
    location: 'Makati',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    title: 'Nike Air Max 90 — Size 42',
    price: 3500,
    location: 'Quezon City',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    title: 'IKEA Kallax Shelf — White',
    price: 4500,
    location: 'Pasig',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    title: 'PS5 DualSense Controller',
    price: 2200,
    location: 'Manila',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    title: 'Samsung Galaxy A54 5G',
    price: 12000,
    location: 'Taguig',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    title: 'Vintage Denim Jacket — M',
    price: 800,
    location: 'Cebu City',
  },
] as const;

/** Demo view counts for offline catalog smoke tests. */
export const DEMO_LISTING_VIEW_COUNTS: Record<string, number> = {
  'a0000000-0000-4000-8000-000000000001': 128,
  'a0000000-0000-4000-8000-000000000002': 45,
  'a0000000-0000-4000-8000-000000000003': 67,
  'a0000000-0000-4000-8000-000000000004': 89,
  'a0000000-0000-4000-8000-000000000005': 156,
  'a0000000-0000-4000-8000-000000000006': 23,
};

function toCardItem(row: ListingRow, badge?: ListingCardItem['badge']): ListingCardItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location ?? 'Philippines',
    timeAgo: formatTimeAgo(row.created_at),
    image: resolveListingImage(row.id, row.image_url),
    category: resolveListingCategoryId(row.id, row.category),
    viewCount: row.view_count ?? DEMO_LISTING_VIEW_COUNTS[row.id] ?? 0,
    badge,
  };
}

function mockToCardItems(): ListingCardItem[] {
  return DEMO_LISTINGS.map((listing, index) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    timeAgo: `${index + 1}h ago`,
    image: resolveListingImage(listing.id, null),
    category: resolveListingCategoryId(listing.id, null),
    viewCount: DEMO_LISTING_VIEW_COUNTS[listing.id] ?? 0,
  }));
}

type ListingsQueryBuilder = {
  order: (
    column: string,
    options?: { ascending?: boolean }
  ) => ListingsQueryBuilder;
  or: (filters: string) => ListingsQueryBuilder;
  eq: (column: string, value: string | number) => ListingsQueryBuilder;
  gte: (column: string, value: number) => ListingsQueryBuilder;
  lte: (column: string, value: number) => ListingsQueryBuilder;
  limit: (count: number) => ListingsQueryBuilder;
};

function applySortToQuery(query: ListingsQueryBuilder, sort: ListingSortOption) {
  switch (sort) {
    case 'price_asc':
      return query.order('price', { ascending: true }).order('id', { ascending: true });
    case 'price_desc':
      return query.order('price', { ascending: false }).order('id', { ascending: false });
    case 'most_viewed':
      return query
        .order('view_count', { ascending: false })
        .order('id', { ascending: false });
    case 'newest':
    default:
      return query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }
}

function applyCursorToQuery(
  query: ListingsQueryBuilder,
  cursor: ListingsPageCursor,
  sort: ListingSortOption
) {
  switch (sort) {
    case 'price_asc':
      return query.or(
        `price.gt.${cursor.price},and(price.eq.${cursor.price},id.gt.${cursor.id})`
      );
    case 'price_desc':
      return query.or(
        `price.lt.${cursor.price},and(price.eq.${cursor.price},id.lt.${cursor.id})`
      );
    case 'most_viewed':
      return query.or(
        `view_count.lt.${cursor.view_count},and(view_count.eq.${cursor.view_count},id.lt.${cursor.id})`
      );
    case 'newest':
    default:
      return query.or(
        `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
      );
  }
}

function buildCursorFromRow(row: ListingRow, sort: ListingSortOption): ListingsPageCursor {
  return {
    sort,
    id: row.id,
    created_at: row.created_at,
    price: row.price,
    view_count: row.view_count ?? 0,
  };
}

export async function fetchListingsPage(
  cursor?: ListingsPageCursor,
  limit = LISTINGS_PAGE_SIZE,
  params: ListingSearchParams = {}
): Promise<ListingsPage> {
  const sort = params.sort ?? DEFAULT_LISTING_SORT;
  const category = params.category;

  let query = supabase
    .from('listings')
    .select(
      'id, seller_id, title, price, image_url, location, created_at, status, category, view_count, attributes'
    )
    .eq('status', 'active')
    .limit(limit);

  query = applySortToQuery(query as unknown as ListingsQueryBuilder, sort) as typeof query;

  if (category) {
    query = query.eq('category', category);
  }

  const term = params.query ? sanitizeListingSearchTerm(params.query) : '';
  if (term) {
    query = query.or(`title.ilike.%${term}%,location.ilike.%${term}%`);
  }

  if (params.priceMin != null) {
    query = query.gte('price', params.priceMin);
  }
  if (params.priceMax != null) {
    query = query.lte('price', params.priceMax);
  }

  if (params.attributeFilters) {
    for (const [key, value] of Object.entries(params.attributeFilters)) {
      query = query.eq(`attributes->>${key}`, value);
    }
  }

  if (cursor && cursor.sort === sort) {
    query = applyCursorToQuery(query as unknown as ListingsQueryBuilder, cursor, sort) as typeof query;
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data?.length) {
    return { items: [], nextCursor: undefined };
  }

  const rows = data as ListingRow[];
  const items = rows.map((row) => toCardItem(row));
  const last = rows[rows.length - 1];

  return {
    items,
    nextCursor:
      rows.length === limit && last ? buildCursorFromRow(last, sort) : undefined,
  };
}

export function fetchMockListingsPage(params: ListingSearchParams = {}): ListingsPage {
  const items = applyListingDiscovery(mockToCardItems(), params);
  return { items, nextCursor: undefined };
}

/** @deprecated Use fetchListingsPage for paginated catalog loads. */
export async function fetchListings(): Promise<ListingCardItem[]> {
  const page = await fetchListingsPage();
  return page.items;
}

export async function fetchListingById(id: string): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      seller_id,
      title,
      price,
      image_url,
      location,
      description,
      category,
      status,
      attributes,
      view_count,
      created_at,
      seller:profiles!seller_id ( id, display_name, avatar_url ),
      listing_media ( id, url, sort_order )
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type MediaRow = { id: string; url: string; sort_order: number };
  type Row = ListingRow & {
    seller: { id: string; display_name: string; avatar_url: string | null };
    listing_media: MediaRow[] | null;
  };

  const row = data as unknown as Row;
  const media = (row.listing_media ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      id: item.id,
      url: item.url,
      sort_order: item.sort_order,
    }));
  const media_urls = media.map((item) => item.url);

  return {
    id: row.id,
    seller_id: row.seller_id,
    title: row.title,
    price: row.price,
    image_url: row.image_url,
    location: row.location,
    description: row.description,
    category: row.category,
    status: row.status,
    attributes: row.attributes ?? {},
    view_count: row.view_count ?? 0,
    created_at: row.created_at,
    seller: row.seller,
    media,
    media_urls,
  };
}

export async function createListing(
  sellerId: string,
  input: CreateListingInput,
  photoUrls: string[]
): Promise<string> {
  const coverUrl = photoUrls[0] ?? null;

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: sellerId,
      title: input.title,
      description: input.description,
      price: input.price,
      location: input.location,
      category: input.category ?? null,
      attributes: sanitizeListingAttributes(input.attributes, input.category),
      image_url: coverUrl,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) throw error;

  if (photoUrls.length > 0) {
    const { error: mediaError } = await supabase.from('listing_media').insert(
      photoUrls.map((url, sort_order) => ({
        listing_id: data.id,
        url,
        sort_order,
      }))
    );

    if (mediaError) throw mediaError;
  }

  return data.id;
}

export async function fetchListingStats(sellerId: string): Promise<{ total: number; sold: number }> {
  const [totalResult, soldResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', sellerId),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('status', 'sold'),
  ]);

  if (totalResult.error) throw totalResult.error;
  if (soldResult.error) throw soldResult.error;

  return {
    total: totalResult.count ?? 0,
    sold: soldResult.count ?? 0,
  };
}

export async function fetchListingsBySeller(sellerId: string): Promise<MyListingItem[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('id, seller_id, title, price, image_url, location, created_at, status, category, view_count')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data?.length) return [];

  return data.map((row) => ({
    ...toCardItem(row as ListingRow),
    status: (row.status ?? 'active') as MyListingItem['status'],
  }));
}

export async function updateListing(
  listingId: string,
  sellerId: string,
  input: UpdateListingInput,
  photoUrls: string[],
  previousPhotoUrls: string[] = []
): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({
      title: input.title,
      description: input.description,
      price: input.price,
      location: input.location,
      category: input.category ?? null,
      attributes: sanitizeListingAttributes(input.attributes, input.category),
      ...(input.status ? { status: input.status } : {}),
    })
    .eq('id', listingId)
    .eq('seller_id', sellerId);

  if (error) throw error;

  await syncListingMedia(listingId, sellerId, photoUrls, previousPhotoUrls);
}

export async function deleteListing(listingId: string, sellerId: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('seller_id', sellerId);

  if (error) throw error;
}

export async function seedDemoListingsIfNeeded(sellerId: string): Promise<void> {
  const storage = getClientStorage();
  if ((await storage.getItem(DEMO_SEEDED_KEY)) === '1') return;

  const { count, error: countError } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    await storage.setItem(DEMO_SEEDED_KEY, '1');
    return;
  }

  const rows = DEMO_LISTINGS.map((listing) => ({
    id: listing.id,
    seller_id: sellerId,
    title: listing.title,
    price: listing.price,
    location: listing.location,
    status: 'active' as const,
  }));

  const { error } = await supabase.from('listings').insert(rows);
  if (error) throw error;
  await storage.setItem(DEMO_SEEDED_KEY, '1');
}

export async function ensureListingForChat(
  listingId: string,
  buyerId: string
): Promise<{ id: string; seller_id: string }> {
  const { data: listing, error } = await supabase
    .from('listings')
    .select('id, seller_id')
    .eq('id', listingId)
    .maybeSingle();

  if (error) throw error;

  if (!listing) {
    throw new Error('Listing not found. It may have been removed.');
  }

  if (listing.seller_id === buyerId) {
    throw new Error('This is your listing. Use a buyer account to start a chat.');
  }

  return listing;
}

export { mockToCardItems };
