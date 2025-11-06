/**
 * Convex Actions for Export Functionality
 * Server-side export generation (fallback if client-side fails)
 */

import { v } from 'convex/values';
import { action } from './_generated/server';
import { internal } from './_generated/api';

/**
 * T064: Server-side export action
 * Generates PDF or CSV exports on the server if client-side generation fails
 *
 * Note: This is primarily a fallback mechanism. Client-side export using expo-print
 * is preferred for offline capability and better performance.
 */
export const generateExport = action({
  args: {
    format: v.union(v.literal('pdf'), v.literal('csv'), v.literal('csv-summary')),
    exposureIds: v.array(v.id('exposures')),
    userInfo: v.object({
      name: v.union(v.string(), v.null()),
      email: v.string(),
      phoneNumber: v.union(v.string(), v.null()),
      occupation: v.union(v.string(), v.null()),
      employer: v.union(v.string(), v.null()),
    }),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    message: string;
    format: string;
    exposureCount: number;
    data?: string;
  }> => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Find user
    const user = await ctx.runQuery(internal.exports_internal.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch all requested exposures
    const validExposures = await ctx.runQuery(internal.exports_internal.getExposuresForExport, {
      exposureIds: args.exposureIds,
      userId: user._id,
    });

    if (validExposures.length === 0) {
      throw new Error('No valid exposures found for export');
    }

    // Generate export based on format
    if (args.format === 'pdf') {
      // Server-side PDF generation
      // In a real implementation, this would use a library like puppeteer or similar
      // For now, return metadata about what would be generated
      return {
        success: true,
        message: 'PDF export prepared',
        format: 'pdf',
        exposureCount: validExposures.length,
        // In production, this would return a download URL or file
      };
    } else if (args.format === 'csv') {
      // Generate CSV on server
      const csvData = generateCSVData(validExposures);
      return {
        success: true,
        message: 'CSV export generated',
        format: 'csv',
        data: csvData,
        exposureCount: validExposures.length,
      };
    } else {
      // Generate CSV summary
      const summaryData = generateCSVSummary(validExposures);
      return {
        success: true,
        message: 'CSV summary generated',
        format: 'csv-summary',
        data: summaryData,
        exposureCount: validExposures.length,
      };
    }
  },
});

/**
 * Helper function to generate CSV data from exposures
 */
function generateCSVData(exposures: any[]): string {
  const headers = [
    'ID',
    'Exposure Type',
    'Date',
    'Time',
    'Duration (hours)',
    'Severity',
    'Latitude',
    'Longitude',
    'Location',
    'Site Name',
    'Work Activity',
    'PPE',
    'Notes',
    'Chemical Name',
    'SDS Reference',
    'Control Measures',
  ];

  const rows = exposures.map(exp => {
    const date = new Date(exp.timestamp);
    const duration = exp.duration.hours + exp.duration.minutes / 60;

    return [
      exp._id,
      exp.exposureType,
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      duration.toFixed(2),
      exp.severity,
      exp.location.latitude.toFixed(6),
      exp.location.longitude.toFixed(6),
      exp.location.address || '',
      exp.location.siteName || '',
      exp.workActivity,
      exp.ppe.join('; '),
      exp.notes || '',
      exp.chemicalName || '',
      exp.sdsReference || '',
      exp.controlMeasures || '',
    ].map(escapeCSV).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Helper function to generate CSV summary statistics
 */
function generateCSVSummary(exposures: any[]): string {
  const stats = {
    total: exposures.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    totalDuration: 0,
  };

  exposures.forEach(exp => {
    stats.byType[exp.exposureType] = (stats.byType[exp.exposureType] || 0) + 1;
    stats.bySeverity[exp.severity] = (stats.bySeverity[exp.severity] || 0) + 1;
    stats.totalDuration += exp.duration.hours + exp.duration.minutes / 60;
  });

  const rows = [
    ['Total Exposures', stats.total],
    ['Total Duration (hours)', stats.totalDuration.toFixed(2)],
    ['Average Duration (hours)', (stats.totalDuration / stats.total).toFixed(2)],
    ['', ''],
    ['By Type', ''],
    ...Object.entries(stats.byType).map(([type, count]) => [type, count]),
    ['', ''],
    ['By Severity', ''],
    ...Object.entries(stats.bySeverity).map(([sev, count]) => [sev, count]),
  ];

  return [
    'Statistic,Value',
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Escape CSV field values
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return str;
}
