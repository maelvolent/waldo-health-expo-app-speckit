# Data Model: Waldo Health

**Date**: 2025-11-06
**Backend**: Convex (NoSQL document store)
**Source**: Derived from spec.md Key Entities section

---

## Overview

This document defines the data models for Waldo Health exposure documentation system. All entities are stored in Convex with TypeScript schema validation.

**Design Principles**:
- Offline-first: All entities can be created locally and synced later
- Immutable audit trail: No deletes, only soft deletes with `isDeleted` flag
- 40-year retention: All records retained for ACC compliance
- TypeScript-first: Strict typing enforced via Convex schema

---

## Entity: User

**Purpose**: Represents a construction worker using the app to document exposures

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `clerkId`: string (unique, from Clerk authentication)
- `email`: string (from Clerk)
- `name`: string | null (optional, from Clerk)
- `phoneNumber`: string | null (optional)
- `occupation`: string | null (e.g., "Carpenter", "Concrete Finisher")
- `employer`: string | null (company name)
- `profilePhotoUrl`: string | null (from Clerk or custom upload)
- `preferences`: object
  - `defaultSiteLocation`: string | null (GPS coordinates as "lat,lng")
  - `enableVoiceEntry`: boolean (default: true)
  - `includeMapInPDF`: boolean (default: true)
  - `notificationsEnabled`: boolean (default: true)
- `isDeleted`: boolean (default: false, soft delete)
- `deletedAt`: number | null (timestamp if deleted)

**Relationships**:
- One-to-many with ExposureRecord (user has many exposure records)

**Indexes**:
- `by_clerkId`: On `clerkId` field (unique lookup from Clerk auth)
- `by_email`: On `email` field (for search/recovery)

**Validation Rules**:
- `clerkId` must be unique and non-empty
- `email` must be valid email format
- Cannot hard delete (must set `isDeleted: true`)

---

## Entity: ExposureRecord

**Purpose**: Core data model capturing workplace health exposure event

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `userId`: string (reference to User._id)
- `clientId`: string (client-generated UUID for offline deduplication)
- `timestamp`: number (device time when exposure occurred, user-editable)
- `exposureType`: string (enum from 12 categories - see constants below)
- `duration`: object
  - `hours`: number (0-24)
  - `minutes`: number (0-59)
- `location`: object
  - `latitude`: number (GPS coordinate)
  - `longitude`: number (GPS coordinate)
  - `accuracy`: number | null (meters)
  - `address`: string | null (reverse geocoded address)
  - `siteName`: string | null (user-provided site name)
- `severity`: string ("low" | "medium" | "high")
- `ppe`: string[] (multi-select checkboxes, see PPE types below)
- `workActivity`: string (description of what work was being done)
- `notes`: string | null (free text, may come from voice transcription)
- `chemicalName`: string | null (for chemical exposures)
- `sdsReference`: string | null (Safety Data Sheet reference number)
- `controlMeasures`: string | null (what safety measures were in place)
- `photoIds`: string[] (references to Photo._id, 1-5 photos)
- `syncStatus`: string ("pending" | "synced" | "failed")
- `voiceTranscription`: string | null (original voice recording transcript)
- `isDeleted`: boolean (default: false)
- `deletedAt`: number | null
- `updatedAt`: number (last modification timestamp)

**Relationships**:
- Belongs to User (many-to-one)
- One-to-many with Photo (1-5 photos per exposure)

**Indexes**:
- `by_userId`: On `userId` field (get all exposures for a user)
- `by_userId_timestamp`: On `userId` and `timestamp` (sorted by date)
- `by_exposureType`: On `exposureType` field (filter by type)
- `by_clientId`: On `clientId` field (offline deduplication)
- `by_syncStatus`: On `syncStatus` field (find pending syncs)

