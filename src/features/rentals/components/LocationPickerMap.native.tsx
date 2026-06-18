import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type LatLng, type MapPressEvent } from 'react-native-maps';
import { toMapRegion } from '@/src/lib/maps';
import type { LocationPickerMapProps } from './LocationPickerMap';

export function LocationPickerMap({ coordinates, onCoordinatesChange, isDark }: LocationPickerMapProps) {

  const handlePress = useCallback(
    (event: MapPressEvent) => {
      onCoordinatesChange(event.nativeEvent.coordinate);
    },
    [onCoordinatesChange]
  );

  const handleDragEnd = useCallback(
    (event: { nativeEvent: { coordinate: LatLng } }) => {
      onCoordinatesChange(event.nativeEvent.coordinate);
    },
    [onCoordinatesChange]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={toMapRegion(coordinates, 0.03)}
        onPress={handlePress}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        <Marker coordinate={coordinates} draggable onDragEnd={handleDragEnd} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
