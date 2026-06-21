import { resolveListingCategoryId } from '@/src/features/listings/constants/categories';
import type { ListingCardItem, ListingRow } from '@/src/features/listings/types';
import { formatTimeAgo } from '@/src/features/listings/utils/format-time-ago';
import { resolveListingImage } from '@/src/features/listings/utils/listing-images';
import { getClientStorage } from '@/src/lib/storage';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

const MOCK_FAVORITES_KEY = 'user_favorites_mock';

type FavoriteJoinRow = {
  listing_id: string;
  created_at: string;
  listings: ListingRow;
};

function toCardItem(row: ListingRow): ListingCardItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location ?? 'Philippines',
    timeAgo: formatTimeAgo(row.created_at),
    image: resolveListingImage(row.id, row.image_url),
    category: resolveListingCategoryId(row.id, row.category),
    liked: true,
  };
}

async function readMockFavoriteIds(): Promise<string[]> {
  const storage = getClientStorage();
  const raw = await storage.getItem(MOCK_FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

async function writeMockFavoriteIds(ids: string[]): Promise<void> {
  const storage = getClientStorage();
  await storage.setItem(MOCK_FAVORITES_KEY, JSON.stringify(ids));
}

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return readMockFavoriteIds();
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('listing_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.listing_id);
}

export async function fetchUserFavorites(userId: string): Promise<ListingCardItem[]> {
  if (!isSupabaseConfigured) {
    const ids = await readMockFavoriteIds();
    if (!ids.length) return [];

    const { DEMO_LISTINGS } = await import('@/src/features/listings/api/listings');
    return DEMO_LISTINGS.filter((listing) => ids.includes(listing.id)).map((listing, index) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      timeAgo: `${index + 1}h ago`,
      image: resolveListingImage(listing.id, null),
      category: resolveListingCategoryId(listing.id, null),
      liked: true,
    }));
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select(
      `
      listing_id,
      created_at,
      listings!inner (
        id,
        seller_id,
        title,
        price,
        image_url,
        location,
        created_at,
        status,
        category
      )
    `
    )
    .eq('user_id', userId)
    .eq('listings.status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as FavoriteJoinRow[]).map((row) => toCardItem(row.listings));
}

export async function addFavorite(userId: string, listingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const ids = await readMockFavoriteIds();
    if (!ids.includes(listingId)) {
      await writeMockFavoriteIds([listingId, ...ids]);
    }
    return;
  }

  const { error } = await supabase.from('user_favorites').insert({
    user_id: userId,
    listing_id: listingId,
  });

  if (error && error.code !== '23505') throw error;
}

export async function removeFavorite(userId: string, listingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const ids = await readMockFavoriteIds();
    await writeMockFavoriteIds(ids.filter((id) => id !== listingId));
    return;
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  if (error) throw error;
}

export async function toggleFavorite(
  userId: string,
  listingId: string,
  isFavorite: boolean
): Promise<boolean> {
  if (isFavorite) {
    await removeFavorite(userId, listingId);
    return false;
  }
  await addFavorite(userId, listingId);
  return true;
}
