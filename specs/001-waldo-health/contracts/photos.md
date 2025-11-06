# Photos API Contract

**Entity**: Photo
**Backend**: Convex Mutations, Queries, and File Storage
**Date**: 2025-11-06

---

## Queries

### `photos:list`

**Purpose**: Get all photos for current user

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;
  limit?: number;           // Default 50, max 100
  cursor?: string;          // For pagination
  filter?: {
    exposureId?: string;    // Filter by specific exposure
    uploadStatus?: "pending" | "uploading" | "completed" | "failed";
  };
}
```

**Output**:
```typescript
{
  photos: Photo[];
  nextCursor: string | null;
  totalCount: number;
}
```

---

### `photos:getByExposure`

**Purpose**: Get all photos for specific exposure record

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;
}
```

**Output**:
```typescript
Photo[]
```

**Errors**:
- `403 Forbidden`: Exposure belongs to different user

---

### `photos:getPendingUploads`

**Purpose**: Get all photos pending upload for current user (for sync status UI)

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;
}
```

**Output**:
```typescript
{
  pending: Photo[];          // uploadStatus === "pending"
  uploading: Photo[];        // uploadStatus === "uploading"
  failed: Photo[];           // uploadStatus === "failed"
  totalPending: number;
}
```

---

### `photos:getDownloadUrl`

**Purpose**: Get temporary download URL for photo

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  photoId: string;
}
```

**Output**:
```typescript
{
  url: string;               // Temporary download URL (expires in 1 hour)
  expiresAt: number;         // Timestamp
}
```

**Use Case**: Display photo in app or include in PDF export

**Errors**:
- `403 Forbidden`: Photo belongs to different user
- `404 Not Found`: Photo doesn't exist or not uploaded yet

---

## Mutations

### `photos:generateUploadUrl`

**Purpose**: Generate presigned URL for photo upload

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;
  fileName: string;
  fileSize: number;          // Bytes
  mimeType: string;          // e.g., "image/jpeg"
}
```

**Validation**:
- `fileSize` must be > 0 and < 10MB
- `mimeType` must be image/* (jpeg, png, heic)
- User must own the exposure

**Output**:
```typescript
{
  uploadUrl: string;         // Presigned S3 upload URL
  photoId: string;           // Convex document ID (created pending)
  expiresAt: number;         // Upload URL expires in 15 minutes
}
```

**Implementation**:
1. Creates Photo document with `uploadStatus: "pending"`
2. Generates presigned S3 upload URL to AWS NZ region
3. Returns URL to client for direct upload
4. Client uploads file directly to S3
5. Client calls `photos:confirmUpload` when done

---

### `photos:confirmUpload`

**Purpose**: Confirm photo upload completed and save metadata

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  photoId: string;
  storageId: string;         // S3 object key or Convex storage ID
  width: number;             // Pixels
  height: number;            // Pixels
  exif?: {
    latitude?: number | null;
    longitude?: number | null;
    timestamp?: number | null;
    make?: string | null;
    model?: string | null;
    orientation?: number | null;
  };
}
```

**Output**:
```typescript
{
  photoId: string;
  uploadStatus: "completed";
  uploadedAt: number;
}
```

**Errors**:
- `403 Forbidden`: Photo belongs to different user
- `404 Not Found`: Photo doesn't exist
- `400 Bad Request`: Invalid storageId or metadata

---

### `photos:updateMetadata`

**Purpose**: Update photo EXIF metadata or other properties

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  photoId: string;
  updates: Partial<{
    exif: {
      latitude?: number | null;
      longitude?: number | null;
      timestamp?: number | null;
      make?: string | null;
      model?: string | null;
      orientation?: number | null;
    };
  }>;
}
```

**Output**:
```typescript
{
  photoId: string;
  updatedAt: number;
}
```

**Use Case**: Update EXIF data if not captured initially or if user manually edits location

---

### `photos:retryUpload`

**Purpose**: Reset failed upload to allow retry

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  photoId: string;
}
```

**Output**:
```typescript
{
  photoId: string;
  uploadStatus: "pending";
  retryCount: number;
}
```

**Validation**:
- `retryCount` must be < 5 (max 5 retries)

**Errors**:
- `400 Bad Request`: Max retries exceeded (5)

---

### `photos:softDelete`

**Purpose**: Soft delete photo (sets isDeleted flag)

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  photoId: string;
}
```

**Output**:
```typescript
{
  photoId: string;
  isDeleted: true;
  deletedAt: number;
}
```

**Note**: Photo file remains in S3 for 40-year retention. Only metadata marked as deleted.

**Side Effect**: Removes photoId from associated ExposureRecord.photoIds array

---

## Actions

### `photos:archiveToGlacier`

**Purpose**: Move old photos (5+ years) to S3 Glacier for cost savings

**Auth**: Internal (scheduled action only, not user-accessible)

**Input**:
```typescript
{
  photoId: string;
}
```

**Output**:
```typescript
{
  photoId: string;
  archived: true;
  glacierStorageId: string;
}
```

**Implementation**:
- Runs monthly via Convex scheduled action
- Moves S3 object to Glacier Deep Archive storage class
- Updates Photo document with glacier reference
- Photo still retrievable but slower (1-5 minutes)

---

## File Upload Flow

**Complete Upload Process**:

1. **Client prepares upload**:
   ```typescript
   // Optimize photo before upload
   const optimized = await ImageManipulator.manipulateAsync(
     localUri,
     [{ resize: { width: 1920 } }],
     { compress: 0.8, format: 'jpeg' }
   );
   ```

2. **Client requests upload URL**:
   ```typescript
   const { uploadUrl, photoId, expiresAt } = await convex.mutation(
     'photos:generateUploadUrl',
     {
       exposureId: 'exposure123',
       fileName: 'exposure-photo-1.jpg',
       fileSize: 2500000, // 2.5 MB
       mimeType: 'image/jpeg',
     }
   );
   ```

3. **Client uploads directly to S3**:
   ```typescript
   const uploadResult = await FileSystem.uploadAsync(uploadUrl, optimized.uri, {
     httpMethod: 'POST',
     uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
     headers: { 'Content-Type': 'image/jpeg' },
   });
   ```

4. **Client confirms upload**:
   ```typescript
   await convex.mutation('photos:confirmUpload', {
     photoId: photoId,
     storageId: uploadResult.body, // S3 object key from response
     width: optimized.width,
     height: optimized.height,
     exif: extractedExif,
   });
   ```

5. **Photo now available**:
   ```typescript
   const { url } = await convex.query('photos:getDownloadUrl', {
     photoId: photoId,
   });
   // Display photo in app
   ```

---

## Offline Upload Queue

**Client-Side Implementation**:

```typescript
interface QueuedPhotoUpload {
  id: string;                // UUID
  localUri: string;          // file:// path
  exposureId: string;
  uploadStatus: "pending" | "uploading" | "completed" | "failed";
  uploadProgress: number;    // 0-100
  retryCount: number;        // 0-5
}

