/**
 * User Type Definitions
 * User profile and preferences structures
 */

import { Id } from 'convex/_generated/dataModel';

export interface UserPreferences {
  defaultSiteLocation: string | null; // Site name for quick entry
  enableVoiceEntry: boolean;
  includeMapInPDF: boolean;
  notificationsEnabled: boolean;
}

export interface User {
  _id: Id<'users'>;
  clerkId: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  occupation: string | null;
  employer: string | null;
  profilePhotoUrl: string | null;
  preferences: UserPreferences;
  isDeleted: boolean;
  deletedAt: number | null;
  _creationTime: number;
}

// User profile update payload
export interface UserProfileUpdate {
  name?: string;
  phoneNumber?: string;
  occupation?: string;
  employer?: string;
}

// User preferences update payload
export interface UserPreferencesUpdate {
  defaultSiteLocation?: string | null;
  enableVoiceEntry?: boolean;
  includeMapInPDF?: boolean;
  notificationsEnabled?: boolean;
}

// Saved location for quick entry
export interface SavedLocation {
  _id: Id<'locations'>;
  userId: Id<'users'>;
  siteName: string;
  address: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  isActive: boolean;
  exposureCount: number; // How many times used
  lastUsedAt: number | null;
  createdAt: number;
}

// Educational content
export interface EducationalContent {
  _id: Id<'educationalContent'>;
  title: string;
  exposureType: string;
  content: string;
  thumbnailUrl: string | null;
  mediaUrls: string[];
  source: string;
  sourceUrl: string | null;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  publishedAt: number | null;
  updatedAt: number;
  _creationTime: number;
}

// Hazard scan result from AI vision
export interface HazardScanResult {
  _id: Id<'hazardScans'>;
  photoId: Id<'photos'>;
  exposureId: Id<'exposures'>;
  userId: Id<'users'>;
  detectedHazards: DetectedHazard[];
  suggestedExposureType: string | null;
  suggestedPPE: string[];
  aiModel: string;
  processingTime: number;
  userAccepted: boolean | null;
  processedAt: number;
  _creationTime: number;
}

export interface DetectedHazard {
  type: string;
  confidence: number; // 0-1
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  description: string;
}
