/**
 * useLocation Hook
 * React hook for GPS location access
 *
 * Handles:
 * - Permission requests
 * - Current location capture
 * - Location watching
 * - Error handling
 */

import { useState, useEffect } from 'react';
import { Location as LocationType } from '@types/exposure';
import {
  getCurrentLocation,
  checkLocationPermission,
  requestLocationPermission,
  watchLocation,
} from '@lib/location';

interface UseLocationResult {
  location: LocationType | null;
  hasPermission: boolean | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  isWatching: boolean;
}

/**
 * T042: useLocation hook
 * Manages location permissions and GPS capture
 */
export function useLocation(autoRefresh: boolean = false): UseLocationResult {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchSubscription, setWatchSubscription] = useState<{ remove: () => void } | null>(null);

  // Check permission on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  // Auto-refresh location if enabled and permission granted
  useEffect(() => {
    if (autoRefresh && hasPermission) {
      refreshLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, hasPermission]);

  // Cleanup watch subscription on unmount
  useEffect(() => {
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, [watchSubscription]);

  /**
   * Check if location permission is granted
   */
  async function checkPermissionStatus() {
    try {
      const granted = await checkLocationPermission();
      setHasPermission(granted);
    } catch (err) {
      console.error('Error checking location permission:', err);
      setError('Failed to check location permission');
      setHasPermission(false);
    }
  }

  /**
   * Request location permission
   */
  async function requestPermission(): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);

      const granted = await requestLocationPermission();
      setHasPermission(granted);

      if (!granted) {
        setError('Location permission denied');
      } else if (autoRefresh) {
        // Auto-capture location after permission granted
        await refreshLocation();
      }

      return granted;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Get current location
   */
  async function refreshLocation(): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      console.error('Error getting location:', err);
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Start watching location changes
   * Useful for tracking during exposure
   */
  async function startWatching(): Promise<void> {
    try {
      setError(null);

      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      if (isWatching) {
        return; // Already watching
      }

      const subscription = await watchLocation(
        updatedLocation => {
          setLocation(updatedLocation);
        },
        {
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Or every 5 seconds
        }
      );

      setWatchSubscription(subscription);
      setIsWatching(true);
    } catch (err) {
      console.error('Error watching location:', err);
      setError(err instanceof Error ? err.message : 'Failed to watch location');
    }
  }

  /**
   * Stop watching location changes
   */
  function stopWatching() {
    if (watchSubscription) {
      watchSubscription.remove();
      setWatchSubscription(null);
    }
    setIsWatching(false);
  }

  return {
    location,
    hasPermission,
    isLoading,
    error,
    requestPermission,
    refreshLocation,
    startWatching,
    stopWatching,
    isWatching,
  };
}
