import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Pencil } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useCardStyle } from '@/src/design-system/use-card-style';
import { typography } from '@/src/design-system/tokens';
import { formatPrice } from '@/src/features/home/data/mock-data';
import { getCategoryLabel } from '../constants/categories';
import type { MyListingItem } from '../types';

interface MyListingRowProps {
  listing: MyListingItem;
  onPress: (id: string) => void;
  onEditPress: (id: string) => void;
}

function statusLabel(status: MyListingItem['status']): string {
  if (status === 'sold') return 'Sold';
  if (status === 'archived') return 'Archived';
  return 'Active';
}

export const MyListingRow = memo(function MyListingRow({
  listing,
  onPress,
  onEditPress,
}: MyListingRowProps) {
  const { colors } = useTheme();
  const cardStyle = useCardStyle({ borderRadius: 12 });
  const isRemoteImage = typeof listing.image === 'object' && 'uri' in listing.image;

  return (
    <Pressable
      onPress={() => onPress(listing.id)}
      style={{
        flexDirection: 'row',
        padding: 12,
        marginBottom: 12,
        gap: 12,
        ...cardStyle,
      }}
    >
      <Image
        source={listing.image}
        style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: colors.border }}
        contentFit="cover"
        cachePolicy={isRemoteImage ? 'memory-disk' : undefined}
        accessibilityLabel={listing.title}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            ...typography.body,
            color: colors.textPrimary,
            fontFamily: 'PlusJakartaSans_600SemiBold',
          }}
          numberOfLines={2}
        >
          {listing.title}
        </Text>
        <Text style={{ ...typography.priceSm, color: colors.primary, marginTop: 4 }}>
          {formatPrice(listing.price)}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 4 }} numberOfLines={1}>
          {getCategoryLabel(listing.category)} · {statusLabel(listing.status)}
        </Text>
      </View>
      <Pressable
        onPress={() => onEditPress(listing.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Edit listing"
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Pencil color={colors.textSecondary} size={18} strokeWidth={1.75} />
      </Pressable>
    </Pressable>
  );
});
