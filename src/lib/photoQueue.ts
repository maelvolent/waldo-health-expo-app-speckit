/**
 * Photo Upload Queue Manager
 * Manages photo uploads with retry logic and progress tracking
 *
 * Features:
 * - Persistent queue using MMKV
 * - Upload progress tracking
 * - Auto-retry with exponential backoff
 * - Network-aware uploads (WiFi preference)
 * - Parallel uploads with concurrency limit
 */

import { PhotoUploadQueueItem } from '../types/photo';
import { storageHelpers, StorageKeys } from './storage';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';

const MAX_CONCURRENT_UPLOADS = 2;
const MAX_RETRY_COUNT = 5;
const WIFI_ONLY_SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB

class PhotoQueueManager {
  private queue: PhotoUploadQueueItem[] = [];
  private activeUploads: Set<string> = new Set();
  private listeners: Set<(queue: PhotoUploadQueueItem[]) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  /**
   * Load queue from storage
   */
  private loadQueue(): void {
    const stored = storageHelpers.get<PhotoUploadQueueItem[]>(StorageKeys.PHOTO_QUEUE);
    this.queue = stored || [];
  }

  /**
   * Save queue to storage
   */
  private saveQueue(): void {
    storageHelpers.set(StorageKeys.PHOTO_QUEUE, this.queue);
    this.notifyListeners();
  }

  /**
   * Setup network listener for auto-upload
   */
  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  /**
   * Add photo to upload queue
   */
  add(
    item: Omit<
      PhotoUploadQueueItem,
      'id' | 'uploadStatus' | 'uploadProgress' | 'retryCount' | 'lastAttempt' | 'createdAt'
    >
  ): string {
    const queueItem: PhotoUploadQueueItem = {
      ...item,
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadStatus: 'pending',
      uploadProgress: 0,
      retryCount: 0,
      lastAttempt: null,
      createdAt: Date.now(),
    };

    this.queue.push(queueItem);
    this.saveQueue();

    // Try to upload immediately if conditions are met
    this.processQueue();

    return queueItem.id;
  }

  /**
   * Remove photo from queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.activeUploads.delete(id);
    this.saveQueue();
  }

  /**
   * Update photo upload progress
   */
  updateProgress(id: string, progress: number): void {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.uploadProgress = progress;
      this.saveQueue();
    }
  }

  /**
   * Update photo upload status
   */
  updateStatus(id: string, status: PhotoUploadQueueItem['uploadStatus']): void {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.uploadStatus = status;
      this.saveQueue();
    }
  }

  /**
   * Get all queued photos
   */
  getAll(): PhotoUploadQueueItem[] {
    return [...this.queue];
  }

  /**
   * Get photos for a specific exposure
   */
  getByExposure(exposureClientId: string): PhotoUploadQueueItem[] {
    return this.queue.filter(item => item.exposureClientId === exposureClientId);
  }

  /**
   * Get queue count
   */
  count(): number {
    return this.queue.length;
  }

  /**
   * Get pending upload count
   */
  getPendingCount(): number {
    return this.queue.filter(
      item => item.uploadStatus === 'pending' || item.uploadStatus === 'error'
    ).length;
  }

  /**
   * Process upload queue
   */
  async processQueue(): Promise<void> {
    // Check network
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    // Get pending items
    const pending = this.queue.filter(
      item =>
        (item.uploadStatus === 'pending' || item.uploadStatus === 'error') &&
        !this.activeUploads.has(item.id) &&
        item.retryCount < MAX_RETRY_COUNT
    );

    if (pending.length === 0) {
      return;
    }

    // Filter by network type (WiFi preference for large files)
    const uploadable = pending.filter(item => {
      if (item.fileSize > WIFI_ONLY_SIZE_THRESHOLD) {
        return netInfo.type === 'wifi';
      }
      return true;
    });

    // Upload with concurrency limit
    const toUpload = uploadable.slice(0, MAX_CONCURRENT_UPLOADS - this.activeUploads.size);

    for (const item of toUpload) {
      this.uploadPhoto(item);
    }
  }

  /**
   * Upload single photo
   */
  private async uploadPhoto(item: PhotoUploadQueueItem): Promise<void> {
    // Check exponential backoff
    if (item.lastAttempt) {
      const minWaitTime = Math.pow(2, item.retryCount) * 1000;
      const timeSinceLastAttempt = Date.now() - item.lastAttempt;
      if (timeSinceLastAttempt < minWaitTime) {
        return;
      }
    }

    // Mark as uploading
    this.activeUploads.add(item.id);
    this.updateStatus(item.id, 'uploading');
    item.retryCount++;
    item.lastAttempt = Date.now();
    this.saveQueue();

    try {
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(item.localUri);
      if (!fileInfo.exists) {
        throw new Error('Photo file not found');
      }

      // TODO: Implement actual upload to Convex storage
      // This is a placeholder that will be implemented in Phase 3
      console.log(`Uploading photo ${item.id}...`);

      // Simulate upload with progress
      // const result = await this.uploadToConvex(item);

      // On success:
      // this.remove(item.id);
    } catch (error) {
      console.error(`Photo upload failed for ${item.id}:`, error);
      this.updateStatus(item.id, 'error');

      if (item.retryCount >= MAX_RETRY_COUNT) {
        console.error(`Max retries reached for photo ${item.id}`);
        // Keep in queue for manual retry
      }
    } finally {
      this.activeUploads.delete(item.id);
    }
  }

  /**
   * Retry failed uploads
   */
  async retryFailed(): Promise<void> {
    const failed = this.queue.filter(item => item.uploadStatus === 'error');
    failed.forEach(item => {
      item.retryCount = 0;
      item.uploadStatus = 'pending';
    });
    this.saveQueue();
    await this.processQueue();
  }

  /**
   * Clear completed uploads from queue
   */
  clearCompleted(): void {
    this.queue = this.queue.filter(item => item.uploadStatus !== 'uploaded');
    this.saveQueue();
  }

  /**
   * Clear entire queue (use with caution!)
   */
  clear(): void {
    this.queue = [];
    this.activeUploads.clear();
    this.saveQueue();
  }

  /**
   * Add listener for queue changes
   */
  addListener(listener: (queue: PhotoUploadQueueItem[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  /**
   * Get failed uploads
   */
  getFailedUploads(): PhotoUploadQueueItem[] {
    return this.queue.filter(
      item => item.uploadStatus === 'error' && item.retryCount >= MAX_RETRY_COUNT
    );
  }

  /**
   * Cancel active upload
   */
  cancel(id: string): void {
    const item = this.queue.find(item => item.id === id);
    if (item && item.uploadStatus === 'uploading') {
      item.uploadStatus = 'error';
      this.activeUploads.delete(id);
      this.saveQueue();
    }
  }
}

// Export singleton instance
export const photoQueue = new PhotoQueueManager();
