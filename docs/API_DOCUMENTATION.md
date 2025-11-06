# API Documentation

**Waldo Health Backend API Reference**
**Platform:** Convex (Serverless Backend)
**Date:** November 7, 2025
**Version:** 1.0

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Exposures API](#exposures-api)
- [Photos API](#photos-api)
- [Locations API](#locations-api)
- [Hazard Scans API](#hazard-scans-api)
- [Educational Content API](#educational-content-api)
- [Users API](#users-api)
- [Export API](#export-api)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Best Practices](#best-practices)

---

## Overview

Waldo Health uses **Convex** as its serverless backend, providing real-time data synchronization, automatic caching, and TypeScript-first API design. All backend functions are organized by domain and located in the `/convex/` directory.

### Architecture

- **Queries** - Read-only operations, automatically reactive
- **Mutations** - Write operations, transactional and atomic
- **Actions** - External API calls (OpenAI, exports)
- **Internal Mutations** - Server-only mutations (webhooks)

### Base URL

All API calls go through the Convex runtime:

```typescript
import { api } from './convex/_generated/api';
import { useQuery, useMutation, useAction } from 'convex/react';

// Example usage
const exposures = useQuery(api.exposures.list, { limit: 20 });
```

---

## Authentication

All API endpoints require authentication via **Clerk**. The authenticated user's identity is automatically injected into the context by Convex.

### Authentication Flow

```typescript
// Convex automatically provides auth context
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error('Not authenticated');
}

// Find user by Clerk ID
const user = await ctx.db
  .query('users')
  .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
  .first();
```

### User Identity Object

```typescript
{
  subject: string;        // Clerk user ID
  email?: string;         // User's email
  name?: string;          // Full name
  givenName?: string;     // First name
  pictureUrl?: string;    // Profile photo URL
}
```

---

## Exposures API

Manage workplace exposure records.

### `exposures.create`

**Type:** Mutation
**Description:** Create a new exposure record for the authenticated user.

**Arguments:**

```typescript
{
  clientId: string;                    // Unique client-side ID (for offline sync)
  exposureType: string;                // One of: silica_dust, asbestos_a, asbestos_b, hazardous_chemicals, noise, meth_contamination, mould, contaminated_soils, heat_stress, welding_fumes, biological_hazards, radiation
  timestamp: number;                   // Unix timestamp in milliseconds
  duration: {
    hours: number;                     // 0-24
    minutes: number;                   // 0-59
  };
  location: {
    latitude: number;                  // -90 to 90
    longitude: number;                 // -180 to 180
    accuracy: number | null;           // GPS accuracy in meters
    address: string | null;            // Reverse geocoded address
    siteName: string | null;           // Saved site name
  };
  severity: string;                    // One of: low, medium, high
  ppe: string[];                       // Array of PPE items used
  workActivity: string;                // Description of work being performed
  notes: string | null;                // Additional notes
  chemicalName: string | null;         // Required for hazardous_chemicals and contaminated_soils
  sdsReference: string | null;         // Safety Data Sheet reference
  controlMeasures: string | null;      // Control measures in place
  photoIds: Id<'photos'>[];            // Array of photo IDs
  voiceTranscription: string | null;   // Transcribed voice notes
}
```

**Returns:** `Id<'exposures'>` - The created exposure ID

**Example:**

```typescript
import { useMutation } from 'convex/react';
import { api } from './convex/_generated/api';

const createExposure = useMutation(api.exposures.create);

const exposureId = await createExposure({
  clientId: 'uuid-v4-here',
  exposureType: 'silica_dust',
  timestamp: Date.now(),
  duration: { hours: 2, minutes: 30 },
  location: {
    latitude: -36.8485,
    longitude: 174.7633,
    accuracy: 10,
    address: '123 Queen St, Auckland',
    siteName: 'Downtown Construction Site',
  },
  severity: 'medium',
  ppe: ['P2_RESPIRATOR', 'SAFETY_GLASSES', 'GLOVES'],
  workActivity: 'Concrete cutting',
  notes: 'Working on second floor',
  chemicalName: null,
  sdsReference: null,
  controlMeasures: 'Water suppression used',
  photoIds: [],
  voiceTranscription: null,
});
```

**Errors:**

- `Not authenticated` - User not logged in
- `Invalid exposure type` - Unknown exposure type provided
- `Hours must be between 0 and 24` - Invalid duration
- `Minutes must be between 0 and 59` - Invalid duration
- `Duration must be greater than 0` - Zero duration provided
- `Invalid latitude` - GPS coordinates out of range
- `Invalid longitude` - GPS coordinates out of range
- `Severity must be low, medium, or high` - Invalid severity
- `Chemical name is required for this exposure type` - Missing required field

---

### `exposures.list`

**Type:** Query
**Description:** List all exposures for the authenticated user with pagination.

**Arguments:**

```typescript
{
  limit?: number;      // Max 100, default 50
  cursor?: string;     // Pagination cursor (from previous response)
}
```

**Returns:**

```typescript
{
  exposures: Exposure[];     // Array of exposure records
  nextCursor: string | null; // Cursor for next page, null if no more
  hasMore: boolean;          // Whether more results exist
}
```

**Example:**

```typescript
const { exposures, nextCursor, hasMore } = useQuery(api.exposures.list, {
  limit: 20,
});

// Load next page
if (hasMore) {
  const nextPage = useQuery(api.exposures.list, {
    limit: 20,
    cursor: nextCursor,
  });
}
```

**Errors:**

- `Not authenticated` - User not logged in
- `Limit cannot exceed 100` - Limit too high

---

### `exposures.get`

**Type:** Query
**Description:** Get a single exposure record by ID.

**Arguments:**

```typescript
{
  id: Id<'exposures'>;  // Exposure ID
}
```

**Returns:** `Exposure` - Full exposure record

**Example:**

```typescript
const exposure = useQuery(api.exposures.get, {
  id: exposureId,
});
```

**Errors:**

- `Not authenticated` - User not logged in
- `Exposure not found` - ID doesn't exist
- `Not authorized to view this exposure` - Exposure belongs to another user
- `Exposure has been deleted` - Soft-deleted exposure

---

### `exposures.update`

**Type:** Mutation
**Description:** Update an existing exposure record.

**Arguments:**

```typescript
{
  id: Id<'exposures'>;
  exposureType?: string;
  duration?: { hours: number; minutes: number };
  severity?: string;
  ppe?: string[];
  workActivity?: string;
  notes?: string | null;
  chemicalName?: string | null;
  sdsReference?: string | null;
  controlMeasures?: string | null;
}
```

**Returns:** `Id<'exposures'>` - The updated exposure ID

**Example:**

```typescript
const updateExposure = useMutation(api.exposures.update);

await updateExposure({
  id: exposureId,
  severity: 'high',
  notes: 'Updated notes about the exposure',
});
```

**Errors:**

- `Not authenticated` - User not logged in
- `Exposure not found` - ID doesn't exist
- `Not authorized to update this exposure` - Exposure belongs to another user
- `Cannot update deleted exposure` - Soft-deleted exposure

---

### `exposures.remove`

**Type:** Mutation
**Description:** Soft delete an exposure record.

**Arguments:**

```typescript
{
  id: Id<'exposures'>;  // Exposure ID to delete
}
```

**Returns:** `Id<'exposures'>` - The deleted exposure ID

**Example:**

```typescript
const removeExposure = useMutation(api.exposures.remove);

await removeExposure({ id: exposureId });
```

**Errors:**

- `Not authenticated` - User not logged in
- `Exposure not found` - ID doesn't exist
- `Not authorized to delete this exposure` - Exposure belongs to another user

---

## Photos API

Manage photo uploads and metadata.

### `photos.generateUploadUrl`

**Type:** Mutation
**Description:** Generate a presigned upload URL for uploading a photo to Convex storage.

**Arguments:**

```typescript
{
  exposureId: Id<'exposures'>;  // Exposure this photo belongs to
  fileName: string;              // Original file name
  fileSize: number;              // File size in bytes (max 10MB)
  mimeType: string;              // image/jpeg, image/jpg, or image/png
}
```

**Returns:** `string` - Presigned upload URL

**Example:**

```typescript
const generateUploadUrl = useMutation(api.photos.generateUploadUrl);

// 1. Generate upload URL
const uploadUrl = await generateUploadUrl({
  exposureId: exposureId,
  fileName: 'photo.jpg',
  fileSize: 2048576, // 2MB
  mimeType: 'image/jpeg',
});

// 2. Upload file to URL
const response = await fetch(uploadUrl, {
  method: 'POST',
  body: photoBlob,
});

const { storageId } = await response.json();

// 3. Confirm upload
await confirmUpload({
  exposureId,
  storageId,
  fileName: 'photo.jpg',
  fileSize: 2048576,
  mimeType: 'image/jpeg',
  width: 1920,
  height: 1080,
  exif: null,
});
```

**Errors:**

- `Not authenticated` - User not logged in
- `Exposure not found` - Invalid exposure ID
- `Not authorized to upload photos for this exposure` - Exposure belongs to another user
- `File size exceeds 10MB limit` - File too large
- `Invalid file type` - Only JPEG and PNG supported
- `Maximum 5 photos per exposure` - Photo limit reached

---

### `photos.confirmUpload`

**Type:** Mutation
**Description:** Confirm successful photo upload and save metadata.

**Arguments:**

```typescript
{
  exposureId: Id<'exposures'>;
  storageId: string;              // From upload response
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;                  // Image width in pixels
  height: number;                 // Image height in pixels
  exif: {
    latitude: number | null;      // GPS latitude from EXIF
    longitude: number | null;     // GPS longitude from EXIF
    timestamp: number | null;     // Photo timestamp from EXIF
    make: string | null;          // Camera manufacturer
    model: string | null;         // Camera model
    orientation: number | null;   // Image orientation (1-8)
  } | null;
}
```

**Returns:** `Id<'photos'>` - The created photo ID

**Errors:**

- `Not authenticated` - User not logged in
- `Exposure not found` - Invalid exposure ID
- `Not authorized to add photos to this exposure` - Exposure belongs to another user
- `Image dimensions exceed 4096px limit` - Image too large
- `Invalid image dimensions` - Width or height <= 0
- `Invalid EXIF latitude` - GPS coordinates out of range
- `Invalid EXIF longitude` - GPS coordinates out of range

---

### `photos.list`

**Type:** Query
**Description:** List all photos for an exposure.

**Arguments:**

```typescript
{
  exposureId: Id<'exposures'>;  // Exposure ID
}
```

**Returns:** `Photo[]` - Array of photo records (excluding soft-deleted)

**Example:**

```typescript
const photos = useQuery(api.photos.list, {
  exposureId: exposureId,
});
```

---

### `photos.getUrl`

**Type:** Query
**Description:** Get the public URL for a photo.

**Arguments:**

```typescript
{
  storageId: string;  // Photo's storage ID
}
```

**Returns:** `string` - Public photo URL

**Example:**

```typescript
const photoUrl = useQuery(api.photos.getUrl, {
  storageId: photo.storageId,
});
```

---

### `photos.getPhotoUrls`

**Type:** Query
**Description:** Batch fetch URLs for multiple photos (used for PDF export).

**Arguments:**

```typescript
{
  photoIds: Id<'photos'>[];  // Array of photo IDs
}
```

**Returns:**

```typescript
Array<{
  photoId: Id<'photos'>;
  url: string;
  storageId: string;
  fileName: string;
  width: number;
  height: number;
}>
```

---

### `photos.getDownloadUrl`

**Type:** Query
**Description:** Get a temporary download URL for photo export (1-hour expiration).

**Arguments:**

```typescript
{
  photoId: Id<'photos'>;  // Photo ID
}
```

**Returns:**

```typescript
{
  photoId: Id<'photos'>;
  url: string;            // Temporary download URL
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  expiresIn: number;      // Seconds until expiration (3600)
  expiresAt: number;      // Timestamp when URL expires
}
```

---

### `photos.remove`

**Type:** Mutation
**Description:** Soft delete a photo and remove it from the exposure's photoIds array.

**Arguments:**

```typescript
{
  id: Id<'photos'>;  // Photo ID to delete
}
```

**Returns:** `Id<'photos'>` - The deleted photo ID

**Errors:**

- `Not authenticated` - User not logged in
- `Photo not found` - Invalid photo ID
- `Not authorized to delete this photo` - Photo belongs to another user

---

## Locations API

Manage saved work sites for quick exposure entry.

### `locations.list`

**Type:** Query
**Description:** List all active saved locations for a user, sorted by most recently used.

**Arguments:**

```typescript
{
  userId: Id<'users'>;  // User ID
}
```

**Returns:** `Location[]` - Array of saved location records

**Example:**

```typescript
const locations = useQuery(api.locations.list, {
  userId: currentUser._id,
});
```

---

### `locations.get`

**Type:** Query
**Description:** Get a single saved location by ID.

**Arguments:**

```typescript
{
  locationId: Id<'locations'>;  // Location ID
}
```

**Returns:** `Location` - Location record

---

### `locations.create`

**Type:** Mutation
**Description:** Create a new saved location. If a location with the same name exists, it updates that instead.

**Arguments:**

```typescript
{
  userId: Id<'users'>;
  siteName: string;           // Descriptive site name
  address: string;            // Full address
  latitude: number;           // GPS latitude
  longitude: number;          // GPS longitude
  notes: string | null;       // Additional notes
}
```

**Returns:** `Id<'locations'>` - The created or updated location ID

**Example:**

```typescript
const createLocation = useMutation(api.locations.create);

const locationId = await createLocation({
  userId: currentUser._id,
  siteName: 'Downtown Construction Site',
  address: '123 Queen St, Auckland',
  latitude: -36.8485,
  longitude: 174.7633,
  notes: 'Main entrance on Queen St',
});
```

---

### `locations.update`

**Type:** Mutation
**Description:** Update a saved location.

**Arguments:**

```typescript
{
  locationId: Id<'locations'>;
  siteName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string | null;
}
```

**Returns:** `{ success: boolean }`

---

### `locations.remove`

**Type:** Mutation
**Description:** Soft delete a saved location (marks as inactive).

**Arguments:**

```typescript
{
  locationId: Id<'locations'>;  // Location ID
}
```

**Returns:** `{ success: boolean }`

---

### `locations.suggestNearby`

**Type:** Query
**Description:** Find saved locations within a specified radius of given coordinates using the Haversine formula.

**Arguments:**

```typescript
{
  userId: Id<'users'>;
  latitude: number;              // Current GPS latitude
  longitude: number;             // Current GPS longitude
  radiusMeters?: number;         // Search radius in meters (default: 50)
}
```

**Returns:**

```typescript
Array<Location & { distance: number }>  // Sorted by distance (closest first)
```

**Example:**

```typescript
const nearbySites = useQuery(api.locations.suggestNearby, {
  userId: currentUser._id,
  latitude: -36.8485,
  longitude: 174.7633,
  radiusMeters: 100, // 100 meters
});

// nearbySites[0] = closest site with distance in meters
```

---

### `locations.incrementUsage`

**Type:** Mutation
**Description:** Increment usage count when a location is used for an exposure (updates lastUsedAt).

**Arguments:**

```typescript
{
  locationId: Id<'locations'>;  // Location ID
}
```

**Returns:** `{ success: boolean }`

---

## Hazard Scans API

AI-powered hazard detection from exposure photos using GPT-4 Vision.

### `hazardScans.analyze`

**Type:** Action
**Description:** Analyze a photo for workplace hazards using OpenAI GPT-4 Vision API.

**Arguments:**

```typescript
{
  photoId: Id<'photos'>;        // Photo to analyze
  exposureId: Id<'exposures'>;  // Associated exposure
  photoUrl: string;             // Public photo URL or base64 data URI
}
```

**Returns:**

```typescript
{
  success: boolean;
  scanId?: Id<'hazardScans'>;    // Scan result ID (if success)
  detectedHazards?: Array<{
    type: string;                 // Exposure type detected
    confidence: number;           // 0.0 - 1.0
    description: string;          // What was detected
    boundingBox: {                // Coordinates in image (if applicable)
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  }>;
  suggestedExposureType?: string | null;  // Most likely exposure type
  suggestedPPE?: string[];                 // Recommended PPE
  overallAssessment?: string;              // AI summary
  processingTime: number;                  // Milliseconds
  error?: string;                          // Error message (if failed)
}
```

**Example:**

```typescript
const analyzeHazard = useAction(api.hazardScans.analyze);

const result = await analyzeHazard({
  photoId: photoId,
  exposureId: exposureId,
  photoUrl: publicPhotoUrl,
});

if (result.success) {
  console.log('Detected hazards:', result.detectedHazards);
  console.log('Suggested exposure type:', result.suggestedExposureType);
  console.log('Recommended PPE:', result.suggestedPPE);
}
```

**Errors:**

- `OPENAI_API_KEY not configured` - Environment variable missing
- `AI API failed: [status]` - OpenAI API error
- `No response from AI model` - Empty response
- `Invalid AI response format` - JSON parsing failed
- `Exposure not found` - Invalid exposure ID

---

### `hazardScans.getByPhoto`

**Type:** Query
**Description:** Get the AI scan result for a specific photo.

**Arguments:**

```typescript
{
  photoId: Id<'photos'>;  // Photo ID
}
```

**Returns:** `HazardScan | null` - Scan result or null if not scanned

---

### `hazardScans.getByExposure`

**Type:** Query
**Description:** Get all AI scan results for an exposure.

**Arguments:**

```typescript
{
  exposureId: Id<'exposures'>;  // Exposure ID
}
```

**Returns:** `HazardScan[]` - Array of scan results

---

### `hazardScans.updateAcceptance`

**Type:** Mutation
**Description:** Record whether the user accepted the AI's suggestion.

**Arguments:**

```typescript
{
  scanId: Id<'hazardScans'>;  // Scan ID
  accepted: boolean;           // Did user accept suggestion?
}
```

**Returns:** `{ success: boolean }`

**Example:**

```typescript
const updateAcceptance = useMutation(api.hazardScans.updateAcceptance);

await updateAcceptance({
  scanId: scanId,
  accepted: true, // User accepted the AI suggestion
});
```

---

## Educational Content API

Access educational articles about workplace hazards.

### `educationalContent.list`

**Type:** Query
**Description:** List educational content with optional filtering by exposure type and tags.

**Arguments:**

```typescript
{
  exposureType?: string;    // Filter by exposure type (or "general")
  tags?: string[];          // Filter by tags (match any)
  limit?: number;           // Max results (default 50)
}
```

**Returns:** `EducationalContent[]` - Array of published articles, sorted by view count

**Example:**

```typescript
// Get all silica dust content
const silicaContent = useQuery(api.educationalContent.list, {
  exposureType: 'silica_dust',
  limit: 10,
});

// Get content by tags
const ppeContent = useQuery(api.educationalContent.list, {
  tags: ['ppe', 'safety'],
});
```

---

### `educationalContent.get`

**Type:** Query
**Description:** Get a single educational content item by ID.

**Arguments:**

```typescript
{
  id: Id<'educationalContent'>;  // Content ID
}
```

**Returns:** `EducationalContent` - Full article content

**Errors:**

- `Educational content not found` - Invalid ID
- `Content not available` - Not published

---

### `educationalContent.incrementViewCount`

**Type:** Mutation
**Description:** Increment view count when a user views the article.

**Arguments:**

```typescript
{
  id: Id<'educationalContent'>;  // Content ID
}
```

**Returns:** `{ success: boolean; newViewCount: number }`

---

## Users API

Manage user profiles and preferences.

### `users.get`

**Type:** Query
**Description:** Get the current authenticated user's profile.

**Arguments:** None

**Returns:** `User | null` - User profile or null if not found

**Example:**

```typescript
const currentUser = useQuery(api.users.get);

if (currentUser) {
  console.log('User email:', currentUser.email);
  console.log('Preferences:', currentUser.preferences);
}
```

---

### `users.getOrCreate`

**Type:** Mutation
**Description:** Auto-create user on first login if they don't exist in Convex.

**Arguments:** None

**Returns:** `User` - User profile

**Example:**

```typescript
const getOrCreateUser = useMutation(api.users.getOrCreate);

// Call on app startup to ensure user exists
const user = await getOrCreateUser();
```

---

### `users.getByClerkId`

**Type:** Query
**Description:** Get user by Clerk ID (for internal use).

**Arguments:**

```typescript
{
  clerkId: string;  // Clerk user ID
}
```

**Returns:** `User | null`

---

### `users.updateProfile`

**Type:** Mutation
**Description:** Update user profile information.

**Arguments:**

```typescript
{
  name?: string;
  phoneNumber?: string;
  occupation?: string;
  employer?: string;
}
```

**Returns:** `Id<'users'>` - Updated user ID

**Example:**

```typescript
const updateProfile = useMutation(api.users.updateProfile);

await updateProfile({
  name: 'John Smith',
  phoneNumber: '+64 21 123 4567',
  occupation: 'Construction Worker',
  employer: 'ABC Construction Ltd',
});
```

---

### `users.updatePreferences`

**Type:** Mutation
**Description:** Update user app preferences.

**Arguments:**

```typescript
{
  defaultSiteLocation?: string | null;
  enableVoiceEntry?: boolean;
  includeMapInPDF?: boolean;
  notificationsEnabled?: boolean;
}
```

**Returns:** `Id<'users'>` - Updated user ID

**Example:**

```typescript
const updatePreferences = useMutation(api.users.updatePreferences);

await updatePreferences({
  enableVoiceEntry: true,
  includeMapInPDF: false,
  notificationsEnabled: true,
});
```

---

### `users.getStats`

**Type:** Query
**Description:** Get user's exposure statistics.

**Arguments:** None

**Returns:**

```typescript
{
  total: number;                       // Total exposures
  byType: Record<string, number>;      // Count by exposure type
  bySeverity: {                        // Count by severity
    low: number;
    medium: number;
    high: number;
  };
  pendingSync: number;                 // Exposures not yet synced
}
```

**Example:**

```typescript
const stats = useQuery(api.users.getStats);

console.log(`Total exposures: ${stats.total}`);
console.log(`High severity: ${stats.bySeverity.high}`);
```

---

### `users.deleteAccount`

**Type:** Mutation
**Description:** Soft delete user account and all associated data.

**Arguments:** None

**Returns:** `Id<'users'>` - Deleted user ID

**Example:**

```typescript
const deleteAccount = useMutation(api.users.deleteAccount);

// Warning: This deletes all user data!
await deleteAccount();
```

---

## Export API

Server-side export generation (fallback if client-side fails).

### `exports.generateExport`

**Type:** Action
**Description:** Generate PDF or CSV exports on the server.

**Arguments:**

```typescript
{
  format: 'pdf' | 'csv' | 'csv-summary';
  exposureIds: Id<'exposures'>[];
  userInfo: {
    name: string | null;
    email: string;
    phoneNumber: string | null;
    occupation: string | null;
    employer: string | null;
  };
}
```

**Returns:**

```typescript
{
  success: boolean;
  message: string;
  format: string;
  exposureCount: number;
  data?: string;  // CSV data (for csv and csv-summary formats)
}
```

**Example:**

```typescript
const generateExport = useAction(api.exports.generateExport);

const result = await generateExport({
  format: 'csv',
  exposureIds: [id1, id2, id3],
  userInfo: {
    name: 'John Smith',
    email: 'john@example.com',
    phoneNumber: '+64 21 123 4567',
    occupation: 'Construction Worker',
    employer: 'ABC Construction',
  },
});

if (result.success && result.data) {
  // Download CSV
  const blob = new Blob([result.data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  // ... trigger download
}
```

**Errors:**

- `Not authenticated` - User not logged in
- `User not found` - Invalid user
- `No valid exposures found for export` - All exposure IDs invalid

---

## Error Handling

### Standard Error Format

All Convex functions throw errors with descriptive messages:

```typescript
try {
  await createExposure({ ... });
} catch (error) {
  console.error('Error creating exposure:', error.message);
  // Display user-friendly error message
}
```

### Common Errors

| Error Message | Description | Solution |
|---------------|-------------|----------|
| `Not authenticated` | User not logged in | Redirect to login |
| `User not found` | User doesn't exist in Convex | Call `users.getOrCreate` |
| `Not authorized to ...` | User doesn't own the resource | Check ownership before operations |
| `... not found` | Resource ID doesn't exist | Verify ID is correct |
| `... has been deleted` | Resource is soft-deleted | Treat as not found |
| `Limit cannot exceed 100` | Pagination limit too high | Reduce limit to <= 100 |
| `File size exceeds 10MB limit` | Photo too large | Resize before upload |
| `Maximum 5 photos per exposure` | Photo limit reached | Delete old photos first |
| `Invalid exposure type` | Unknown exposure type | Use valid type from schema |
| `OPENAI_API_KEY not configured` | Missing environment variable | Configure API key |

---

## Rate Limits

Convex applies automatic rate limiting to prevent abuse:

- **Queries:** Unlimited (cached and reactive)
- **Mutations:** 1000 per minute per user
- **Actions:** 100 per minute per user (external API calls)
- **AI Scans:** 50 per hour per user (OpenAI rate limits)

### Handling Rate Limits

```typescript
try {
  await analyzeHazard({ ... });
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Show user a message to wait
    alert('Please wait before trying again');
  }
}
```

---

## Best Practices

### 1. Use Reactive Queries

Convex queries are automatically reactive - they update in real-time:

```typescript
// ✅ Good: Automatically updates when data changes
const exposures = useQuery(api.exposures.list, { limit: 20 });

// ❌ Bad: Manual polling
setInterval(() => {
  fetchExposures();
}, 5000);
```

### 2. Batch Operations

Batch multiple reads into a single query:

```typescript
// ✅ Good: Single query
const photoUrls = useQuery(api.photos.getPhotoUrls, {
  photoIds: [id1, id2, id3, id4, id5],
});

// ❌ Bad: Multiple queries
const url1 = useQuery(api.photos.getUrl, { storageId: id1 });
const url2 = useQuery(api.photos.getUrl, { storageId: id2 });
// ...
```

### 3. Handle Offline Mode

Store data locally and sync when online:

```typescript
import { useMutation } from 'convex/react';
import NetInfo from '@react-native-community/netinfo';

const createExposure = useMutation(api.exposures.create);

// Save locally
await AsyncStorage.setItem('pending_exposure', JSON.stringify(data));

// Sync when online
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncPendingExposures();
  }
});
```

### 4. Optimize Image Uploads

Resize images before uploading:

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

// Resize to max 2048x2048
const resized = await ImageManipulator.manipulateAsync(
  uri,
  [{ resize: { width: 2048 } }],
  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
);

// Then upload
const uploadUrl = await generateUploadUrl({
  exposureId,
  fileName: 'photo.jpg',
  fileSize: resized.fileSize,
  mimeType: 'image/jpeg',
});
```

### 5. Use Pagination

Always paginate large lists:

```typescript
const [exposures, setExposures] = useState([]);
const [cursor, setCursor] = useState(null);

const { exposures: newExposures, nextCursor } = useQuery(
  api.exposures.list,
  { limit: 20, cursor }
);

// Append to existing list
useEffect(() => {
  if (newExposures) {
    setExposures(prev => [...prev, ...newExposures]);
    setCursor(nextCursor);
  }
}, [newExposures]);
```

### 6. Cache AI Results

Don't re-scan the same photo:

```typescript
// Check if already scanned
const existingScan = useQuery(api.hazardScans.getByPhoto, { photoId });

if (!existingScan) {
  // Only scan if no result exists
  const result = await analyzeHazard({ photoId, exposureId, photoUrl });
}
```

### 7. Type Safety

Always use generated types:

```typescript
import { Id } from './convex/_generated/dataModel';
import { api } from './convex/_generated/api';

// ✅ Good: Type-safe
const exposureId: Id<'exposures'> = '...';
const exposure = useQuery(api.exposures.get, { id: exposureId });

// ❌ Bad: No type checking
const exposure = useQuery(api.exposures.get, { id: 'random-string' });
```

---

## Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Authentication](https://clerk.com/docs)
- [OpenAI GPT-4 Vision API](https://platform.openai.com/docs/guides/vision)
- [Waldo Health Project README](../README.md)
- [Database Schema](../convex/schema.ts)

---

**Questions or Issues?**

Contact: support@waldohealth.com

---

**Generated:** November 7, 2025
**Version:** 1.0
**Last Updated:** Phase 9 (T127)
