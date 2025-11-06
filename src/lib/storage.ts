/**
 * Storage Wrapper
 * Fast, secure local storage for offline-first architecture
 *
 * Uses MMKV for production (requires native build)
 * Falls back to in-memory storage for Expo Go
 */

// In-memory fallback storage for Expo Go
class MemoryStorage {
  private data: Map<string, string> = new Map();

  getString(key: string): string | undefined {
    return this.data.get(key);
  }

  set(key: string, value: string | number | boolean): void {
    this.data.set(key, String(value));
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.data.get(key);
    return value === 'true' ? true : value === 'false' ? false : undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.data.get(key);
    return value ? Number(value) : undefined;
  }

  remove(key: string): boolean {
    return this.data.delete(key);
  }

  clearAll(): void {
    this.data.clear();
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }
}

// Try to use MMKV, fallback to memory storage for Expo Go
let storage: any;
try {
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({
    id: 'waldo-health-storage',
  });
  console.log('[Storage] Using MMKV');
} catch {
  storage = new MemoryStorage();
  console.log('[Storage] Using in-memory storage (Expo Go mode)');
}

export { storage };

// Storage keys
export const StorageKeys = {
  // Offline queue
  EXPOSURE_QUEUE: 'offline_exposure_queue',
  PHOTO_QUEUE: 'offline_photo_queue',

  // User preferences
  USER_PREFERENCES: 'user_preferences',

  // Cached data
  RECENT_LOCATIONS: 'recent_locations',
  EDUCATIONAL_CONTENT_CACHE: 'educational_content_cache',

  // App state
  LAST_SYNC_TIME: 'last_sync_time',
  SYNC_CONFLICTS: 'sync_conflicts',

  // Onboarding
  HAS_COMPLETED_ONBOARDING: 'has_completed_onboarding',
} as const;

/**
 * Generic storage helpers with type safety
 */

export const storageHelpers = {
  /**
   * Get typed value from storage
   */
  get: <T>(key: string): T | null => {
    try {
      const value = storage.getString(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set typed value in storage
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      storage.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Remove value from storage
   */
  remove: (key: string): boolean => {
    try {
      return storage.remove(key);
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Clear all storage (use with caution!)
   */
  clearAll: (): boolean => {
    try {
      storage.clearAll();
      return true;
    } catch (error) {
      console.error('Storage clearAll error:', error);
      return false;
    }
  },

  /**
   * Get boolean value
   */
  getBoolean: (key: string): boolean => {
    return storage.getBoolean(key) ?? false;
  },

  /**
   * Set boolean value
   */
  setBoolean: (key: string, value: boolean): boolean => {
    try {
      storage.set(key, value);
      return true;
    } catch (error) {
      console.error(`Storage setBoolean error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get number value
   */
  getNumber: (key: string): number | null => {
    return storage.getNumber(key) ?? null;
  },

  /**
   * Set number value
   */
  setNumber: (key: string, value: number): boolean => {
    try {
      storage.set(key, value);
      return true;
    } catch (error) {
      console.error(`Storage setNumber error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  has: (key: string): boolean => {
    return storage.contains(key);
  },
};

/**
 * Storage size and cleanup utilities
 */
export const storageUtils = {
  /**
   * Get all keys in storage
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  /**
   * Clear old cached data (older than 30 days)
   */
  clearOldCache: (): void => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Clear educational content cache if old
    const lastSync = storageHelpers.getNumber(StorageKeys.LAST_SYNC_TIME);
    if (lastSync && lastSync < thirtyDaysAgo) {
      storageHelpers.remove(StorageKeys.EDUCATIONAL_CONTENT_CACHE);
    }
  },
};
