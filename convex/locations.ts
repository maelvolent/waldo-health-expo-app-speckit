/**
 * T105-T107: Location (Saved Sites) Convex Functions
 * Manage frequently used work sites for quick exposure entry
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { Doc } from './_generated/dataModel';

/**
 * T105: List all saved locations for a user
 * Sorted by most recently used
 */
export const list = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const locations = await ctx.db
      .query('locations')
      .withIndex('by_userId_lastUsed', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('isActive'), true))
      .order('desc') // Most recently used first
      .collect();

    return locations;
  },
});

/**
 * Get a single location by ID
 */
export const get = query({
  args: {
    locationId: v.id('locations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.locationId);
  },
});

/**
 * T106: Create a new saved location (site)
 */
export const create = mutation({
  args: {
    userId: v.id('users'),
    siteName: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    notes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    // Check if location with same name already exists for this user
    const existing = await ctx.db
      .query('locations')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .filter(q =>
        q.and(
          q.eq(q.field('siteName'), args.siteName),
          q.eq(q.field('isActive'), true)
        )
      )
      .first();

    if (existing) {
      // Update existing location instead of creating duplicate
      await ctx.db.patch(existing._id, {
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
        notes: args.notes,
        lastUsedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new location
    const locationId = await ctx.db.insert('locations', {
      userId: args.userId,
      siteName: args.siteName,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      notes: args.notes,
      isActive: true,
      exposureCount: 0,
      lastUsedAt: Date.now(),
      createdAt: Date.now(),
    });

    return locationId;
  },
});

/**
 * Update a saved location
 */
export const update = mutation({
  args: {
    locationId: v.id('locations'),
    siteName: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { locationId, ...updates } = args;

    await ctx.db.patch(locationId, updates);

    return { success: true };
  },
});

/**
 * Soft delete a location
 */
export const remove = mutation({
  args: {
    locationId: v.id('locations'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.locationId, {
      isActive: false,
    });

    return { success: true };
  },
});

/**
 * T107: Suggest nearby saved locations
 * Finds sites within 50 meters of given coordinates
 */
export const suggestNearby = query({
  args: {
    userId: v.id('users'),
    latitude: v.number(),
    longitude: v.number(),
    radiusMeters: v.optional(v.number()), // Default 50m
  },
  handler: async (ctx, args) => {
    const radius = args.radiusMeters || 50; // Default 50 meters

    // Get all active locations for user
    const allLocations = await ctx.db
      .query('locations')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .filter(q => q.eq(q.field('isActive'), true))
      .collect();

    // Filter by distance using Haversine formula
    const nearbyLocations = allLocations
      .map(location => ({
        ...location,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          location.latitude,
          location.longitude
        ),
      }))
      .filter(location => location.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // Closest first

    return nearbyLocations;
  },
});

/**
 * Increment usage count when a location is used for an exposure
 */
export const incrementUsage = mutation({
  args: {
    locationId: v.id('locations'),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) return;

    await ctx.db.patch(args.locationId, {
      exposureCount: location.exposureCount + 1,
      lastUsedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Helper: Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