class PhotoUploadQueue {
  // Add photo to queue
  enqueue(localUri: string, exposureId: string): void;

  // Process queue when online
  async processQueue(): Promise<void>;

  // Get status for UI
  getStatus(): {
    pending: number;
    uploading: number;
    failed: number;
  };
}
```

**Upload Retry Logic**:
- Retry exponentially: 1s, 2s, 4s, 8s, 16s
- Max 5 retries
- After 5 failed attempts, show error to user
- User can manually retry from UI

---

## EXIF Metadata Handling

**Critical Requirements** (FR-003):
- EXIF data must be preserved for legal evidence
- GPS coordinates from EXIF used if device GPS unavailable
- Timestamp from EXIF validates exposure timestamp

**Implementation**:

```typescript
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import ExifReader from 'exifreader';

const extractExif = async (uri: string) => {
  const fileInfo = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const tags = ExifReader.load(Buffer.from(fileInfo, 'base64'));

  return {
    latitude: tags.GPSLatitude?.description || null,
    longitude: tags.GPSLongitude?.description || null,
    timestamp: tags.DateTimeOriginal?.description || null,
    make: tags.Make?.description || null,
    model: tags.Model?.description || null,
    orientation: tags.Orientation?.value || null,
  };
};
```

**EXIF Preservation**:
- When optimizing photos, use `expo-image-manipulator` with EXIF preservation
- Upload original EXIF data in `photos:confirmUpload`
- Store EXIF in Convex database for queries
- Include EXIF in PDF exports for legal documentation

---

## Storage Strategy

**Local Storage (Device)**:
- Photos stored in expo-file-system cache until uploaded
- Path: `${FileSystem.cacheDirectory}exposures/photos/`
- Cleared after successful upload (to save space)
- Retained if upload fails (for retry)

**Cloud Storage (AWS S3)**:
- S3 bucket in AWS NZ region (ap-southeast-5)
- Lifecycle policy:
  - 0-5 years: S3 Standard (fast access)
  - 5-40 years: S3 Glacier Deep Archive (cost-effective, slower retrieval)
- Encryption: SSE-S3 (server-side encryption)
- Versioning: Disabled (immutable files)
- Object Lock: Enabled for 40-year retention

**Cost Estimation**:
- 500 photos/user/year × 2MB avg = 1GB/user/year
- S3 Standard: $0.025/GB/month = $0.30/user/year
- S3 Glacier (after 5 years): $0.001/GB/month = $0.012/user/year
- 10,000 users: ~$3,000/year (first 5 years), ~$120/year (after 5 years)

---

## Performance Targets

- **Generate Upload URL**: P95 < 200ms
- **Confirm Upload**: P95 < 500ms
- **Get Download URL**: P95 < 100ms
- **Upload to S3**: < 5 seconds for 2MB photo on 3G network
- **Photo Processing**: < 3 seconds from capture to queue (FR-044)

---

## Security

**Access Control**:
- Users can only upload photos for their own exposures
- Users can only access their own photos
- Download URLs expire after 1 hour

**Upload URL Expiration**:
- Presigned upload URLs expire after 15 minutes
- If expired, client must request new URL

**File Validation**:
- Validate MIME type server-side after upload
- Check file size doesn't exceed 10MB
- Scan for malicious content (S3 Lambda trigger)

---

## Error Handling

**Upload Failures**:
- Network timeout: Retry automatically
- File too large: Show error, suggest optimizing
- Invalid file type: Show error, only allow jpeg/png/heic
- S3 error: Retry with exponential backoff

**Retrieval Failures**:
- Archived photo: Show "Retrieving from archive (1-5 minutes)"
- Network error: Show cached local copy if available
- S3 error: Retry or show error message

---

## Monitoring

**Metrics to Track**:
- Upload success rate (target: > 95%)
- Average upload time by network type (WiFi, 4G, 3G)
- Failed upload reasons (network, file size, invalid type)
- Storage costs (S3 Standard vs Glacier)
- Photo retrieval time (Standard vs Glacier)

**Alerts**:
- Upload success rate drops below 90% (5-minute window)
- S3 bucket nearing quota
- Glacier retrieval taking > 10 minutes

---

**Contract Version**: 1.0
**Last Updated**: 2025-11-06
**Status**: Ready for Implementation
