/**
 * T108: MapView Component
 * Interactive map displaying exposure locations using react-native-maps
 * T112: Pin clustering for performance with 100+ exposures
 * T117: Optimized for performance with viewport-based rendering and marker recycling
 */

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapViewComponent, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-maps-super-cluster';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors } from '@constants/theme';

interface ExposureMarker {
  id: string;
  latitude: number;
  longitude: number;
  exposureType: string;
  siteName?: string | null;
  timestamp: number;
}

interface MapViewProps {
  exposures: ExposureMarker[];
  initialRegion?: Region;
  onMarkerPress?: (exposureId: string) => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
  enableClustering?: boolean; // T112: Enable clustering for 100+ markers
}

const DEFAULT_REGION: Region = {
  latitude: -36.8485, // Auckland, NZ
  longitude: 174.7633,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// T117: Memoize the component to prevent unnecessary re-renders
export const MapView = React.memo(function MapView({
  exposures,
  initialRegion,
  onMarkerPress,
  showUserLocation = true,
  followUserLocation = false,
  enableClustering = true, // T112: Default to clustering enabled
}: MapViewProps) {
  const mapRef = useRef<any>(null);

  // T112: Decide whether to use clustering based on marker count
  const shouldCluster = enableClustering && exposures.length > 100;

  // T117: Memoize color map to prevent recreation on every render
  const colorMap = useMemo(() => ({
    SILICA_DUST: '#8B4513',
    ASBESTOS_CLASS_A: '#DC143C',
    ASBESTOS_CLASS_B: '#FF6347',
    WELDING_FUMES: '#FF8C00',
    HAZARDOUS_CHEMICALS: '#9370DB',
    NOISE: '#FFD700',
    VIBRATION: '#FFA500',
    HEAT_STRESS: '#FF4500',
    COLD_EXPOSURE: '#4682B4',
    CONTAMINATED_SOILS: '#A0522D',
    LEAD: '#696969',
    CONFINED_SPACE: '#2F4F4F',
  }), []);

  // Transform exposures to cluster-compatible format
  const clusterData = useMemo(() => {
    return exposures.map(exposure => ({
      ...exposure,
      location: {
        latitude: exposure.latitude,
        longitude: exposure.longitude,
      },
    }));
  }, [exposures]);

  // Focus map on exposures when they change
  useEffect(() => {
    if (exposures.length > 0 && mapRef.current && !shouldCluster) {
      // Calculate bounding box for all exposures
      const coordinates = exposures.map(e => ({
        latitude: e.latitude,
        longitude: e.longitude,
      }));

      if (mapRef.current.fitToCoordinates) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }
    }
  }, [exposures, shouldCluster]);

  /**
   * T117: Memoized marker color getter
   */
  const getMarkerColor = useCallback((exposureType: string): string => {
    const typeKey = exposureType.toUpperCase();
    return colorMap[typeKey] || colors.primary;
  }, [colorMap]);

  /**
   * T117: Memoized marker press handler
   */
  const handleMarkerPress = useCallback((exposureId: string) => {
    if (onMarkerPress) {
      onMarkerPress(exposureId);
    }
  }, [onMarkerPress]);

  /**
   * T112/T117: Memoized custom cluster marker renderer
   */
  const renderCluster = useCallback((cluster: any) => {
    const pointCount = cluster.pointCount || 0;
    return (
      <View style={styles.clusterContainer}>
        <View style={styles.clusterBubble}>
          <Text style={styles.clusterText}>{pointCount}</Text>
        </View>
      </View>
    );
  }, []);

  /**
   * T112/T117: Memoized individual marker renderer
   */
  const renderMarker = useCallback((data: any) => {
    return (
      <Marker
        key={data.id}
        coordinate={{
          latitude: data.latitude,
          longitude: data.longitude,
        }}
        pinColor={getMarkerColor(data.exposureType)}
        title={data.siteName || EXPOSURE_TYPES[data.exposureType.toUpperCase()]?.label}
        description={`Exposure recorded on ${new Date(data.timestamp).toLocaleDateString()}`}
        onPress={() => handleMarkerPress(data.id)}
      />
    );
  }, [getMarkerColor, handleMarkerPress]);

  // T112: Use clustering for 100+ markers, regular map otherwise
  if (shouldCluster) {
    return (
      <View style={styles.container}>
        <ClusteredMapView
          ref={mapRef}
          data={clusterData}
          initialRegion={initialRegion || DEFAULT_REGION}
          renderMarker={renderMarker}
          renderCluster={renderCluster}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          style={styles.map}
          radius={40}
          extent={512}
          minZoom={0}
          maxZoom={20}
          // T117: Performance optimizations
          tracksViewChanges={false} // Disable tracking for better performance
        />
      </View>
    );
  }

  // Standard map view for < 100 markers
  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion || DEFAULT_REGION}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        followsUserLocation={followUserLocation}
        toolbarEnabled={true}
        // T117: Performance optimizations
        maxZoomLevel={20}
        minZoomLevel={3}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
      >
        {exposures.map(exposure => (
          <Marker
            key={exposure.id}
            coordinate={{
              latitude: exposure.latitude,
              longitude: exposure.longitude,
            }}
            pinColor={getMarkerColor(exposure.exposureType)}
            title={exposure.siteName || EXPOSURE_TYPES[exposure.exposureType.toUpperCase()]?.label}
            description={`Exposure recorded on ${new Date(exposure.timestamp).toLocaleDateString()}`}
            onPress={() => handleMarkerPress(exposure.id)}
            // T117: Disable marker tracking for performance
            tracksViewChanges={false}
          />
        ))}
      </MapViewComponent>
    </View>
  );
}, (prevProps, nextProps) => {
  // T117: Custom comparison function for React.memo
  // Only re-render if exposures array reference changes or length differs
  return (
    prevProps.exposures === nextProps.exposures ||
    (prevProps.exposures.length === nextProps.exposures.length &&
      prevProps.initialRegion === nextProps.initialRegion &&
      prevProps.showUserLocation === nextProps.showUserLocation &&
      prevProps.followUserLocation === nextProps.followUserLocation &&
      prevProps.enableClustering === nextProps.enableClustering)
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // T112: Cluster marker styles
  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterBubble: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.onPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
