import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Car } from 'lucide-react-native';
import { ScreenHeader } from '@/src/design-system/components/ScreenHeader';
import { typography } from '@/src/design-system/tokens';
import { TRANSPORT_SUBCATEGORIES } from '@/src/features/home/data/hub-categories';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';

export default function TransportHubScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { horizontalPadding, scale } = useResponsive();
  const cardStyle = useCardStyle({ borderRadius: 16 });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubcategoryPress = useCallback(
    (href: Href | undefined, comingSoon?: boolean) => {
      if (comingSoon || !href) return;
      router.push(href);
    },
    [router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Transport" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 12,
        }}
      >
        {TRANSPORT_SUBCATEGORIES.map((item) => {
          const Icon = item.icon;
          const disabled = item.comingSoon;

          return (
            <Pressable
              key={item.id}
              disabled={disabled}
              onPress={() => handleSubcategoryPress(item.href, item.comingSoon)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                minHeight: 72,
                opacity: disabled ? 0.55 : 1,
                ...cardStyle,
              }}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ disabled }}
            >
              <View
                style={{
                  width: scale(48),
                  height: scale(48),
                  borderRadius: scale(24),
                  backgroundColor: `${colors.primary}12`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Icon color={colors.primary} size={scale(24)} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.h3, color: colors.textPrimary }}>{item.label}</Text>
                {disabled ? (
                  <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                    Coming soon
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
