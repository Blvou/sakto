import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/use-theme';
import { spacing, typography } from '@/src/design-system/tokens';
import { useCropGesture } from '../hooks/use-crop-gesture';
import { CropOverlay } from './CropOverlay';
import type { AspectRatio, CropRegion } from '../types';
import { computeCropRegion, getCropDimensions } from '../utils/crop-math';

const DIMENSION_TIMEOUT_MS = 8_000;

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: AspectRatio;
  onConfirm: (crop: CropRegion) => void | Promise<void>;
  onCancel: () => void;
}

async function resolveImageDimensions(
  uri: string,
  width?: number,
  height?: number,
): Promise<{ width: number; height: number } | null> {
  if (width && height) {
    return { width, height };
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(null), DIMENSION_TIMEOUT_MS);

    RNImage.getSize(
      uri,
      (resolvedWidth, resolvedHeight) => {
        clearTimeout(timeoutId);
        resolve({ width: resolvedWidth, height: resolvedHeight });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
    );
  });
}

export function ImageCropModal({
  visible,
  imageUri,
  imageWidth: initialWidth,
  imageHeight: initialHeight,
  aspectRatio = { width: 1, height: 1 },
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const headerHeight = spacing.touch + insets.top + spacing.md;
  const footerHeight = spacing.touch + insets.bottom + spacing.md;
  const fallbackContainerHeight = Math.max(windowHeight - headerHeight - footerHeight, 240);
  const fallbackContainerWidth = windowWidth;

  const containerWidth = containerSize?.width ?? fallbackContainerWidth;
  const containerHeight = containerSize?.height ?? fallbackContainerHeight;

  const { cropWidth, cropHeight } = getCropDimensions(
    containerWidth,
    containerHeight,
    aspectRatio.width,
    aspectRatio.height,
  );

  const isReady =
    visible &&
    imageSize !== null &&
    containerSize !== null &&
    imageSize.width > 0 &&
    imageSize.height > 0;

  const { composedGesture, imageAnimatedStyle, getCropState } = useCropGesture({
    imageWidth: imageSize?.width ?? 1,
    imageHeight: imageSize?.height ?? 1,
    cropWidth,
    cropHeight,
    containerWidth,
    containerHeight,
    enabled: isReady,
  });

  useEffect(() => {
    if (!visible) {
      setImageSize(null);
      setContainerSize(null);
      setIsConfirming(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    void resolveImageDimensions(imageUri, initialWidth, initialHeight).then((dimensions) => {
      if (cancelled) return;
      if (!dimensions) {
        setLoadError('Could not load image dimensions');
        return;
      }
      setImageSize(dimensions);
    });

    return () => {
      cancelled = true;
    };
  }, [visible, imageUri, initialWidth, initialHeight]);

  const handleConfirm = useCallback(async () => {
    if (!imageSize || !containerSize || isConfirming) return;

    const { translateX, translateY, scale } = getCropState();
    const crop = computeCropRegion({
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      cropWidth,
      cropHeight,
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      translateX,
      translateY,
      scale,
    });

    setIsConfirming(true);
    try {
      await onConfirm(crop);
    } finally {
      setIsConfirming(false);
    }
  }, [
    containerSize,
    cropHeight,
    cropWidth,
    getCropState,
    imageSize,
    isConfirming,
    onConfirm,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <View
          style={{
            paddingTop: insets.top,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: spacing.touch + insets.top,
          }}
        >
          <Pressable
            onPress={onCancel}
            disabled={isConfirming}
            accessibilityRole="button"
            accessibilityLabel="Cancel crop"
            style={{
              minHeight: spacing.touch,
              minWidth: spacing.touch,
              justifyContent: 'center',
              paddingHorizontal: spacing.sm,
            }}
          >
            <Text style={{ ...typography.body, color: '#FFF', fontFamily: 'PlusJakartaSans_500Medium' }}>
              Cancel
            </Text>
          </Pressable>
          <Text style={{ ...typography.h3, color: '#FFF' }}>Crop photo</Text>
          <Pressable
            onPress={() => void handleConfirm()}
            disabled={!isReady || isConfirming || !!loadError}
            accessibilityRole="button"
            accessibilityLabel="Confirm crop"
            style={{
              minHeight: spacing.touch,
              minWidth: spacing.touch,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingHorizontal: spacing.sm,
            }}
          >
            {isConfirming ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={{
                  ...typography.body,
                  color: isReady && !loadError ? colors.primary : 'rgba(255,255,255,0.4)',
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                }}
              >
                Done
              </Text>
            )}
          </Pressable>
        </View>

        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          {loadError ? (
            <Text style={{ ...typography.body, color: '#FFF', paddingHorizontal: spacing.lg }}>
              {loadError}
            </Text>
          ) : (
            <View
              style={{
                width: containerWidth,
                height: containerHeight,
                position: 'relative',
              }}
            >
              {isReady && (
                <GestureDetector gesture={composedGesture}>
                  <View
                    style={{
                      width: containerWidth,
                      height: containerHeight,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Animated.View style={imageAnimatedStyle}>
                      <Image
                        source={{ uri: imageUri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="fill"
                        cachePolicy="memory-disk"
                      />
                    </Animated.View>
                  </View>
                </GestureDetector>
              )}

              {!isReady && (
                <View
                  style={{
                    ...StyleSheet.absoluteFill,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator color="#FFF" size="large" accessibilityLabel="Loading image" />
                </View>
              )}

              {isReady && containerSize && (
                <CropOverlay
                  containerWidth={containerSize.width}
                  containerHeight={containerSize.height}
                  cropWidth={cropWidth}
                  cropHeight={cropHeight}
                />
              )}
            </View>
          )}
        </View>

        <View
          style={{
            paddingBottom: insets.bottom + spacing.sm,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...typography.caption, color: 'rgba(255,255,255,0.7)' }}>
            Pinch to zoom, drag to reposition
          </Text>
        </View>
      </View>
    </Modal>
  );
}
