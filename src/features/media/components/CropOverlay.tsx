import { View } from 'react-native';

const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.62)';

interface CropOverlayProps {
  containerWidth: number;
  containerHeight: number;
  cropWidth: number;
  cropHeight: number;
}

export function CropOverlay({
  containerWidth,
  containerHeight,
  cropWidth,
  cropHeight,
}: CropOverlayProps) {
  const cropLeft = (containerWidth - cropWidth) / 2;
  const cropTop = (containerHeight - cropHeight) / 2;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: cropTop,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cropTop + cropHeight,
          bottom: 0,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: cropTop,
          left: 0,
          width: cropLeft,
          height: cropHeight,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: cropTop,
          right: 0,
          width: cropLeft,
          height: cropHeight,
          backgroundColor: OVERLAY_COLOR,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: cropTop,
          left: cropLeft,
          width: cropWidth,
          height: cropHeight,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    </View>
  );
}
