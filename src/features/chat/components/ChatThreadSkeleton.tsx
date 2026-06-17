import { View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Skeleton } from '@/src/design-system/components/Skeleton';

export function ChatThreadSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="50%" height={16} />
          <Skeleton width="35%" height={12} />
        </View>
      </View>

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
        <View style={{ alignSelf: 'flex-end', maxWidth: '70%' }}>
          <Skeleton width={160} height={48} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}
