/**
 * Draft Manager
 * T057: Auto-save and restore exposure drafts using MMKV
 *
 * Features:
 * - Save draft every 3 seconds
 * - Restore draft on screen mount
 * - Clear draft on successful save
 * - One draft per screen (new exposure)
 */

import { ExposureDraft } from '../types/exposure';

// In-memory fallback storage for Expo Go
class MemoryStorage {
  private data: Map<string, string> = new Map();
  getString(key: string): string | undefined {
    return this.data.get(key);
  }
  set(key: string, value: string): void {
    this.data.set(key, value);
  }
}

// Try to use MMKV, fallback to memory storage for Expo Go
let storage: any;
try {
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({ id: 'waldo-health-drafts' });
} catch {
  storage = new MemoryStorage();
}

const DRAFT_KEY = 'exposure_draft';

export interface DraftState {
  photoUris: string[];
  selectedType: string | null;
  formData: Partial<ExposureDraft>;
  timestamp: number; // When draft was saved
}

/**
 * Save exposure draft to MMKV
 */
export function saveDraft(draft: DraftState): void {
  try {
    const draftWithTimestamp: DraftState = {
      ...draft,
      timestamp: Date.now(),
    };
    storage.set(DRAFT_KEY, JSON.stringify(draftWithTimestamp));
    console.log('[DraftManager] Draft saved');
  } catch (error) {
    console.error('[DraftManager] Error saving draft:', error);
  }
}

/**
 * Get saved draft from MMKV
 * Returns null if no draft exists or if draft is too old (>24 hours)
 */
export function getDraft(): DraftState | null {
  try {
    const draftJson = storage.getString(DRAFT_KEY);
    if (!draftJson) {
      return null;
    }

    const draft: DraftState = JSON.parse(draftJson);

    // Check if draft is too old (>24 hours)
    const ageMs = Date.now() - draft.timestamp;
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
    if (ageMs > maxAgeMs) {
      console.log('[DraftManager] Draft expired, clearing');
      clearDraft();
      return null;
    }

    console.log('[DraftManager] Draft restored');
    return draft;
  } catch (error) {
    console.error('[DraftManager] Error getting draft:', error);
    return null;
  }
}

/**
 * Clear saved draft from MMKV
 */
export function clearDraft(): void {
  try {
    storage.set(DRAFT_KEY, '');
    console.log('[DraftManager] Draft cleared');
  } catch (error) {
    console.error('[DraftManager] Error clearing draft:', error);
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
  const draftJson = storage.getString(DRAFT_KEY);
  return draftJson !== undefined && draftJson !== '';
}
