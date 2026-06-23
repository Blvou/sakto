import type { ListingCardItem } from '@/src/features/listings/types';
import { getClientStorage } from '@/src/lib/storage';
import { addFavorite } from '../api/favorites';

const GUEST_FAVORITES_KEY = 'guest_favorites_v1';

async function readGuestFavoritesRaw(): Promise<ListingCardItem[]> {
  const storage = getClientStorage();
  const raw = await storage.getItem(GUEST_FAVORITES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ListingCardItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ListingCardItem).id === 'string' &&
        typeof (item as ListingCardItem).title === 'string' &&
        typeof (item as ListingCardItem).price === 'number'
    );
  } catch {
    return [];
  }
}

async function writeGuestFavoritesRaw(items: ListingCardItem[]): Promise<void> {
  const storage = getClientStorage();
  await storage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(items));
}

export async function fetchGuestFavoriteIds(): Promise<string[]> {
  const items = await readGuestFavoritesRaw();
  return items.map((item) => item.id);
}

export async function fetchGuestFavorites(): Promise<ListingCardItem[]> {
  const items = await readGuestFavoritesRaw();
  return items.map((item) => ({ ...item, liked: true }));
}

export async function addGuestFavorite(listing: ListingCardItem): Promise<void> {
  const items = await readGuestFavoritesRaw();
  const next = [{ ...listing, liked: true }, ...items.filter((item) => item.id !== listing.id)];
  await writeGuestFavoritesRaw(next);
}

export async function removeGuestFavorite(listingId: string): Promise<void> {
  const items = await readGuestFavoritesRaw();
  await writeGuestFavoritesRaw(items.filter((item) => item.id !== listingId));
}

export async function toggleGuestFavorite(
  listingId: string,
  isFavorite: boolean,
  listing?: ListingCardItem
): Promise<boolean> {
  if (isFavorite) {
    await removeGuestFavorite(listingId);
    return false;
  }
  if (!listing) throw new Error('Listing data required to save favorite');
  await addGuestFavorite(listing);
  return true;
}

export async function clearGuestFavorites(): Promise<void> {
  const storage = getClientStorage();
  await storage.removeItem(GUEST_FAVORITES_KEY);
}

export async function mergeGuestFavoritesIntoAccount(userId: string): Promise<void> {
  const items = await readGuestFavoritesRaw();
  if (!items.length) return;

  await Promise.all(items.map((item) => addFavorite(userId, item.id)));
  await clearGuestFavorites();
}
