import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useIsFocused, useRouter, type Href } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useResponsive } from '@/src/hooks/use-responsive';
import { radii } from '@/src/design-system/tokens';
import { PromoBanner } from '../data/mock-data';

const BANNER_GAP = 12;

interface PromoCarouselProps {
  banners: PromoBanner[];
}

export function PromoCarousel({ banners }: PromoCarouselProps) {
  const { colors } = useTheme();
  const { contentWidth, scale } = useResponsive();
  const router = useRouter();
  const bannerWidth = contentWidth;
  const bannerHeight = scale(140);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isFocused = useIsFocused();
  const snapInterval = bannerWidth + BANNER_GAP;

  useEffect(() => {
    if (!isFocused || banners.length < 2) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * snapInterval, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isFocused, banners.length, snapInterval]);

  return (
    <View style={{ marginBottom: 8 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={{ gap: BANNER_GAP }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
          setActiveIndex(index);
        }}
      >
        {banners.map((banner) => (
          <Pressable
            key={banner.id}
            onPress={() => {
              if (banner.href) {
                router.push(banner.href as Href);
                return;
              }
              if (banner.category) {
                router.push({
                  pathname: '/search',
                  params: { category: banner.category },
                });
              }
            }}
            style={{
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: radii.lg,
              backgroundColor: banner.backgroundColor,
              padding: scale(20),
              justifyContent: 'flex-end',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: scale(20),
                fontFamily: 'PlusJakartaSans_700Bold',
                color: banner.textColor,
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {banner.title}
            </Text>
            <Text
              style={{ fontSize: scale(14), color: banner.textColor, opacity: 0.9 }}
              numberOfLines={2}
            >
              {banner.subtitle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {banners.map((banner, i) => (
          <View
            key={banner.id}
            style={{
              width: activeIndex === i ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: activeIndex === i ? '#0066FF' : '#D0D8E8',
            }}
          />
        ))}
      </View>
    </View>
  );
}
