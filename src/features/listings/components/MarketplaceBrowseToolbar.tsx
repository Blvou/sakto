import { View, Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { ListingFilters, type ListingFilterState } from '@/src/features/listings/components/ListingFilters';
import { ListingSearchBar } from '@/src/features/listings/components/ListingSearchBar';
import { getCategoryLabel, getCategoryNode } from '@/src/features/listings/constants/category-tree';
import { typography } from '@/src/design-system/tokens';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface MarketplaceBrowseToolbarProps {
  query: string;
  onQueryChange: (text: string) => void;
  searchPlaceholder: string;
  categoryId?: string | null;
  filterState: ListingFilterState;
  onFilterChange: (next: ListingFilterState) => void;
  showCategoryPicker?: boolean;
}

export function MarketplaceBrowseToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  categoryId,
  filterState,
  onFilterChange,
  showCategoryPicker = true,
}: MarketplaceBrowseToolbarProps) {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();
  const router = useRouter();

  const categoryLabel = categoryId ? getCategoryLabel(categoryId) : 'All listings';

  const parentSectionId = categoryId ? getCategoryNode(categoryId)?.parentId : null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 12,
      }}
    >
      <ListingSearchBar
        variant="embedded"
        value={query}
        onChangeText={onQueryChange}
        placeholder={searchPlaceholder}
      />

      {showCategoryPicker ? (
        <Pressable
          onPress={() =>
            router.push(
              (parentSectionId
                ? `/marketplace/categories?section=${encodeURIComponent(parentSectionId)}`
                : '/marketplace/categories') as Href
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Change category"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginHorizontal: horizontalPadding,
            marginTop: 8,
            marginBottom: 4,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            gap: 6,
          }}
        >
          <Text
            style={{
              ...typography.caption,
              color: colors.textPrimary,
              fontFamily: 'PlusJakartaSans_600SemiBold',
            }}
          >
            {categoryLabel}
          </Text>
          <ChevronDown color={colors.textSecondary} size={16} strokeWidth={2} />
        </Pressable>
      ) : null}

      <ListingFilters
        categoryId={categoryId}
        value={filterState}
        onChange={onFilterChange}
        contentPadding={horizontalPadding}
      />
    </View>
  );
}
