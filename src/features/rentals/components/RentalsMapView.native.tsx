import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { hasValidCoordinates, toMapRegion, type MapCoordinates } from '@/src/lib/maps';
import type { VehicleCardItem } from '../types';
import type { RentalsMapHandle } from './rentals-map-types';
import type { RentalsMapViewProps } from './RentalsMapView';
import { VehicleMapMarker } from './VehicleMapMarker';

export type { RentalsMapHandle } from './rentals-map-types';

export const RentalsMapView = forwardRef<RentalsMapHandle, RentalsMapViewProps>(function RentalsMapView(
  { vehicles, userCoords, selectedVehicleId, isDark, onSelectVehicle },
  ref
) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    centerOnUser: (coords: MapCoordinates) => {
      mapRef.current?.animateToRegion(toMapRegion(coords, 0.06), 350);
    },
  }));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={toMapRegion(userCoords, 0.08)}
        showsUserLocation
        showsMyLocationButton={false}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        onPress={() => onSelectVehicle(null)}
      >
        {vehicles
          .filter((vehicle) => hasValidCoordinates(vehicle))
          .map((vehicle) => (
            <VehicleMapMarker
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleId === vehicle.id}
              onPress={onSelectVehicle}
            />
          ))}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
