import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  clampTranslation,
  getBaseScale,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../utils/crop-math';

interface UseCropGestureParams {
  imageWidth: number;
  imageHeight: number;
  cropWidth: number;
  cropHeight: number;
  containerWidth: number;
  containerHeight: number;
  enabled: boolean;
}

export function useCropGesture({
  imageWidth,
  imageHeight,
  cropWidth,
  cropHeight,
  containerWidth,
  containerHeight,
  enabled,
}: UseCropGestureParams) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    enabled,
    imageWidth,
    imageHeight,
    cropWidth,
    cropHeight,
    containerWidth,
    containerHeight,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  const pinchGesture = Gesture.Pinch()
    .enabled(enabled)
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_ZOOM, MAX_ZOOM);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      const clamped = clampTranslation(
        translateX.value,
        translateY.value,
        scale.value,
        imageWidth,
        imageHeight,
        cropWidth,
        cropHeight,
        containerWidth,
        containerHeight,
      );
      translateX.value = withTiming(clamped.x, { duration: 120 });
      translateY.value = withTiming(clamped.y, { duration: 120 });
      savedTranslateX.value = clamped.x;
      savedTranslateY.value = clamped.y;
    });

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      const clamped = clampTranslation(
        translateX.value,
        translateY.value,
        scale.value,
        imageWidth,
        imageHeight,
        cropWidth,
        cropHeight,
        containerWidth,
        containerHeight,
      );
      translateX.value = withTiming(clamped.x, { duration: 120 });
      translateY.value = withTiming(clamped.y, { duration: 120 });
      savedTranslateX.value = clamped.x;
      savedTranslateY.value = clamped.y;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const baseScale = getBaseScale(imageWidth, imageHeight, cropWidth, cropHeight);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const displayW = imageWidth * baseScale * scale.value;
    const displayH = imageHeight * baseScale * scale.value;

    return {
      width: displayW,
      height: displayH,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  }, [baseScale, imageHeight, imageWidth]);

  const getCropState = () => ({
    translateX: translateX.value,
    translateY: translateY.value,
    scale: scale.value,
  });

  return {
    composedGesture,
    imageAnimatedStyle,
    getCropState,
  };
}
