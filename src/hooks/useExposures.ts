/**
 * useExposures Hook
 * React hook for exposure data management with Convex
 *
 * Handles:
 * - Querying exposures from Convex
 * - Creating new exposures
 * - Updating exposures
 * - Deleting exposures
 * - Offline queue integration
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ExposureDraft } from '../types/exposure';
import { offlineQueue } from '../lib/offlineQueue';
import uuid from 'react-native-uuid';

interface UseExposuresResult {
  // Query state
  exposures: any[] | undefined;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  nextCursor: string | null;

  // Actions
  createExposure: (draft: Omit<ExposureDraft, 'clientId'>) => Promise<Id<'exposures'> | null>;
  updateExposure: (id: Id<'exposures'>, updates: any) => Promise<void>;
  deleteExposure: (id: Id<'exposures'>) => Promise<void>;
  getExposure: (id: Id<'exposures'>) => any | undefined;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * T043: useExposures hook
 * Manages exposure data with Convex and offline support
 */
export function useExposures(): UseExposuresResult {
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Query exposures list
  const result = useQuery(api.exposures.list, { limit: 50, cursor: cursor || undefined });

  // Mutations
  const createMutation = useMutation(api.exposures.create);
  const updateMutation = useMutation(api.exposures.update);
  const deleteMutation = useMutation(api.exposures.remove);

  /**
   * Create new exposure
   * Handles offline queue if network unavailable
   */
  async function createExposure(
    draft: Omit<ExposureDraft, 'clientId'>
  ): Promise<Id<'exposures'> | null> {
    try {
      setError(null);

      // Generate client ID for offline tracking
      const clientId = uuid.v4() as string;

      const exposureDraft: ExposureDraft = {
        ...draft,
        clientId,
      };

      // Try to create in Convex
      try {
        const exposureId = await createMutation({
          clientId,
          exposureType: draft.exposureType,
          timestamp: draft.timestamp,
          duration: draft.duration,
          location: draft.location,
          severity: draft.severity,
          ppe: draft.ppe,
          workActivity: draft.workActivity,
          notes: draft.notes,
          chemicalName: draft.chemicalName,
          sdsReference: draft.sdsReference,
          controlMeasures: draft.controlMeasures,
          photoIds: [], // Photos uploaded separately
          voiceTranscription: draft.voiceTranscription,
        });

        return exposureId;
      } catch (networkError) {
        // If network error, add to offline queue
        console.warn('Network error, adding to offline queue:', networkError);
        offlineQueue.add(exposureDraft);
        return null; // Return null to indicate queued for sync
      }
    } catch (err) {
      console.error('Error creating exposure:', err);
      setError(err instanceof Error ? err : new Error('Failed to create exposure'));
      return null;
    }
  }

  /**
   * Update existing exposure
   */
  async function updateExposure(id: Id<'exposures'>, updates: any): Promise<void> {
    try {
      setError(null);
      await updateMutation({ id, ...updates });
    } catch (err) {
      console.error('Error updating exposure:', err);
      setError(err instanceof Error ? err : new Error('Failed to update exposure'));
      throw err;
    }
  }

  /**
   * Delete exposure (soft delete)
   */
  async function deleteExposure(id: Id<'exposures'>): Promise<void> {
    try {
      setError(null);
      await deleteMutation({ id });
    } catch (err) {
      console.error('Error deleting exposure:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete exposure'));
      throw err;
    }
  }

  /**
   * Get single exposure by ID
   */
  function getExposure(id: Id<'exposures'>): any | undefined {
    // Note: This should use a separate query in production
    // For now, find in the list
    return result?.exposures?.find((e: any) => e._id === id);
  }

  /**
   * Load more exposures (pagination)
   */
  function loadMore() {
    if (result?.nextCursor) {
      setCursor(result.nextCursor);
    }
  }

  /**
   * Refresh list (reset cursor)
   */
  function refresh() {
    setCursor(null);
    setError(null);
  }

  return {
    exposures: result?.exposures,
    isLoading: result === undefined,
    error,
    hasMore: result?.hasMore ?? false,
    nextCursor: result?.nextCursor ?? null,
    createExposure,
    updateExposure,
    deleteExposure,
    getExposure,
    loadMore,
    refresh,
  };
}

/**
 * Hook for single exposure by ID
 */
export function useExposure(id: Id<'exposures'> | null) {
  const exposure = useQuery(api.exposures.get, id ? { id } : 'skip');

  return {
    exposure,
    isLoading: exposure === undefined,
  };
}
