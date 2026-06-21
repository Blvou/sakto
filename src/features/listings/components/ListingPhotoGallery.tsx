import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/src/hooks/use-theme';
import { typography } from '@/src/design-system/tokens';
import type { ListingImageSource } from '../utils/listing-images';

const PEEK_WIDTH = 28;
const ITEM_GAP = 8;

interface ListingPhotoGalleryProps {
  images: ListingImageSource[];
  title: string;
  topInset?: number;
  overlay?: ReactNode;
}

interface GallerySlideProps {
  source: ListingImageSource;
  title: string;
  width: number;
  height: number;
  borderColor: string;
}

const GallerySlide = memo(function GallerySlide({
  source,
  title,
  width,
  height,
  borderColor,
}: GallerySlideProps) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: borderColor,
      }}
    >
      <Image
        source={source}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        accessibilityLabel={title}
      />
    </View>
  );
});

export function ListingPhotoGallery({
  images,
  title,
  topInset = 0,
  overlay,
}: ListingPhotoGalleryProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const itemWidth = screenWidth - PEEK_WIDTH * 2;
  const galleryHeight = Math.round(screenWidth * 0.72);
  const snapInterval = itemWidth + ITEM_GAP;

  const data = useMemo(() => images, [images]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
      setActiveIndex(Math.max(0, Math.min(nextIndex, data.length - 1)));
    },
    [data.length, snapInterval]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<ListingImageSource> | null | undefined, index: number) => ({
      length: snapInterval,
      offset: snapInterval * index,
      index,
    }),
    [snapInterval]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ListingImageSource>) => (
      <View style={{ width: itemWidth, marginRight: ITEM_GAP }}>
        <GallerySlide
          source={item}
          title={title}
          width={itemWidth}
          height={galleryHeight}
          borderColor={colors.border}
        />
      </View>
    ),
    [colors.border, galleryHeight, itemWidth, title]
  );

  const keyExtractor = useCallback(
    (item: ListingImageSource, index: number) =>
      typeof item === 'number' ? `asset-${item}-${index}` : `${item.uri}-${index}`,
    []
  );

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop: topInset + 8,
        paddingBottom: 12,
      }}
    >
      <View style={{ position: 'relative' }}>
        <FlatList
          data={data}
          horizontal
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          getItemLayout={getItemLayout}
          contentContainerStyle={{ paddingHorizontal: PEEK_WIDTH }}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />

        {overlay ? (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: PEEK_WIDTH,
              right: PEEK_WIDTH,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {overlay}
          </View>
        ) : null}

        {data.length > 1 ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: PEEK_WIDTH + 12,
              bottom: 12,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }}
          >
            <Text style={{ ...typography.caption, color: '#FFFFFF', fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              {activeIndex + 1} / {data.length}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
