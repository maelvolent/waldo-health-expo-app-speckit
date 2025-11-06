/**
 * Internal helper queries for export functionality
 */

import { v } from 'convex/values';
import { internalQuery } from './_generated/server';

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .first();
  },
});

/**
 * Get exposures for export
 */
export const getExposuresForExport = internalQuery({
  args: {
    exposureIds: v.array(v.id('exposures')),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const exposures = await Promise.all(
      args.exposureIds.map(async (id) => {
        const exposure = await ctx.db.get(id);
        if (!exposure || exposure.userId !== args.userId) {
          return null;
        }
        return exposure;
      })
    );
    return exposures.filter((e): e is NonNullable<typeof e> => e !== null);
  },
});
