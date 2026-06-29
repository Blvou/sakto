import { Text, View } from 'react-native';
import { getCategoryPath } from '@/src/features/listings/constants/category-tree';
import { typography } from '@/src/design-system/tokens';
import { useTheme } from '@/src/hooks/use-theme';

interface CategoryBreadcrumbProps {
  categoryId: string;
}

export function CategoryBreadcrumb({ categoryId }: CategoryBreadcrumbProps) {
  const { colors } = useTheme();
  const path = getCategoryPath(categoryId);

  if (path.length <= 1) return null;

  const label = path.map((node) => node.label).join(' › ');

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
      <Text
        style={{
          ...typography.caption,
          color: colors.textSecondary,
          fontFamily: 'PlusJakartaSans_500Medium',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
