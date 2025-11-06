/**
 * Location Utility Functions
 * Handles GPS capture and reverse geocoding
 *
 * Uses expo-location to:
 * - Get current GPS coordinates
 * - Reverse geocode to get address
 * - Handle permissions
 */

import * as Location from 'expo-location';
import { Location as LocationType } from '../types/exposure';

/**
 * Get current location with GPS coordinates and address
 * Requests permission if not granted
 */
export async function getCurrentLocation(): Promise<LocationType> {
  try {
    // Request foreground permissions
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position with high accuracy
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Reverse geocode to get address
    let address: string | null = null;
    let siteName: string | null = null;

    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (geocode.length > 0) {
        const location = geocode[0];
        // Format address from components
        const addressParts = [
          location.streetNumber,
          location.street,
          location.city,
          location.region,
          location.postalCode,
          location.country,
        ].filter(Boolean);

        address = addressParts.join(', ');
        siteName = location.name || null;
      }
    } catch (geocodeError) {
      console.warn('Reverse geocoding failed:', geocodeError);
      // Continue without address - GPS coords are still valid
    }

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy || null,
      address,
      siteName,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
}

/**
 * Check if location permissions are granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Request location permissions
 * Returns true if granted, false otherwise
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Reverse geocode coordinates to address
 * Useful for displaying saved location data
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const geocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (geocode.length > 0) {
      const location = geocode[0];
      const addressParts = [
        location.streetNumber,
        location.street,
        location.city,
        location.region,
        location.postalCode,
        location.country,
      ].filter(Boolean);

      return addressParts.join(', ');
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Format coordinates for display
 * Returns string like "-36.8485, 174.7633"
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Calculate distance between two coordinates in kilometers
 * Uses Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance for display
 * Returns "1.2 km" or "350 m"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Check if coordinates are within New Zealand
 * Returns true if in NZ bounding box
 */
export function isInNewZealand(latitude: number, longitude: number): boolean {
  // NZ bounding box (approximate)
  const minLat = -47.5;
  const maxLat = -34.0;
  const minLon = 166.0;
  const maxLon = 179.0;

  return latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon;
}

/**
 * Get location accuracy description
 * Returns human-readable accuracy level
 */
export function getAccuracyDescription(accuracy: number | null): string {
  if (!accuracy) return 'Unknown';
  if (accuracy < 10) return 'Excellent';
  if (accuracy < 50) return 'Good';
  if (accuracy < 100) return 'Fair';
  return 'Poor';
}

/**
 * Watch location changes
 * Useful for tracking movement during exposure
 */
export async function watchLocation(
  callback: (location: LocationType) => void,
  options?: {
    accuracy?: Location.Accuracy;
    distanceInterval?: number;
    timeInterval?: number;
  }
): Promise<{ remove: () => void }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: options?.accuracy || Location.Accuracy.High,
        distanceInterval: options?.distanceInterval || 10, // meters
        timeInterval: options?.timeInterval || 5000, // milliseconds
      },
      async position => {
        // Reverse geocode
        let address: string | null = null;
        let siteName: string | null = null;

        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (geocode.length > 0) {
            const location = geocode[0];
            const addressParts = [
              location.streetNumber,
              location.street,
              location.city,
              location.region,
              location.postalCode,
              location.country,
            ].filter(Boolean);

            address = addressParts.join(', ');
            siteName = location.name || null;
          }
        } catch {
          // Ignore geocoding errors
        }

        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || null,
          address,
          siteName,
        });
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error watching location:', error);
    throw error;
  }
}
