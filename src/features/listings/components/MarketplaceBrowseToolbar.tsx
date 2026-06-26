import { View } from 'react-native';
import { ListingFilters, type ListingFilterState } from '@/src/features/listings/components/ListingFilters';
import { ListingSearchBar } from '@/src/features/listings/components/ListingSearchBar';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface MarketplaceBrowseToolbarProps {
  query: string;
  onQueryChange: (text: string) => void;
  searchPlaceholder: string;
  categoryId?: string | null;
  filterState: ListingFilterState;
  onFilterChange: (next: ListingFilterState) => void;
}

export function MarketplaceBrowseToolbar({
  query,
  onQueryChange,
  searchPlaceholder,
  categoryId,
  filterState,
  onFilterChange,
}: MarketplaceBrowseToolbarProps) {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();

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
      <ListingFilters
        categoryId={categoryId}
        value={filterState}
        onChange={onFilterChange}
        contentPadding={horizontalPadding}
      />
    </View>
  );
}
