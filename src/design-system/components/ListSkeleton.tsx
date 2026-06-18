import { View } from 'react-native';
import { Skeleton } from '@/src/design-system/components/Skeleton';

interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
  gap?: number;
}

export function ListSkeleton({ count = 4, itemHeight = 88, gap = 12 }: ListSkeletonProps) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} height={itemHeight} borderRadius={16} />
      ))}
    </View>
  );
}

interface GridSkeletonProps {
  columns?: number;
  rows?: number;
  cardWidth: number;
  cardHeight?: number;
}

export function GridSkeleton({
  columns = 2,
  rows = 2,
  cardWidth,
  cardHeight = 200,
}: GridSkeletonProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {Array.from({ length: columns * rows }).map((_, index) => (
        <Skeleton
          key={index}
          width={cardWidth}
          height={cardHeight}
          borderRadius={12}
          style={{ marginBottom: 16 }}
        />
      ))}
    </View>
  );
}
