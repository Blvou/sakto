import { memo } from 'react';
import { TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';

interface ListingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Tighter spacing when nested inside MarketplaceBrowseToolbar. */
  variant?: 'default' | 'embedded';
}

export const ListingSearchBar = memo(function ListingSearchBar({
  value,
  onChangeText,
  placeholder = 'Search listings...',
  variant = 'default',
}: ListingSearchBarProps) {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsive();
  const searchCardStyle = useCardStyle({ borderRadius: 24 });
  const isEmbedded = variant === 'embedded';

  return (
    <View
      style={{
        paddingHorizontal: horizontalPadding,
        paddingTop: isEmbedded ? 12 : 0,
        paddingBottom: isEmbedded ? 10 : 12,
        backgroundColor: isEmbedded ? 'transparent' : colors.background,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 48,
          paddingHorizontal: 16,
          ...searchCardStyle,
        }}
      >
        <Search color={colors.textSecondary} size={20} strokeWidth={1.5} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityRole="search"
          accessibilityLabel="Search listings"
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 14,
            fontFamily: 'PlusJakartaSans_400Regular',
            color: colors.textPrimary,
            minWidth: 0,
          }}
        />
      </View>
    </View>
  );
});
