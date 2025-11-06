import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email']),

  exposures: defineTable({
    userId: v.id('users'),
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
    photoIds: v.array(v.id('photos')),
    syncStatus: v.string(),
    voiceTranscription: v.union(v.string(), v.null()),
    isDeleted: v.boolean(),
    deletedAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_timestamp', ['userId', 'timestamp'])
    .index('by_exposureType', ['exposureType'])
    .index('by_clientId', ['clientId'])
    .index('by_syncStatus', ['syncStatus']),

  photos: defineTable({
    exposureId: v.id('exposures'),
    userId: v.id('users'),
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
    .index('by_exposureId', ['exposureId'])
    .index('by_userId', ['userId'])
    .index('by_uploadStatus', ['uploadStatus']),

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
    .index('by_exposureType', ['exposureType'])
    .index('by_isPublished', ['isPublished'])
    .index('by_tags', ['tags']),

  locations: defineTable({
    userId: v.id('users'),
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
    .index('by_userId', ['userId'])
    .index('by_userId_lastUsed', ['userId', 'lastUsedAt']),

  hazardScans: defineTable({
    photoId: v.id('photos'),
    exposureId: v.id('exposures'),
    userId: v.id('users'),
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
    .index('by_photoId', ['photoId'])
    .index('by_exposureId', ['exposureId'])
    .index('by_userId', ['userId']),
});
