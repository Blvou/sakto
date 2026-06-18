import { View } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { Skeleton } from '@/src/design-system/components/Skeleton';
import { HomeHeader } from './HomeHeader';
import { SearchBar } from './SearchBar';

export function HomeSkeleton() {
  const { colors } = useTheme();
  const { contentWidth, scooterCardWidth, scale, horizontalPadding } = useResponsive();
  const bannerHeight = scale(140);
  const circleSize = scale(56);
  const scooterImageHeight = Math.round(scooterCardWidth * (120 / 180));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HomeHeader />
      <SearchBar />

      <View style={{ paddingHorizontal: horizontalPadding, marginTop: 8 }}>
        <Skeleton height={bannerHeight} borderRadius={16} width={contentWidth} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          <Skeleton width={16} height={6} borderRadius={3} />
          <Skeleton width={6} height={6} borderRadius={3} />
          <Skeleton width={6} height={6} borderRadius={3} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: horizontalPadding, gap: scale(16), marginTop: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <Skeleton width={circleSize} height={circleSize} borderRadius={circleSize / 2} />
            <Skeleton width={scale(48)} height={10} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: horizontalPadding, marginTop: 24 }}>
        <Skeleton width={scale(200)} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={scooterCardWidth} height={scooterImageHeight + scale(100)} borderRadius={12} />
          <Skeleton width={scooterCardWidth} height={scooterImageHeight + scale(100)} borderRadius={12} />
        </View>
      </View>

      <View style={{ paddingHorizontal: horizontalPadding, marginTop: 24 }}>
        <Skeleton width={scale(160)} height={18} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={scooterCardWidth} height={scooterImageHeight + scale(100)} borderRadius={12} />
          <Skeleton width={scooterCardWidth} height={scooterImageHeight + scale(100)} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}
