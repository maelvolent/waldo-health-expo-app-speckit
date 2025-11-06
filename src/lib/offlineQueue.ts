/**
 * Offline Queue Manager
 * Manages pending exposure records that need to be synced to backend
 *
 * Features:
 * - Persistent queue using MMKV
 * - Auto-retry with exponential backoff
 * - Network status monitoring
 * - Conflict resolution
 */

import { ExposureDraft } from '../types/exposure';
import { storageHelpers, StorageKeys } from './storage';
import NetInfo from '@react-native-community/netinfo';

export interface QueuedExposure {
  id: string; // clientId
  draft: ExposureDraft;
  attemptCount: number;
  lastAttempt: number | null;
  createdAt: number;
  error: string | null;
}

class OfflineQueueManager {
  private queue: QueuedExposure[] = [];
  private isProcessing = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  /**
   * Load queue from storage on initialization
   */
  private loadQueue(): void {
    const stored = storageHelpers.get<QueuedExposure[]>(StorageKeys.EXPOSURE_QUEUE);
    this.queue = stored || [];
  }

  /**
   * Save queue to storage
   */
  private saveQueue(): void {
    storageHelpers.set(StorageKeys.EXPOSURE_QUEUE, this.queue);
    this.notifyListeners();
  }

  /**
   * Setup network listener to auto-process queue when online
   */
  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0 && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Add exposure to queue
   */
  add(draft: ExposureDraft): void {
    const queueItem: QueuedExposure = {
      id: draft.clientId,
      draft,
      attemptCount: 0,
      lastAttempt: null,
      createdAt: Date.now(),
      error: null,
    };

    this.queue.push(queueItem);
    this.saveQueue();

    // Try to process immediately if online
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  /**
   * Remove exposure from queue (after successful sync)
   */
  remove(clientId: string): void {
    this.queue = this.queue.filter(item => item.id !== clientId);
    this.saveQueue();
  }

  /**
   * Update exposure in queue (for conflict resolution)
   */
  update(clientId: string, draft: ExposureDraft): void {
    const index = this.queue.findIndex(item => item.id === clientId);
    if (index !== -1) {
      this.queue[index].draft = draft;
      this.queue[index].error = null;
      this.saveQueue();
    }
  }

  /**
   * Get all queued exposures
   */
  getAll(): QueuedExposure[] {
    return [...this.queue];
  }

  /**
   * Get queued exposure by clientId
   */
  get(clientId: string): QueuedExposure | null {
    return this.queue.find(item => item.id === clientId) || null;
  }

  /**
   * Get queue count
   */
  count(): number {
    return this.queue.length;
  }

  /**
   * Process queue - sync all pending exposures
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Check network status
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn('No network connection, skipping queue processing');
        this.isProcessing = false;
        return;
      }

      // Process items in order
      for (const item of [...this.queue]) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process single queue item
   */
  private async processItem(item: QueuedExposure): Promise<void> {
    try {
      // TODO: Implement actual sync logic with Convex mutation
      // For now, this is a placeholder that will be implemented in Phase 3

      // Exponential backoff - don't retry too frequently
      const minWaitTime = Math.pow(2, item.attemptCount) * 1000; // 1s, 2s, 4s, 8s...
      const timeSinceLastAttempt = item.lastAttempt ? Date.now() - item.lastAttempt : Infinity;

      if (timeSinceLastAttempt < minWaitTime) {
        return; // Too soon to retry
      }

      // Update attempt count
      item.attemptCount++;
      item.lastAttempt = Date.now();
      this.saveQueue();

      // Simulate sync (replace with actual Convex mutation)
      console.log(`Syncing exposure ${item.id}...`);

      // On success, remove from queue
      // this.remove(item.id);
    } catch (error) {
      console.error(`Failed to sync exposure ${item.id}:`, error);
      item.error = error instanceof Error ? error.message : 'Unknown error';

      // Give up after 5 attempts
      if (item.attemptCount >= 5) {
        console.error(`Max retries reached for exposure ${item.id}, moving to conflicts`);
        // TODO: Move to conflicts for manual resolution
      }

      this.saveQueue();
    }
  }

  /**
   * Clear entire queue (use with caution!)
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Add listener for queue changes
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of queue changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get items that need attention (errors, too many retries)
   */
  getProblematicItems(): QueuedExposure[] {
    return this.queue.filter(item => item.error !== null || item.attemptCount >= 3);
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();
