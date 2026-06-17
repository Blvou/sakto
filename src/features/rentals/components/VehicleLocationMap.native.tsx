import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { VehicleLocationMapProps } from './VehicleLocationMap';

export function VehicleLocationMap({ coordinates, isDark }: VehicleLocationMapProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...coordinates,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        <Marker coordinate={coordinates} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
