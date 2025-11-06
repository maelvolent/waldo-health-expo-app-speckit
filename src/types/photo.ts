/**
 * Photo Type Definitions
 * Structures for photo attachments with EXIF data
 */

import { Id } from 'convex/_generated/dataModel';

export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface PhotoExif {
  latitude: number | null;
  longitude: number | null;
  timestamp: number | null;
  make: string | null; // Camera manufacturer
  model: string | null; // Camera model
  orientation: number | null; // Image orientation
}

export interface Photo {
  _id: Id<'photos'>;
  exposureId: Id<'exposures'>;
  userId: Id<'users'>;
  storageId: string; // Convex storage ID
  localUri: string | null; // Local file URI (for offline access)
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  exif: PhotoExif | null;
  uploadStatus: UploadStatus;
  uploadProgress: number; // 0-100
  retryCount: number;
  uploadedAt: number | null;
  isDeleted: boolean;
  deletedAt: number | null;
  _creationTime: number;
}

// Local photo before upload
export interface PhotoLocal {
  localUri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  exif: PhotoExif | null;
}

// Photo upload queue item
export interface PhotoUploadQueueItem {
  id: string; // UUID
  exposureClientId: string; // Links to exposure clientId
  localUri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  exif: PhotoExif | null;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  retryCount: number;
  lastAttempt: number | null;
  createdAt: number;
}

// Photo upload result
export interface PhotoUploadResult {
  success: boolean;
  storageId?: string;
  photoId?: Id<'photos'>;
  error?: string;
}
