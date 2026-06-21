import type { Href } from 'expo-router';
import { FavoritesTabContent } from '@/src/features/favorites/components/FavoritesTabContent';

export default function FavoritesTabScreen() {
  return <FavoritesTabContent returnTo={'/(tabs)/favorites' as Href} />;
}
