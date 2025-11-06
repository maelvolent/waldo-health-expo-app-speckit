/**
 * Convex Mutations and Queries for Exposure Records
 * Handles CRUD operations for workplace exposure documentation
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * T032: Create new exposure record
 * Validates all fields and creates exposure with pending sync status
 */
export const create = mutation({
  args: {
    clientId: v.string(),
    exposureType: v.string(),
    timestamp: v.number(),
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
    voiceTranscription: v.union(v.string(), v.null()),
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

    // Validate exposure type
    const validTypes = [
      'silica_dust',
      'asbestos_a',
      'asbestos_b',
      'hazardous_chemicals',
      'noise',
      'meth_contamination',
      'mould',
      'contaminated_soils',
      'heat_stress',
      'welding_fumes',
      'biological_hazards',
      'radiation',
    ];
    if (!validTypes.includes(args.exposureType)) {
      throw new Error(`Invalid exposure type: ${args.exposureType}`);
    }

    // Validate duration
    if (args.duration.hours < 0 || args.duration.hours > 24) {
      throw new Error('Hours must be between 0 and 24');
    }
    if (args.duration.minutes < 0 || args.duration.minutes > 59) {
      throw new Error('Minutes must be between 0 and 59');
    }
    if (args.duration.hours === 0 && args.duration.minutes === 0) {
      throw new Error('Duration must be greater than 0');
    }

    // Validate GPS coordinates
    if (args.location.latitude < -90 || args.location.latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (args.location.longitude < -180 || args.location.longitude > 180) {
      throw new Error('Invalid longitude');
    }

    // Validate severity
    if (!['low', 'medium', 'high'].includes(args.severity)) {
      throw new Error('Severity must be low, medium, or high');
    }

    // Validate chemical name for certain exposure types
    if (
      ['hazardous_chemicals', 'contaminated_soils'].includes(args.exposureType) &&
      !args.chemicalName
    ) {
      throw new Error('Chemical name is required for this exposure type');
    }

    // Create exposure record
    const exposureId = await ctx.db.insert('exposures', {
      userId: user._id,
      clientId: args.clientId,
      timestamp: args.timestamp,
      exposureType: args.exposureType,
      duration: args.duration,
      location: args.location,
      severity: args.severity,
      ppe: args.ppe,
      workActivity: args.workActivity,
      notes: args.notes,
      chemicalName: args.chemicalName,
      sdsReference: args.sdsReference,
      controlMeasures: args.controlMeasures,
      photoIds: args.photoIds,
      syncStatus: 'synced',
      voiceTranscription: args.voiceTranscription,
      isDeleted: false,
      deletedAt: null,
      updatedAt: Date.now(),
    });

    return exposureId;
  },
});

/**
 * T033: List exposures with pagination
 * Returns user's exposures sorted by timestamp (newest first)
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
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

    const limit = args.limit ?? 50;
    if (limit > 100) {
      throw new Error('Limit cannot exceed 100');
    }

    // Query exposures for user, sorted by timestamp descending
    let exposuresQuery = ctx.db
      .query('exposures')
      .withIndex('by_userId_timestamp', q => q.eq('userId', user._id))
      .order('desc');

    // Apply cursor for pagination if provided
    if (args.cursor) {
      exposuresQuery = exposuresQuery.filter(q =>
        q.lt(q.field('_creationTime'), parseInt(args.cursor!))
      );
    }

    const exposures = await exposuresQuery.take(limit + 1);

    // Check if there are more results
    const hasMore = exposures.length > limit;
    const results = hasMore ? exposures.slice(0, limit) : exposures;

    // Generate next cursor
    const nextCursor =
      hasMore && results.length > 0
        ? results[results.length - 1]._creationTime.toString()
        : null;

    return {
      exposures: results.filter(e => !e.isDeleted),
      nextCursor,
      hasMore,
    };
  },
});

/**
 * T034: Get single exposure by ID
 * Returns full exposure details including all metadata
 */
export const get = query({
  args: {
    id: v.id('exposures'),
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

    // Get exposure
    const exposure = await ctx.db.get(args.id);

    if (!exposure) {
      throw new Error('Exposure not found');
    }

    // Verify ownership
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to view this exposure');
    }

    if (exposure.isDeleted) {
      throw new Error('Exposure has been deleted');
    }

    return exposure;
  },
});

/**
 * Update exposure record
 * Allows updating most fields except userId and clientId
 */
export const update = mutation({
  args: {
    id: v.id('exposures'),
    exposureType: v.optional(v.string()),
    duration: v.optional(
      v.object({
        hours: v.number(),
        minutes: v.number(),
      })
    ),
    severity: v.optional(v.string()),
    ppe: v.optional(v.array(v.string())),
    workActivity: v.optional(v.string()),
    notes: v.optional(v.union(v.string(), v.null())),
    chemicalName: v.optional(v.union(v.string(), v.null())),
    sdsReference: v.optional(v.union(v.string(), v.null())),
    controlMeasures: v.optional(v.union(v.string(), v.null())),
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

    // Get exposure
    const exposure = await ctx.db.get(args.id);

    if (!exposure) {
      throw new Error('Exposure not found');
    }

    // Verify ownership
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to update this exposure');
    }

    if (exposure.isDeleted) {
      throw new Error('Cannot update deleted exposure');
    }

    // Build update object
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.exposureType !== undefined) updates.exposureType = args.exposureType;
    if (args.duration !== undefined) updates.duration = args.duration;
    if (args.severity !== undefined) updates.severity = args.severity;
    if (args.ppe !== undefined) updates.ppe = args.ppe;
    if (args.workActivity !== undefined) updates.workActivity = args.workActivity;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.chemicalName !== undefined) updates.chemicalName = args.chemicalName;
    if (args.sdsReference !== undefined) updates.sdsReference = args.sdsReference;
    if (args.controlMeasures !== undefined) updates.controlMeasures = args.controlMeasures;

    // Update exposure
    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Soft delete exposure record
 * Marks as deleted rather than removing from database
 */
export const remove = mutation({
  args: {
    id: v.id('exposures'),
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

    // Get exposure
    const exposure = await ctx.db.get(args.id);

    if (!exposure) {
      throw new Error('Exposure not found');
    }

    // Verify ownership
    if (exposure.userId !== user._id) {
      throw new Error('Not authorized to delete this exposure');
    }

    // Soft delete
    await ctx.db.patch(args.id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
