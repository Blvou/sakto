import { memo, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Chip } from '@/src/design-system/components/Chip';
import { typography } from '@/src/design-system/tokens';
import { getMarketplaceSectionCategories, type CategoryNode } from '@/src/features/listings/constants/category-tree';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface CategoryShortcutBarProps {
  selectedId?: string | null;
}

function sectionHref(node: CategoryNode): Href {
  if (node.leaf && node.browseHref) return node.browseHref;
  return `/marketplace/categories?section=${node.id}` as Href;
}

export const CategoryShortcutBar = memo(function CategoryShortcutBar({
  selectedId,
}: CategoryShortcutBarProps) {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();
  const router = useRouter();
  const sections = getMarketplaceSectionCategories();

  const handlePress = useCallback(
    (node: CategoryNode) => {
      router.push(sectionHref(node));
    },
    [router]
  );

  const handleSeeAll = useCallback(() => {
    router.push('/marketplace/categories' as Href);
  }, [router]);

  return (
    <View style={{ paddingBottom: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: horizontalPadding,
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            ...typography.caption,
            color: colors.textSecondary,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          Categories
        </Text>
        <Pressable
          onPress={handleSeeAll}
          accessibilityRole="button"
          accessibilityLabel="See all categories"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 }}
        >
          <Text style={{ ...typography.caption, color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
            See all
          </Text>
          <ChevronRight color={colors.primary} size={14} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: horizontalPadding, paddingBottom: 10 }}>
          {sections.map((section) => (
            <Chip
              key={section.id}
              label={section.label}
              active={selectedId === section.id}
              onPress={() => handlePress(section)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
});
