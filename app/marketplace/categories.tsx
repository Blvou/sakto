import { useCallback } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { CategoryPicker } from '@/src/features/listings/components/CategoryPicker';
import type { CategoryNode } from '@/src/features/listings/constants/category-tree';
import { useTheme } from '@/src/hooks/use-theme';

type CategoryPickerMode = 'browse' | 'publish';

export default function MarketplaceCategoriesScreen() {
  const { section, mode, returnTo } = useLocalSearchParams<{
    section?: string;
    mode?: CategoryPickerMode;
    returnTo?: string;
  }>();
  const { colors } = useTheme();
  const router = useRouter();

  const pickerMode: CategoryPickerMode = mode === 'publish' ? 'publish' : 'browse';

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const handleSelect = useCallback(
    (node: CategoryNode) => {
      if (pickerMode === 'publish') {
        const href =
          (returnTo as Href | undefined) ??
          (`/publish/listing?category=${encodeURIComponent(node.id)}` as Href);
        if (returnTo) {
          router.replace(href);
        } else {
          router.push(href);
        }
        return;
      }

      if (node.leaf && node.browseHref) {
        router.push(node.browseHref);
        return;
      }

      if (!node.leaf) {
        router.push(`/marketplace/categories?section=${node.id}` as Href);
      }
    },
    [pickerMode, returnTo, router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={pickerMode === 'publish' ? 'Choose category' : 'Categories'}
        onBack={handleBack}
      />
      <CategoryPicker
        initialSectionId={typeof section === 'string' ? section : null}
        onSelect={handleSelect}
      />
    </View>
  );
}
