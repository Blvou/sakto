import { Pressable, Text, TextInput, View } from 'react-native';
import { Camera, Search } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { Chip } from '@/src/design-system/components/Chip';

const QUICK_FILTERS = ['Nearby', 'Electric', 'Manual', 'By day'];

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onCameraPress?: () => void;
  activeFilter?: string;
  onFilterPress?: (filter: string) => void;
}

export function SearchBar({
  value = '',
  onChangeText,
  onCameraPress,
  activeFilter = 'Nearby',
  onFilterPress,
}: SearchBarProps) {
  const { colors } = useTheme();
  const { isSmallScreen } = useResponsive();
  const searchCardStyle = useCardStyle({ borderRadius: 24 });

  return (
    <View style={{ paddingBottom: 12, backgroundColor: colors.background }}>
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
          placeholder={isSmallScreen ? 'Search bikes...' : 'Search bikes near you...'}
          placeholderTextColor={colors.textSecondary}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 14,
            fontFamily: 'PlusJakartaSans_400Regular',
            color: colors.textPrimary,
            minWidth: 0,
          }}
        />
        <Pressable
          onPress={onCameraPress}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 }}
          accessibilityRole="button"
          accessibilityLabel="Search by photo"
        >
          <Camera color={colors.primary} size={22} strokeWidth={1.5} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {QUICK_FILTERS.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onPress={() => onFilterPress?.(filter)}
          />
        ))}
      </View>
    </View>
  );
}
