/**
 * useDraftForm Hook
 * Provides auto-save functionality for form drafts using MMKV storage
 *
 * Usage:
 *   const { loadDraft, clearDraft, lastSaved } = useDraftForm('exposure_new', formData, 2000);
 *
 * Features:
 * - Auto-saves form data after specified delay (default 2000ms)
 * - Loads draft on component mount
 * - Clears draft on form submission
 * - Tracks last saved timestamp
 * - Uses MMKV storage (with in-memory fallback for Expo Go)
 */

import { useEffect, useState } from 'react';
import { storageHelpers } from '@lib/storage';
import { useDebounce } from './useDebounce';

export function useDraftForm<T>(
  draftId: string,
  formData: T,
  autoSaveDelay: number = 2000
) {
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce form data to avoid saving on every keystroke
  const debouncedFormData = useDebounce(formData, autoSaveDelay);

  // Storage key for this draft
  const storageKey = `draft_${draftId}`;

  /**
   * Load draft from storage
   * Call this on component mount to restore previous session
   */
  const loadDraft = async (): Promise<T | null> => {
    try {
      setIsLoading(true);
      const draft = storageHelpers.get<{ data: T; timestamp: number; version: number }>(storageKey);
      if (draft) {
        return draft.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear draft from storage
   * Call this after successful form submission
   */
  const clearDraft = async (): Promise<void> => {
    try {
      storageHelpers.remove(storageKey);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  /**
   * Manually save draft (bypassing auto-save)
   */
  const saveDraft = async (data: T): Promise<void> => {
    try {
      const draftObj = {
        data,
        timestamp: Date.now(),
        version: 1,
      };
      storageHelpers.set(storageKey, draftObj);
      setLastSaved(Date.now());
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Auto-save effect - saves debounced form data
  useEffect(() => {
    // Don't save if formData is empty/initial state
    if (!debouncedFormData || Object.keys(debouncedFormData as any).length === 0) {
      return;
    }

    // Save draft to storage
    try {
      const draftObj = {
        data: debouncedFormData,
        timestamp: Date.now(),
        version: 1,
      };
      storageHelpers.set(storageKey, draftObj);
      setLastSaved(Date.now());
    } catch (error) {
      console.error('Failed to auto-save draft:', error);
    }
  }, [debouncedFormData, storageKey]);

  return {
    loadDraft,
    clearDraft,
    saveDraft,
    lastSaved,
    isLoading,
  };
}
