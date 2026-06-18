import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Bike,
  CalendarDays,
  MapPin,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';
import type { Category, CategoryIconName } from '../data/mock-data';

const CATEGORY_ICONS: Record<CategoryIconName, LucideIcon> = {
  'map-pin': MapPin,
  zap: Zap,
  bike: Bike,
  'calendar-days': CalendarDays,
  'trending-up': TrendingUp,
};

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId?: string | null;
  onCategoryPress?: (category: Category) => void;
}

export function CategoryGrid({
  categories,
  selectedCategoryId,
  onCategoryPress,
}: CategoryGridProps) {
  const { colors } = useTheme();
  const { horizontalPadding, scale } = useResponsive();
  const itemWidth = scale(72);
  const circleSize = scale(56);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -horizontalPadding }}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        gap: scale(12),
        paddingVertical: 8,
        alignItems: 'center',
      }}
    >
      {categories.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.icon];
        const isSelected = selectedCategoryId === cat.id;

        return (
          <Pressable
            key={cat.id}
            onPress={() => onCategoryPress?.(cat)}
            style={{ alignItems: 'center', justifyContent: 'center', width: itemWidth }}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
            accessibilityState={{ selected: isSelected }}
          >
            <View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                backgroundColor: isSelected ? `${colors.primary}18` : colors.surface,
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.border,
              }}
            >
              <Icon
                color={isSelected ? colors.primary : colors.textSecondary}
                size={scale(22)}
                strokeWidth={isSelected ? 2.25 : 1.75}
              />
            </View>
            <Text
              style={{
                ...typography.caption,
                color: isSelected ? colors.primary : colors.textPrimary,
                fontFamily: isSelected ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
                marginTop: 6,
                textAlign: 'center',
                width: itemWidth,
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
