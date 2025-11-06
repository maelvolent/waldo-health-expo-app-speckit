/**
 * CSV Export Utility
 * Generates CSV files for spreadsheet analysis
 *
 * Features:
 * - All exposure fields exported
 * - RFC 4180 compliant CSV format
 * - Proper escaping of quotes and commas
 * - Compatible with Excel and Google Sheets
 */

import { format } from 'date-fns';

interface ExposureForCSV {
  _id: string;
  exposureType: string;
  timestamp: number;
  duration: { hours: number; minutes: number };
  location: {
    latitude: number;
    longitude: number;
    address: string | null;
    siteName: string | null;
  };
  severity: 'low' | 'medium' | 'high';
  ppe: string[];
  workActivity: string;
  notes: string | null;
  chemicalName: string | null;
  sdsReference: string | null;
  controlMeasures: string | null;
  photoIds: string[];
  _creationTime: number;
  updatedAt: number;
}

/**
 * Escape CSV field value
 * Handles quotes, commas, and newlines per RFC 4180
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format exposure type for CSV
 */
function formatExposureType(type: string): string {
  const typeMap: Record<string, string> = {
    silica_dust: 'Silica Dust',
    asbestos_a: 'Asbestos (Class A)',
    asbestos_b: 'Asbestos (Class B)',
    hazardous_chemicals: 'Hazardous Chemicals',
    noise: 'Noise',
    meth_contamination: 'Meth Contamination',
    mould: 'Mould',
    contaminated_soils: 'Contaminated Soils',
    heat_stress: 'Heat Stress',
    welding_fumes: 'Welding Fumes',
    biological_hazards: 'Biological Hazards',
    radiation: 'Radiation',
  };
  return typeMap[type] || type;
}

/**
 * T067: Generate CSV string from exposure records
 */
export function generateCSV(exposures: ExposureForCSV[]): string {
  // Define CSV headers
  const headers = [
    'ID',
    'Exposure Type',
    'Date',
    'Time',
    'Duration (hours)',
    'Severity',
    'Latitude',
    'Longitude',
    'Location Address',
    'Site Name',
    'Work Activity',
    'PPE Used',
    'Notes',
    'Chemical Name',
    'SDS Reference',
    'Control Measures',
    'Photo Count',
    'Created At',
    'Updated At',
  ];

  // Create CSV rows
  const rows = exposures.map(exposure => {
    const date = new Date(exposure.timestamp);
    const durationHours = exposure.duration.hours + exposure.duration.minutes / 60;

    return [
      escapeCSVField(exposure._id),
      escapeCSVField(formatExposureType(exposure.exposureType)),
      escapeCSVField(format(date, 'dd/MM/yyyy')),
      escapeCSVField(format(date, 'HH:mm')),
      escapeCSVField(durationHours.toFixed(2)),
      escapeCSVField(exposure.severity.charAt(0).toUpperCase() + exposure.severity.slice(1)),
      escapeCSVField(exposure.location.latitude.toFixed(6)),
      escapeCSVField(exposure.location.longitude.toFixed(6)),
      escapeCSVField(exposure.location.address || ''),
      escapeCSVField(exposure.location.siteName || ''),
      escapeCSVField(exposure.workActivity),
      escapeCSVField(exposure.ppe.join('; ')),
      escapeCSVField(exposure.notes || ''),
      escapeCSVField(exposure.chemicalName || ''),
      escapeCSVField(exposure.sdsReference || ''),
      escapeCSVField(exposure.controlMeasures || ''),
      escapeCSVField(exposure.photoIds?.length || 0),
      escapeCSVField(format(new Date(exposure._creationTime), 'dd/MM/yyyy HH:mm')),
      escapeCSVField(format(new Date(exposure.updatedAt), 'dd/MM/yyyy HH:mm')),
    ];
  });

  // Combine headers and rows
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))];

  return csvLines.join('\n');
}

/**
 * Generate CSV summary statistics
 */
export function generateCSVSummary(exposures: ExposureForCSV[]): string {
  const headers = ['Statistic', 'Value'];

  const totalExposures = exposures.length;
  const exposuresByType = exposures.reduce(
    (acc, exp) => {
      const type = formatExposureType(exp.exposureType);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const exposuresBySeverity = exposures.reduce(
    (acc, exp) => {
      const severity = exp.severity.charAt(0).toUpperCase() + exp.severity.slice(1);
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalDuration = exposures.reduce((sum, exp) => {
    return sum + exp.duration.hours + exp.duration.minutes / 60;
  }, 0);

  const avgDuration = totalExposures > 0 ? totalDuration / totalExposures : 0;

  const totalPhotos = exposures.reduce((sum, exp) => sum + (exp.photoIds?.length || 0), 0);

  const rows = [
    ['Total Exposures', totalExposures],
    ['Total Duration (hours)', totalDuration.toFixed(2)],
    ['Average Duration (hours)', avgDuration.toFixed(2)],
    ['Total Photos', totalPhotos],
    ['', ''],
    ['Exposures by Type', ''],
    ...Object.entries(exposuresByType).map(([type, count]) => [type, count]),
    ['', ''],
    ['Exposures by Severity', ''],
    ...Object.entries(exposuresBySeverity).map(([severity, count]) => [severity, count]),
  ];

  const csvLines = [headers.join(','), ...rows.map(row => row.map(escapeCSVField).join(','))];

  return csvLines.join('\n');
}
