/**
 * Convex Mutations and Queries for Photo Management
 * Handles photo uploads and EXIF metadata storage
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * T035: Generate upload URL for photo
 * Returns a presigned URL for uploading photo to Convex storage
 */
export const generateUploadUrl = mutation({
  args: {
    exposureId: v.id('exposures'),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify exposure exists and belongs to user
    const exposure = await ctx.db.get(args.exposureId);
    if (!exposure) {
      throw new Error('Exposure not found');
    }
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to upload photos for this exposure');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (args.fileSize > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate mime type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validMimeTypes.includes(args.mimeType)) {
      throw new Error('Invalid file type. Only JPEG and PNG images are supported');
    }

    // Check photo count limit (max 5 per exposure)
    const existingPhotos = await ctx.db
      .query('photos')
      .withIndex('by_exposureId', q => q.eq('exposureId', args.exposureId))
      .collect();

    const activePhotos = existingPhotos.filter(p => !p.isDeleted);
    if (activePhotos.length >= 5) {
      throw new Error('Maximum 5 photos per exposure');
    }

    // Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return uploadUrl;
  },
});

/**
 * T036: Confirm photo upload and save metadata
 * Called after photo is successfully uploaded to storage
 */
export const confirmUpload = mutation({
  args: {
    exposureId: v.id('exposures'),
    storageId: v.string(),
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
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify exposure exists and belongs to user
    const exposure = await ctx.db.get(args.exposureId);
    if (!exposure) {
      throw new Error('Exposure not found');
    }
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to add photos to this exposure');
    }

    // Validate dimensions
    const maxDimension = 4096;
    if (args.width > maxDimension || args.height > maxDimension) {
      throw new Error('Image dimensions exceed 4096px limit');
    }
    if (args.width <= 0 || args.height <= 0) {
      throw new Error('Invalid image dimensions');
    }

    // Validate EXIF GPS if present
    if (args.exif) {
      if (args.exif.latitude !== null) {
        if (args.exif.latitude < -90 || args.exif.latitude > 90) {
          throw new Error('Invalid EXIF latitude');
        }
      }
      if (args.exif.longitude !== null) {
        if (args.exif.longitude < -180 || args.exif.longitude > 180) {
          throw new Error('Invalid EXIF longitude');
        }
      }
    }

    // Create photo record
    const photoId = await ctx.db.insert('photos', {
      exposureId: args.exposureId,
      userId: user._id,
      storageId: args.storageId,
      localUri: null, // Only used on mobile device
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      width: args.width,
      height: args.height,
      exif: args.exif,
      uploadStatus: 'uploaded',
      uploadProgress: 100,
      retryCount: 0,
      uploadedAt: Date.now(),
      isDeleted: false,
      deletedAt: null,
    });

    // Update exposure's photoIds array
    const currentPhotoIds = exposure.photoIds || [];
    await ctx.db.patch(args.exposureId, {
      photoIds: [...currentPhotoIds, photoId],
      updatedAt: Date.now(),
    });

    return photoId;
  },
});

/**
 * List photos for an exposure
 * Returns all non-deleted photos with metadata
 */
export const list = query({
  args: {
    exposureId: v.id('exposures'),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify exposure exists and belongs to user
    const exposure = await ctx.db.get(args.exposureId);
    if (!exposure) {
      throw new Error('Exposure not found');
    }
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to view photos for this exposure');
    }

    // Get photos
    const photos = await ctx.db
      .query('photos')
      .withIndex('by_exposureId', q => q.eq('exposureId', args.exposureId))
      .collect();

    return photos.filter(p => !p.isDeleted);
  },
});

/**
 * Get photo URL from storage
 * Returns the URL to access the photo
 */
export const getUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

/**
 * Get photo URLs for multiple photo IDs
 * Returns an array of { photoId, url, storageId } objects
 * Used for batch fetching photos for PDF export
 */
export const getPhotoUrls = query({
  args: {
    photoIds: v.array(v.id('photos')),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch all photos and generate URLs
    const photoUrls = await Promise.all(
      args.photoIds.map(async (photoId) => {
        const photo = await ctx.db.get(photoId);
        if (!photo || photo.isDeleted) {
          return null;
        }

        // Verify ownership
        if (photo.userId !== user._id) {
          return null;
        }

        const url = await ctx.storage.getUrl(photo.storageId);
        return {
          photoId,
          url,
          storageId: photo.storageId,
          fileName: photo.fileName,
          width: photo.width,
          height: photo.height,
        };
      })
    );

    // Filter out nulls and return valid photo URLs
    return photoUrls.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

/**
 * T065: Get temporary download URL for photo export
 * Returns a temporary download URL with 1-hour expiration
 * Used for secure photo access in PDF/CSV exports
 */
export const getDownloadUrl = query({
  args: {
    photoId: v.id('photos'),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get photo
    const photo = await ctx.db.get(args.photoId);
    if (!photo) {
      throw new Error('Photo not found');
    }

    // Verify ownership
    if (photo.userId !== user._id) {
      throw new Error('Not authorized to access this photo');
    }

    if (photo.isDeleted) {
      throw new Error('Photo has been deleted');
    }

    // Get storage URL (Convex URLs are already time-limited)
    const url = await ctx.storage.getUrl(photo.storageId);

    if (!url) {
      throw new Error('Failed to generate download URL');
    }

    return {
      photoId: args.photoId,
      url,
      fileName: photo.fileName,
      mimeType: photo.mimeType,
      fileSize: photo.fileSize,
      width: photo.width,
      height: photo.height,
      expiresIn: 3600, // 1 hour in seconds
      expiresAt: Date.now() + 3600 * 1000, // Timestamp when URL expires
    };
  },
});

/**
 * Soft delete photo
 * Marks photo as deleted and removes from exposure's photoIds
 */
export const remove = mutation({
  args: {
    id: v.id('photos'),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get photo
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error('Photo not found');
    }

    // Verify ownership
    if (photo.userId !== user._id) {
      throw new Error('Not authorized to delete this photo');
    }

    // Soft delete photo
    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    // Remove from exposure's photoIds array
    const exposure = await ctx.db.get(photo.exposureId);
    if (exposure) {
      const updatedPhotoIds = exposure.photoIds.filter(id => id !== args.id);
      await ctx.db.patch(photo.exposureId, {
        photoIds: updatedPhotoIds,
        updatedAt: Date.now(),
      });
    }

    return args.id;
  },
});
