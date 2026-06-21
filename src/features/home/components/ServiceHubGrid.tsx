import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';
import { HUB_CATEGORIES } from '../data/hub-categories';

export const ServiceHubGrid = memo(function ServiceHubGrid() {
  const { colors } = useTheme();
  const { horizontalPadding, scale } = useResponsive();
  const router = useRouter();
  const gap = scale(12);
  const tileHeight = scale(108);

  const handlePress = useCallback(
    (href: Href) => {
      router.push(href);
    },
    [router]
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        marginTop: 8,
        marginBottom: 24,
      }}
    >
      {HUB_CATEGORIES.map((category) => {
        const Icon = category.icon;

        return (
          <Pressable
            key={category.id}
            onPress={() => handlePress(category.href)}
            style={{
              width: '48%',
              flexGrow: 1,
              flexBasis: '46%',
              minHeight: tileHeight,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: horizontalPadding > 16 ? 12 : 10,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={category.label}
          >
            <View
              style={{
                width: scale(52),
                height: scale(52),
                borderRadius: scale(26),
                backgroundColor: `${colors.primary}12`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon color={colors.primary} size={scale(26)} strokeWidth={1.75} />
            </View>
            <Text
              style={{
                ...typography.body,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                color: colors.textPrimary,
                textAlign: 'center',
              }}
              numberOfLines={2}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
