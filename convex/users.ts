/**
 * Convex Mutations and Queries for User Management
 * Handles user profiles and Clerk authentication integration
 */

import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

/**
 * T037: Create or update user from Clerk webhook
 * Called when user signs up or updates profile in Clerk
 */
export const createOrUpdate = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    profilePhotoUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        profilePhotoUrl: args.profilePhotoUrl,
      });
      return existingUser._id;
    } else {
      // Create new user with default preferences
      const userId = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        phoneNumber: null,
        occupation: null,
        employer: null,
        profilePhotoUrl: args.profilePhotoUrl,
        preferences: {
          defaultSiteLocation: null,
          enableVoiceEntry: true,
          includeMapInPDF: true,
          notificationsEnabled: true,
        },
        isDeleted: false,
        deletedAt: null,
      });
      return userId;
    }
  },
});

/**
 * T037a: Auto-create user on first login
 * Called from client to ensure user exists in Convex
 */
export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (existingUser && !existingUser.isDeleted) {
      return existingUser;
    }

    // Create new user with data from Clerk
    const userId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email || `user-${identity.subject}@example.com`,
      name: identity.name || identity.givenName || null,
      phoneNumber: null,
      occupation: null,
      employer: null,
      profilePhotoUrl: identity.pictureUrl || null,
      preferences: {
        defaultSiteLocation: null,
        enableVoiceEntry: true,
        includeMapInPDF: true,
        notificationsEnabled: true,
      },
      isDeleted: false,
      deletedAt: null,
    });

    const newUser = await ctx.db.get(userId);
    return newUser;
  },
});

/**
 * T038: Get current user by Clerk ID
 * Returns user profile for authenticated user
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find user by clerkId
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .first();

    if (!user || user.isDeleted) {
      return null;
    }

    return user;
  },
});

/**
 * Get user by Clerk ID (for internal use)
 */
export const getByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', args.clerkId))
      .first();

    if (!user || user.isDeleted) {
      return null;
    }

    return user;
  },
});

/**
 * Update user profile
 * Allows updating name, phone, occupation, employer
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    occupation: v.optional(v.string()),
    employer: v.optional(v.string()),
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

    // Build update object
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;
    if (args.occupation !== undefined) updates.occupation = args.occupation;
    if (args.employer !== undefined) updates.employer = args.employer;

    // Update user
    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Update user preferences
 * Allows updating app settings
 */
export const updatePreferences = mutation({
  args: {
    defaultSiteLocation: v.optional(v.union(v.string(), v.null())),
    enableVoiceEntry: v.optional(v.boolean()),
    includeMapInPDF: v.optional(v.boolean()),
    notificationsEnabled: v.optional(v.boolean()),
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

    // Build updated preferences
    const updatedPreferences = { ...user.preferences };
    if (args.defaultSiteLocation !== undefined)
      updatedPreferences.defaultSiteLocation = args.defaultSiteLocation;
    if (args.enableVoiceEntry !== undefined)
      updatedPreferences.enableVoiceEntry = args.enableVoiceEntry;
    if (args.includeMapInPDF !== undefined)
      updatedPreferences.includeMapInPDF = args.includeMapInPDF;
    if (args.notificationsEnabled !== undefined)
      updatedPreferences.notificationsEnabled = args.notificationsEnabled;

    // Update user preferences
    await ctx.db.patch(user._id, {
      preferences: updatedPreferences,
    });

    return user._id;
  },
});

/**
 * Get user statistics
 * Returns exposure count and other metrics
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
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

    // Count exposures
    const exposures = await ctx.db
      .query('exposures')
      .withIndex('by_userId', q => q.eq('userId', user._id))
      .collect();

    const activeExposures = exposures.filter(e => !e.isDeleted);

    // Count by type
    const byType: Record<string, number> = {};
    activeExposures.forEach(e => {
      byType[e.exposureType] = (byType[e.exposureType] || 0) + 1;
    });

    // Count by severity
    const bySeverity = {
      low: activeExposures.filter(e => e.severity === 'low').length,
      medium: activeExposures.filter(e => e.severity === 'medium').length,
      high: activeExposures.filter(e => e.severity === 'high').length,
    };

    // Count pending sync
    const pendingSync = activeExposures.filter(e => e.syncStatus !== 'synced').length;

    return {
      total: activeExposures.length,
      byType,
      bySeverity,
      pendingSync,
    };
  },
});

/**
 * Soft delete user account
 * Marks user and all associated data as deleted
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
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

    const now = Date.now();

    // Soft delete user
    await ctx.db.patch(user._id, {
      isDeleted: true,
      deletedAt: now,
    });

    // Soft delete all exposures
    const exposures = await ctx.db
      .query('exposures')
      .withIndex('by_userId', q => q.eq('userId', user._id))
      .collect();

    for (const exposure of exposures) {
      if (!exposure.isDeleted) {
        await ctx.db.patch(exposure._id, {
          isDeleted: true,
          deletedAt: now,
          updatedAt: now,
        });
      }
    }

    // Soft delete all photos
    const photos = await ctx.db
      .query('photos')
      .withIndex('by_userId', q => q.eq('userId', user._id))
      .collect();

    for (const photo of photos) {
      if (!photo.isDeleted) {
        await ctx.db.patch(photo._id, {
          isDeleted: true,
          deletedAt: now,
        });
      }
    }

    return user._id;
  },
});
