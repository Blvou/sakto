import { Redirect, type Href } from 'expo-router';

export default function FavoritesRedirect() {
  return <Redirect href={'/(tabs)/favorites' as Href} />;
}
