import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import { Category } from '../data/mock-data';

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
}

export function CategoryGrid({ categories, onCategoryPress }: CategoryGridProps) {
  const { colors } = useTheme();
  const { horizontalPadding, scale } = useResponsive();
  const circleCardStyle = useCardStyle({ borderRadius: 28 });
  const itemWidth = scale(64);
  const circleSize = scale(56);
  const emojiSize = scale(24);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -horizontalPadding }}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        gap: scale(16),
        paddingVertical: 8,
        alignItems: 'center',
      }}
    >
      {categories.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() => onCategoryPress?.(cat)}
          style={{ alignItems: 'center', justifyContent: 'center', width: itemWidth }}
          accessibilityRole="button"
          accessibilityLabel={cat.label}
        >
          <View
            style={[
              {
                width: circleSize,
                height: circleSize,
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              },
              cat.highlight
                ? {
                    borderRadius: circleSize / 2,
                    backgroundColor: '#FFF0E6',
                    borderWidth: 2,
                    borderColor: colors.secondary,
                  }
                : { ...circleCardStyle, borderRadius: circleSize / 2 },
            ]}
          >
            <Text style={{ fontSize: emojiSize, lineHeight: emojiSize + 4, textAlign: 'center' }}>{cat.emoji}</Text>
          </View>
          <Text
            style={{
              ...typography.caption,
              color: cat.highlight ? colors.secondary : colors.textPrimary,
              fontFamily: cat.highlight ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
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
      ))}
    </ScrollView>
  );
}
