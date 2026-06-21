import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { getTabBarHeight } from '@/src/hooks/use-responsive';
import { typography } from '@/src/design-system/tokens';

interface PostListingBarProps {
  onPress: () => void;
  label?: string;
}

export function PostListingBar({ onPress, label = 'Post listing' }: PostListingBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: tabBarHeight,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          minHeight: 52,
          borderRadius: 14,
          backgroundColor: colors.textPrimary,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={{
            ...typography.h3,
            color: colors.background,
            fontFamily: 'PlusJakartaSans_600SemiBold',
          }}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