**Validation Rules**:
- `userId` must reference existing User
- `exposureType` must be one of 12 valid types
- `severity` must be "low", "medium", or "high"
- `ppe` array items must be from valid PPE types
- `photoIds` array must have 1-5 items (FR-003)
- `duration.hours` must be 0-24
- `duration.minutes` must be 0-59
- `location.latitude` must be -90 to 90
- `location.longitude` must be -180 to 180
- `timestamp` must be in past (not future)

**Exposure Types (12 Categories)**:
1. `silica_dust` - Silica Dust (A - Respirable Crystalline Silica)
2. `asbestos_a` - Asbestos A (Friable)
3. `asbestos_b` - Asbestos B (Non-Friable)
4. `hazardous_chemicals` - Hazardous Chemicals & Substances
5. `noise` - Noise Exposure
6. `meth` - Methamphetamine Contamination
7. `mould` - Mould & Fungal Exposure
8. `contaminated_soils` - Contaminated Soils & Fill
9. `heat_stress` - Heat Stress & Extreme Temperatures
10. `welding_fumes` - Welding Fumes & Metal Dust
11. `biological_hazards` - Biological Hazards
12. `radiation` - Radiation & UV Exposure

**PPE Types**:
- `respirator` - Respirator/Mask (P1, P2, P3)
- `gloves` - Protective Gloves
- `safety_glasses` - Safety Glasses/Goggles
- `hearing_protection` - Hearing Protection
- `coveralls` - Coveralls/Protective Clothing
- `hard_hat` - Hard Hat
- `safety_boots` - Safety Boots
- `none` - No PPE Used

---

## Entity: Photo

