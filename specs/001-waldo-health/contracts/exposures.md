# Exposure Records API Contract

**Entity**: ExposureRecord
**Backend**: Convex Mutations and Queries
**Date**: 2025-11-06

---

## Queries

### `exposures:list`

**Purpose**: Get all exposure records for current user, sorted by timestamp descending

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;           // Current user's ID from Clerk
  limit?: number;           // Optional, default 50, max 100
  cursor?: string;          // Optional, for pagination
  filter?: {
    exposureType?: string;  // Filter by specific exposure type
    startDate?: number;     // Filter by timestamp >= startDate
    endDate?: number;       // Filter by timestamp <= endDate
    severity?: "low" | "medium" | "high";
  };
}
```

**Output**:
```typescript
{
  exposures: ExposureRecord[];
  nextCursor: string | null;  // For pagination
  totalCount: number;
}
```

**Errors**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Attempting to access another user's exposures

**Performance**: P95 < 200ms (Constitution requirement)

---

### `exposures:get`

**Purpose**: Get single exposure record by ID

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;  // Convex document ID
}
```

**Output**:
```typescript
ExposureRecord | null
```

**Errors**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Exposure belongs to different user
- `404 Not Found`: Exposure doesn't exist

**Performance**: P95 < 100ms

---

### `exposures:getByClientId`

**Purpose**: Find exposure by client-generated ID (for offline deduplication)

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  clientId: string;  // UUID generated on device
}
```

**Output**:
```typescript
ExposureRecord | null
```

**Use Case**: When syncing offline-created exposure, check if it already exists to avoid duplicates

---

### `exposures:getStats`

**Purpose**: Get exposure statistics for user (for dashboard/reports)

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;
  dateRange?: {
    startDate: number;
    endDate: number;
  };
}
```

**Output**:
```typescript
{
  totalExposures: number;
  byExposureType: Record<string, number>;  // Count per exposure type
  bySeverity: Record<"low" | "medium" | "high", number>;
  totalPhotos: number;
  dateRange: {
    earliest: number;  // Timestamp of first exposure
    latest: number;    // Timestamp of most recent exposure
  };
}
```

---

## Mutations

### `exposures:create`

**Purpose**: Create new exposure record

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  clientId: string;               // Client-generated UUID for deduplication
  timestamp: number;              // Device time when exposure occurred
  exposureType: string;           // One of 12 valid types
  duration: {
    hours: number;                // 0-24
    minutes: number;              // 0-59
  };
  location: {
    latitude: number;             // -90 to 90
    longitude: number;            // -180 to 180
    accuracy?: number | null;     // Meters
    address?: string | null;      // Reverse geocoded
    siteName?: string | null;     // User-provided name
  };
  severity: "low" | "medium" | "high";
  ppe: string[];                  // Array of PPE types
  workActivity: string;           // Required description
  notes?: string | null;          // Optional notes
  chemicalName?: string | null;
  sdsReference?: string | null;
  controlMeasures?: string | null;
  photoIds: string[];             // 1-5 photo IDs
  voiceTranscription?: string | null;
}
```

**Validation**:
- All required fields must be present
- `exposureType` must be valid (silica_dust, asbestos_a, etc.)
- `severity` must be "low", "medium", or "high"
- `ppe` items must be valid PPE types
- `photoIds` must have 1-5 items (FR-003 requirement)
- `duration.hours` must be 0-24
- `duration.minutes` must be 0-59
- `location.latitude` must be -90 to 90
- `location.longitude` must be -180 to 180
- `timestamp` must be in past (not future)

**Output**:
```typescript
{
  exposureId: string;  // Convex document ID
  syncStatus: "synced";
}
```

**Errors**:
- `400 Bad Request`: Validation failed (with specific error message)
- `401 Unauthorized`: User not authenticated
- `409 Conflict`: Exposure with this clientId already exists

**Performance**: P95 < 500ms (Constitution requirement for mutations)

**Idempotency**: Uses `clientId` to prevent duplicate creation. If exposure with same `clientId` exists, returns existing exposure ID instead of creating new one.

---

### `exposures:update`

**Purpose**: Update existing exposure record

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;
  updates: Partial<{
    timestamp: number;
    exposureType: string;
    duration: { hours: number; minutes: number };
    location: {
      latitude: number;
      longitude: number;
      accuracy?: number | null;
      address?: string | null;
      siteName?: string | null;
    };
    severity: "low" | "medium" | "high";
    ppe: string[];
    workActivity: string;
    notes?: string | null;
    chemicalName?: string | null;
    sdsReference?: string | null;
    controlMeasures?: string | null;
    photoIds: string[];
    voiceTranscription?: string | null;
  }>;
}
```

