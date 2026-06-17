import { View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Skeleton } from '@/src/design-system/components/Skeleton';

export function MessagesAreaSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
      <View style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
        <Skeleton width={180} height={56} borderRadius={16} />
      </View>
      <View style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
        <Skeleton width={140} height={44} borderRadius={16} />
      </View>
      <View style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
        <Skeleton width={220} height={72} borderRadius={16} />
      </View>
      <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>
        Loading messages…
      </Text>
    </View>
  );
}