**Purpose**: Photo evidence attached to exposure records with EXIF metadata

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `exposureId`: string (reference to ExposureRecord._id)
- `userId`: string (reference to User._id)
- `storageId`: string (Convex file storage ID for cloud)
- `localUri`: string | null (local file:// URI before upload, cleared after sync)
- `fileName`: string (original filename)
- `fileSize`: number (bytes)
- `mimeType`: string (e.g., "image/jpeg")
- `width`: number (pixels)
- `height`: number (pixels)
- `exif`: object | null (EXIF metadata from camera)
  - `latitude`: number | null
  - `longitude`: number | null
  - `timestamp`: number | null (photo taken time from EXIF)
  - `make`: string | null (camera/phone make)
  - `model`: string | null (camera/phone model)
  - `orientation`: number | null
- `uploadStatus`: string ("pending" | "uploading" | "completed" | "failed")
- `uploadProgress`: number (0-100)
- `retryCount`: number (default: 0, max: 5)
- `uploadedAt`: number | null (timestamp when upload completed)
- `isDeleted`: boolean (default: false)
- `deletedAt`: number | null

**Relationships**:
- Belongs to ExposureRecord (many-to-one)
- Belongs to User (many-to-one)

**Indexes**:
- `by_exposureId`: On `exposureId` field (get all photos for an exposure)
- `by_userId`: On `userId` field (get all user photos)
- `by_uploadStatus`: On `uploadStatus` field (find pending uploads)

**Validation Rules**:
- `exposureId` must reference existing ExposureRecord
- `userId` must reference existing User
- `fileSize` must be > 0
- `mimeType` must be image/* (jpeg, png, heic)
- `uploadProgress` must be 0-100
- `retryCount` must be 0-5
- `storageId` required when `uploadStatus` is "completed"

**File Storage**:
- Local: Stored in expo-file-system cache until uploaded
- Cloud: Stored in Convex file storage (backed by S3 in AWS NZ region)
- EXIF preservation: Critical for legal evidence (FR-003)
- Image optimization: Resized to max 1920px width before upload

---

## Entity: EducationalContentItem

**Purpose**: Educational content about hazards and safety practices (P2 feature)

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `title`: string (e.g., "Silica Dust Safety Guidelines")
- `exposureType`: string (one of 12 exposure categories)
- `content`: string (markdown or plain text)
- `thumbnailUrl`: string | null (preview image)
- `mediaUrls`: string[] (images, PDFs, videos)
- `source`: string (e.g., "WorkSafe NZ", "ACC")
- `sourceUrl`: string | null (link to original source)
- `tags`: string[] (for search/filtering)
- `viewCount`: number (default: 0)
- `isPublished`: boolean (default: false, admin controlled)
- `publishedAt`: number | null
- `updatedAt`: number

**Relationships**:
- No direct relationships (standalone content)
- Linked to exposure types via `exposureType` field

**Indexes**:
- `by_exposureType`: On `exposureType` field (find content for exposure type)
- `by_isPublished`: On `isPublished` field (only show published)
- `by_tags`: On `tags` field (search by tag)

**Validation Rules**:
- `title` must be non-empty, max 200 characters
- `exposureType` must be one of 12 valid types or "general"
- `content` must be non-empty
- `viewCount` must be >= 0
- Only admins can set `isPublished: true`

---

## Entity: Location (Site)

**Purpose**: Saved locations/sites for quick exposure logging (P3 feature)

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `userId`: string (reference to User._id)
- `siteName`: string (user-provided name, e.g., "Queen St Construction Site")
- `address`: string (full address)
- `latitude`: number
- `longitude`: number
- `notes`: string | null (site-specific notes)
- `isActive`: boolean (default: true, can be archived)
- `exposureCount`: number (default: 0, incremented when used)
- `lastUsedAt`: number | null (timestamp of last use)
- `createdAt`: number

**Relationships**:
- Belongs to User (many-to-one)
- No direct link to ExposureRecord (soft reference via lat/lng matching)

**Indexes**:
- `by_userId`: On `userId` field (get user's saved sites)
- `by_userId_lastUsed`: On `userId` and `lastUsedAt` (recent sites first)

**Validation Rules**:
- `userId` must reference existing User
- `siteName` must be non-empty, max 100 characters
- `latitude` must be -90 to 90
- `longitude` must be -180 to 180
- `exposureCount` must be >= 0

**Usage**:
- When creating exposure, user can select saved site to auto-fill location
- Sites sorted by `lastUsedAt` for quick access
- Suggest nearby sites based on current GPS location

---

## Entity: HazardScanResult (P3 Feature)

**Purpose**: AI-powered hazard detection from photos

**Attributes**:
- `_id`: string (Convex document ID)
- `_creationTime`: number (Convex automatic timestamp)
- `photoId`: string (reference to Photo._id)
- `exposureId`: string (reference to ExposureRecord._id)
- `userId`: string (reference to User._id)
- `detectedHazards`: object[]
  - `type`: string (exposure type category)
  - `confidence`: number (0.0-1.0)
  - `boundingBox`: object | null (x, y, width, height)
  - `description`: string (what was detected)
- `suggestedExposureType`: string | null (highest confidence type)
- `suggestedPPE`: string[] (recommended PPE based on detection)
- `aiModel`: string (model version used, e.g., "gpt-4-vision-20250101")
- `processingTime`: number (milliseconds)
- `userAccepted`: boolean | null (did user accept suggestion)
- `processedAt`: number

**Relationships**:
- Belongs to Photo (one-to-one)
- Belongs to ExposureRecord (many-to-one)
- Belongs to User (many-to-one)

**Indexes**:
- `by_photoId`: On `photoId` field (unique, one scan per photo)
- `by_exposureId`: On `exposureId` field (all scans for an exposure)
- `by_userId`: On `userId` field (user's scan history)

**Validation Rules**:
- `photoId` must reference existing Photo
- `exposureId` must reference existing ExposureRecord
- `userId` must reference existing User
- `detectedHazards` array can be empty (no hazards detected)
- `confidence` must be 0.0-1.0
- `processingTime` must be > 0

**AI Processing**:
- Triggered when photo is uploaded (if user has P3 feature enabled)
- Runs asynchronously via Convex action
- Results stored for user review and learning
- User can accept/reject suggestions (tracked for model improvement)

---

## Data Relationships Diagram

```
User (1) ─────< (many) ExposureRecord
               │
               ├───< (1-5) Photo ───< (1) HazardScanResult
               │
               └───soft reference─── Location (Site)

User (1) ─────< (many) Location (Site)

EducationalContentItem (standalone, linked by exposureType)
```

---

## Offline Queue Entities

These entities exist only in local storage (MMKV) and are not synced to Convex.

### QueuedMutation

**Purpose**: Queue for offline mutations to sync when online

**Attributes**:
- `id`: string (UUID)
- `type`: "create" | "update" | "delete"
- `collection`: "exposures" | "photos" | "users" | "locations"
- `data`: object (mutation payload)
- `timestamp`: number (when queued)
- `retryCount`: number (0-5)
- `status`: "pending" | "processing" | "failed"

**Storage**: MMKV key: `mutation_queue`

### QueuedPhotoUpload

**Purpose**: Queue for photo uploads when offline

**Attributes**:
- `id`: string (UUID)
- `localUri`: string (file:// path)
- `exposureId`: string
- `uploadStatus`: "pending" | "uploading" | "completed" | "failed"
- `uploadProgress`: number (0-100)
- `retryCount`: number (0-5)

**Storage**: MMKV key: `photo_queue`

---

## Data Retention & Archival

**40-Year Retention Strategy** (ACC Act 2001 compliance):

1. **Active Records (0-5 years)**:
   - Stored in Convex database (real-time access)
   - Full sync across devices
   - Immediate query performance

2. **Archived Records (5-40 years)**:
   - Marked with `isArchived: true` in Convex
   - Photos moved to S3 Glacier for cost efficiency
   - Still accessible but slower retrieval (1-5 minutes)
   - Monthly automated archival job (Convex scheduled action)

3. **Deletion Policy**:
   - Users can request account deletion
   - All records soft-deleted (`isDeleted: true`)
   - Data retained for 40 years even if deleted (ACC requirement)
   - Hard deletion only after 40 years (automated job)

**Implementation**:
```typescript
// Convex scheduled action (runs monthly)
export const archiveOldRecords = action(async ({ runQuery, runMutation }) => {
  const fiveYearsAgo = Date.now() - (5 * 365 * 24 * 60 * 60 * 1000);

  const oldExposures = await runQuery('exposures:getOldRecords', {
    before: fiveYearsAgo
  });

  for (const exposure of oldExposures) {
    // Move photos to S3 Glacier
    for (const photoId of exposure.photoIds) {
      await runMutation('photos:archiveToGlacier', { photoId });
    }

    // Mark exposure as archived
    await runMutation('exposures:markArchived', {
      exposureId: exposure._id
    });
  }
});
```

---

## Security & Privacy

**Data Residency**:
- All data stored in AWS NZ region (ap-southeast-5)
- Convex backend self-hosted on AWS ECS Fargate in NZ
- S3 bucket in ap-southeast-5 with cross-region replication DISABLED
- Complies with NZ Privacy Act 2020

**Encryption**:
- At rest: AES-256 encryption for Convex database and S3
- In transit: TLS 1.3 for all API communication
- Photos: Encrypted in S3 with server-side encryption (SSE-S3)

**Access Control**:
- Users can only access their own data (enforced by Convex rules)
- Clerk authentication required for all operations
- Admin role for EducationalContentItem management only
- No cross-user data access

**Audit Logging**:
- All mutations logged immutably in Convex
- Include userId, timestamp, mutation type, before/after values
- Logs retained for 7 years (legal compliance)

**Data Export**:
- Users can export all their data as PDF or CSV anytime (FR-009, FR-010)
- Includes all exposure records, photos, and metadata
- GDPR/Privacy Act "Right to Access" compliance

**Data Deletion**:
- Soft delete only (isDeleted flag)
- User account deletion marks all records as deleted
- Data still retained for 40 years (ACC requirement)
- Users warned before deletion about ACC claim implications

---

## Convex Schema Definition (TypeScript)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    phoneNumber: v.union(v.string(), v.null()),
    occupation: v.union(v.string(), v.null()),
    employer: v.union(v.string(), v.null()),
    profilePhotoUrl: v.union(v.string(), v.null()),
    preferences: v.object({
      defaultSiteLocation: v.union(v.string(), v.null()),
      enableVoiceEntry: v.boolean(),
      includeMapInPDF: v.boolean(),
      notificationsEnabled: v.boolean(),
    }),
    isDeleted: v.boolean(),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  exposures: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    timestamp: v.number(),
    exposureType: v.string(),
    duration: v.object({
      hours: v.number(),
      minutes: v.number(),
    }),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      accuracy: v.union(v.number(), v.null()),
      address: v.union(v.string(), v.null()),
      siteName: v.union(v.string(), v.null()),
    }),
    severity: v.string(),
    ppe: v.array(v.string()),
    workActivity: v.string(),
    notes: v.union(v.string(), v.null()),
    chemicalName: v.union(v.string(), v.null()),
    sdsReference: v.union(v.string(), v.null()),
    controlMeasures: v.union(v.string(), v.null()),
    photoIds: v.array(v.id("photos")),
    syncStatus: v.string(),
    voiceTranscription: v.union(v.string(), v.null()),
    isDeleted: v.boolean(),
    deletedAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_timestamp", ["userId", "timestamp"])
    .index("by_exposureType", ["exposureType"])
    .index("by_clientId", ["clientId"])
    .index("by_syncStatus", ["syncStatus"]),

  photos: defineTable({
    exposureId: v.id("exposures"),
    userId: v.id("users"),
    storageId: v.string(),
    localUri: v.union(v.string(), v.null()),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    width: v.number(),
    height: v.number(),
    exif: v.union(
      v.object({
        latitude: v.union(v.number(), v.null()),
        longitude: v.union(v.number(), v.null()),
        timestamp: v.union(v.number(), v.null()),
        make: v.union(v.string(), v.null()),
        model: v.union(v.string(), v.null()),
        orientation: v.union(v.number(), v.null()),
      }),
      v.null()
    ),
    uploadStatus: v.string(),
    uploadProgress: v.number(),
    retryCount: v.number(),
    uploadedAt: v.union(v.number(), v.null()),
    isDeleted: v.boolean(),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_exposureId", ["exposureId"])
    .index("by_userId", ["userId"])
    .index("by_uploadStatus", ["uploadStatus"]),

  educationalContent: defineTable({
    title: v.string(),
    exposureType: v.string(),
    content: v.string(),
    thumbnailUrl: v.union(v.string(), v.null()),
    mediaUrls: v.array(v.string()),
    source: v.string(),
    sourceUrl: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    viewCount: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  })
    .index("by_exposureType", ["exposureType"])
    .index("by_isPublished", ["isPublished"])
    .index("by_tags", ["tags"]),

  locations: defineTable({
    userId: v.id("users"),
    siteName: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    notes: v.union(v.string(), v.null()),
    isActive: v.boolean(),
    exposureCount: v.number(),
    lastUsedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_lastUsed", ["userId", "lastUsedAt"]),

  hazardScans: defineTable({
    photoId: v.id("photos"),
    exposureId: v.id("exposures"),
    userId: v.id("users"),
    detectedHazards: v.array(
      v.object({
        type: v.string(),
        confidence: v.number(),
        boundingBox: v.union(
          v.object({
            x: v.number(),
            y: v.number(),
            width: v.number(),
            height: v.number(),
          }),
          v.null()
        ),
        description: v.string(),
      })
    ),
    suggestedExposureType: v.union(v.string(), v.null()),
    suggestedPPE: v.array(v.string()),
    aiModel: v.string(),
    processingTime: v.number(),
    userAccepted: v.union(v.boolean(), v.null()),
    processedAt: v.number(),
  })
    .index("by_photoId", ["photoId"])
    .index("by_exposureId", ["exposureId"])
    .index("by_userId", ["userId"]),
});
```

---

**Data Model Version**: 1.0
**Last Updated**: 2025-11-06
**Status**: Ready for Contract Generation
