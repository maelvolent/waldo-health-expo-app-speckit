/**
 * NetworkMonitor Component
 * T058: Monitors network status and triggers auto-sync
 *
 * Features:
 * - Monitors connectivity using useOfflineSync hook
 * - Automatically triggers sync when coming back online
 * - Silent background operation (no UI)
 */

import { useEffect } from 'react';
import { useOfflineSync } from '@hooks/useOfflineSync';

export function NetworkMonitor() {
  const { isOnline, isSyncing, exposureQueueCount, photoQueueCount } = useOfflineSync();

  useEffect(() => {
    // Auto-sync is already handled in useOfflineSync hook
    // This component just ensures the hook is active at root level
    console.log('[NetworkMonitor] Status:', {
      isOnline,
      isSyncing,
      queuedExposures: exposureQueueCount,
      queuedPhotos: photoQueueCount,
    });
  }, [isOnline, isSyncing, exposureQueueCount, photoQueueCount]);

  // Silent component - no UI rendered
  return null;
}
