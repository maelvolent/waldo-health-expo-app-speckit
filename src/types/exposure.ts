/**
 * Exposure Record Type Definitions
 * Core data structures for documenting workplace exposures
 */

import { Id } from 'convex/_generated/dataModel';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address: string | null;
  siteName: string | null;
}

export interface Duration {
  hours: number;
  minutes: number;
}

export interface ExposureRecord {
  _id: Id<'exposures'>;
  userId: Id<'users'>;
  clientId: string; // UUID for offline-first tracking
  timestamp: number;
  exposureType: string;
  duration: Duration;
  location: Location;
  severity: 'low' | 'medium' | 'high';
  ppe: string[]; // Array of PPE type IDs
  workActivity: string;
  notes: string | null;
  chemicalName: string | null;
  sdsReference: string | null; // Safety Data Sheet reference
  controlMeasures: string | null;
  photoIds: Id<'photos'>[];
  syncStatus: SyncStatus;
  voiceTranscription: string | null;
  isDeleted: boolean;
  deletedAt: number | null;
  updatedAt: number;
  _creationTime: number;
}

// Draft exposure (before sync to backend)
export interface ExposureDraft {
  clientId: string;
  timestamp: number;
  exposureType: string;
  duration: Duration;
  location: Location;
  severity: 'low' | 'medium' | 'high';
  ppe: string[];
  workActivity: string;
  notes: string | null;
  chemicalName: string | null;
  sdsReference: string | null;
  controlMeasures: string | null;
  photoUris: string[]; // Local URIs before upload
  voiceTranscription: string | null;
}

// Validation result
export interface ExposureValidationResult {
  isValid: boolean;
  errors: {
    field: keyof ExposureDraft;
    message: string;
  }[];
}

// Exposure filters for list view
export interface ExposureFilters {
  exposureType?: string[];
  severity?: ('low' | 'medium' | 'high')[];
  dateFrom?: number;
  dateTo?: number;
  syncStatus?: SyncStatus[];
  searchQuery?: string;
}

// Exposure statistics
export interface ExposureStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<'low' | 'medium' | 'high', number>;
  byMonth: Record<string, number>; // YYYY-MM format
  pendingSync: number;
}