**Validation**: Same as create, but only for provided fields

**Output**:
```typescript
{
  exposureId: string;
  updatedAt: number;
}
```

**Errors**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Exposure belongs to different user
- `404 Not Found`: Exposure doesn't exist

**Performance**: P95 < 500ms

**Audit Trail**: All updates logged immutably with before/after values

---

### `exposures:softDelete`

**Purpose**: Soft delete exposure record (sets isDeleted flag)

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;
}
```

**Output**:
```typescript
{
  exposureId: string;
  isDeleted: true;
  deletedAt: number;
}
```

**Errors**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Exposure belongs to different user
- `404 Not Found`: Exposure doesn't exist

**Note**: Hard deletion is not allowed. Records retained for 40 years per ACC Act 2001.

---

### `exposures:restore`

**Purpose**: Restore soft-deleted exposure record

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  exposureId: string;
}
```

**Output**:
```typescript
{
  exposureId: string;
  isDeleted: false;
  deletedAt: null;
}
```

---

## Actions

### `exposures:export`

**Purpose**: Generate PDF or CSV export of exposure records

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;
  format: "pdf" | "csv";
  exposureIds?: string[];  // Optional, export specific exposures only
  dateRange?: {
    startDate: number;
    endDate: number;
  };
}
```

**Output**:
```typescript
{
  fileUrl: string;       // Temporary download URL (expires in 1 hour)
  fileName: string;      // e.g., "exposures-2025-11-06.pdf"
  fileSize: number;      // Bytes
  expiresAt: number;     // Timestamp
}
```

**Implementation**:
- For PDF: Runs server-side with Puppeteer or similar
- For CSV: Generates CSV string and uploads to temporary storage
- File stored in S3 with 1-hour TTL

**Performance**: May take 5-30 seconds depending on number of exposures

**Errors**:
- `400 Bad Request`: Invalid date range or exposure IDs
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Export generation failed

---

## Real-Time Subscriptions

### `exposures:subscribe`

**Purpose**: Subscribe to real-time updates for user's exposures

**Auth**: Required (Clerk)

**Input**:
```typescript
{
  userId: string;
}
```

**Output**: Stream of ExposureRecord[] (updates whenever any exposure is created/updated/deleted)

**Use Case**: Keep mobile app in sync across devices

---

## Validation Rules

**Exposure Type Enum**:
- `silica_dust`
- `asbestos_a`
- `asbestos_b`
- `hazardous_chemicals`
- `noise`
- `meth`
- `mould`
- `contaminated_soils`
- `heat_stress`
- `welding_fumes`
- `biological_hazards`
- `radiation`

**PPE Type Enum**:
- `respirator`
- `gloves`
- `safety_glasses`
- `hearing_protection`
- `coveralls`
- `hard_hat`
- `safety_boots`
- `none`

**Severity Enum**:
- `low`
- `medium`
- `high`

---

## Error Handling

All endpoints return errors in consistent format:

```typescript
{
  error: string;        // Error code (e.g., "VALIDATION_FAILED")
  message: string;      // Human-readable message
  details?: object;     // Optional additional context
}
```

**Standard Error Codes**:
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_FAILED`: Input validation failed
- `CONFLICT`: Resource already exists (duplicate clientId)
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Queries**: 100 requests/minute per user
- **Mutations**: 60 requests/minute per user
- **Export Action**: 5 requests/hour per user

---

## Offline Sync Strategy

**Client-Side Queue**:
1. Create exposure locally with `clientId`
2. Add to MMKV mutation queue
3. Return immediately to user
4. Sync when online using `exposures:create`
5. If `clientId` conflict, update local record with server ID

**Conflict Resolution**:
- Last write wins (based on `updatedAt` timestamp)
- Server timestamp takes precedence over client timestamp

---

**Contract Version**: 1.0
**Last Updated**: 2025-11-06
**Status**: Ready for Implementation
