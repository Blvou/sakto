import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';

const FILTERS = ['Nearby', 'Electric', 'Manual', 'By day'] as const;

interface VehicleFiltersProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  title?: string;
}

export function VehicleFilters({
  activeFilter = 'Nearby',
  onFilterChange,
  title = 'Popular near you',
}: VehicleFiltersProps) {
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();

  const filterControls = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {FILTERS.map((filter, i) => (
        <Pressable key={filter} onPress={() => onFilterChange?.(filter)} hitSlop={4}>
          <Text
            style={{
              ...typography.caption,
              color: activeFilter === filter ? colors.primary : colors.textSecondary,
              fontFamily:
                activeFilter === filter ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
            }}
          >
            {filter}
            {i < FILTERS.length - 1 ? '  |  ' : ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (isSmallScreen) {
    return (
      <View style={{ marginBottom: 12, gap: 8 }}>
        <Text style={{ ...typography.h3, color: colors.textPrimary }}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterControls}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
      }}
    >
      <Text style={{ ...typography.h3, color: colors.textPrimary, flexShrink: 1 }} numberOfLines={1}>
        {title}
      </Text>
      {filterControls}
    </View>
  );
}
