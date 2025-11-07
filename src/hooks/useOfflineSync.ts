/**
 * useOfflineSync Hook
 * React hook for monitoring and triggering offline sync
 *
 * Handles:
 * - Network status monitoring
 * - Auto-sync on connectivity
 * - Queue status tracking
 * - Manual sync trigger
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from '@lib/offlineQueue';
import { photoQueue } from '@lib/photoQueue';

interface UseOfflineSyncResult {
  // Network state
  isOnline: boolean;
  isConnected: boolean | null;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;

  // Queue status
  exposureQueueCount: number;
  photoQueueCount: number;
  problematicItemsCount: number;

  // Actions
  triggerSync: () => Promise<void>;
  clearSyncError: () => void;
}

/**
 * T044: useOfflineSync hook
 * Monitors network and manages offline sync
 */
export function useOfflineSync(): UseOfflineSyncResult {
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [exposureQueueCount, setExposureQueueCount] = useState(0);
  const [photoQueueCount, setPhotoQueueCount] = useState(0);
  const [problematicItemsCount, setProblematicItemsCount] = useState(0);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsConnected(state.isConnected);

      // Auto-sync when coming back online
      if (online && !isSyncing) {
        const hasQueuedItems = offlineQueue.count() > 0 || photoQueue.count() > 0;
        if (hasQueuedItems) {
          console.log('Network restored, triggering auto-sync');
          triggerSync();
        }
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncing]);

  // Update queue counts
  const updateQueueCounts = useCallback(() => {
    setExposureQueueCount(offlineQueue.count());
    setPhotoQueueCount(photoQueue.getPendingCount());
    setProblematicItemsCount(offlineQueue.getProblematicItems().length);
  }, []);

  // Listen to queue changes
  useEffect(() => {
    const unsubscribeExposure = offlineQueue.addListener(updateQueueCounts);
    const unsubscribePhoto = photoQueue.addListener(updateQueueCounts);

    // Initial count
    updateQueueCounts();

    return () => {
      unsubscribeExposure();
      unsubscribePhoto();
    };
  }, [updateQueueCounts]);

  /**
   * Trigger manual sync
   * Processes both exposure and photo queues
   */
  async function triggerSync(): Promise<void> {
    if (isSyncing) {
      console.warn('Sync already in progress');
      return;
    }

    if (!isOnline) {
      setSyncError('No network connection');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      console.log('Starting sync...');

      // Process exposure queue
      await offlineQueue.processQueue();

      // Process photo queue
      await photoQueue.processQueue();

      setLastSyncTime(Date.now());
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      updateQueueCounts();
    }
  }

  /**
   * Clear sync error
   */
  function clearSyncError() {
    setSyncError(null);
  }

  return {
    isOnline,
    isConnected,
    isSyncing,
    lastSyncTime,
    syncError,
    exposureQueueCount,
    photoQueueCount,
    problematicItemsCount,
    triggerSync,
    clearSyncError,
  };
}

/**
 * Hook for monitoring network status only
 * Lightweight version for components that just need connectivity info
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    isConnected,
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
  };
}
