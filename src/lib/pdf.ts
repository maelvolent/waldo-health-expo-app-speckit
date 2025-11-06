/**
 * PDF Export Utility
 * Generates professional PDF documents for ACC claims
 *
 * Features:
 * - Cover page with user information
 * - Table of contents
 * - Individual exposure entries with embedded photos
 * - WCAG AA compliant formatting
 * - Offline support (all images embedded as base64)
 */

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { format } from 'date-fns';

interface ExposureForExport {
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

interface UserInfo {
  name: string | null;
  email: string;
  phoneNumber: string | null;
  occupation: string | null;
  employer: string | null;
}

/**
 * T068: Convert image to base64 with optimization
 * Resize to 800px width, 80% quality JPEG
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    // Resize and compress image
    const manipResult = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    // Convert to base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: 'base64',
    });

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}

/**
 * Format exposure type for display
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
 * Format severity for display
 */
function formatSeverity(severity: string): string {
  const severityMap: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  };
  return severityMap[severity] || severity;
}

/**
 * Generate HTML for a single exposure entry
 * Fetches photo URLs from Convex and embeds them as base64
 */
async function generateExposureHTML(
  exposure: ExposureForExport,
  index: number,
  photoUrlsMap: Map<string, string>
): Promise<string> {
  // Get photo URLs for this exposure and convert to base64
  const photoIds = exposure.photoIds || [];
  const photoBase64s: string[] = [];

  for (const photoId of photoIds) {
    const url = photoUrlsMap.get(photoId);
    if (url) {
      try {
        const base64 = await imageToBase64(url);
        if (base64) {
          photoBase64s.push(base64);
        }
      } catch (error) {
        console.error(`Error converting photo ${photoId} to base64:`, error);
      }
    }
  }

  const photosHTML =
    photoBase64s.length > 0
      ? `
      <div class="photos">
        <h3>Photos (${photoBase64s.length})</h3>
        <div class="photo-grid">
          ${photoBase64s
            .map(
              base64 => `
            <img src="${base64}" alt="Exposure photo" class="photo-img" />
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  const locationText = exposure.location.siteName
    ? `${exposure.location.siteName} (${exposure.location.address || 'Location captured'})`
    : exposure.location.address ||
      `${exposure.location.latitude.toFixed(4)}, ${exposure.location.longitude.toFixed(4)}`;

  return `
    <div class="exposure-entry" id="exposure-${index + 1}">
      <h2>Exposure ${index + 1}: ${formatExposureType(exposure.exposureType)}</h2>

      <div class="exposure-details">
        <div class="detail-row">
          <span class="label">Date & Time:</span>
          <span class="value">${format(new Date(exposure.timestamp), 'dd/MM/yyyy HH:mm')}</span>
        </div>

        <div class="detail-row">
          <span class="label">Duration:</span>
          <span class="value">${exposure.duration.hours}h ${exposure.duration.minutes}m</span>
        </div>

        <div class="detail-row">
          <span class="label">Location:</span>
          <span class="value">${locationText}</span>
        </div>

        <div class="detail-row">
          <span class="label">Severity:</span>
          <span class="value severity-${exposure.severity}">${formatSeverity(exposure.severity)}</span>
        </div>

        ${
          exposure.ppe.length > 0
            ? `
        <div class="detail-row">
          <span class="label">PPE Used:</span>
          <span class="value">${exposure.ppe.join(', ')}</span>
        </div>
        `
            : ''
        }

        <div class="detail-row">
          <span class="label">Work Activity:</span>
          <span class="value">${exposure.workActivity}</span>
        </div>

        ${
          exposure.notes
            ? `
        <div class="detail-row">
          <span class="label">Notes:</span>
          <span class="value">${exposure.notes}</span>
        </div>
        `
            : ''
        }

        ${
          exposure.chemicalName
            ? `
        <div class="detail-row">
          <span class="label">Chemical Name:</span>
          <span class="value">${exposure.chemicalName}</span>
        </div>
        `
            : ''
        }

        ${
          exposure.sdsReference
            ? `
        <div class="detail-row">
          <span class="label">SDS Reference:</span>
          <span class="value">${exposure.sdsReference}</span>
        </div>
        `
            : ''
        }

        ${
          exposure.controlMeasures
            ? `
        <div class="detail-row">
          <span class="label">Control Measures:</span>
          <span class="value">${exposure.controlMeasures}</span>
        </div>
        `
            : ''
        }
      </div>

      ${photosHTML}
    </div>
  `;
}

/**
 * T066: Generate PDF with cover page, TOC, and exposure entries
 */
export async function generatePDF(
  exposures: ExposureForExport[],
  userInfo: UserInfo,
  photoUrlsMap: Map<string, string> = new Map()
): Promise<string> {
  // Generate exposure HTML entries
  const exposureEntries = await Promise.all(
    exposures.map((exposure, index) => generateExposureHTML(exposure, index, photoUrlsMap))
  );

  // Generate table of contents
  const tocEntries = exposures
    .map(
      (exposure, index) => `
      <li>
        <a href="#exposure-${index + 1}">
          ${formatExposureType(exposure.exposureType)} - ${format(new Date(exposure.timestamp), 'dd/MM/yyyy HH:mm')}
        </a>
      </li>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Workplace Exposure Documentation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          /* Cover Page */
          .cover-page {
            page-break-after: always;
            text-align: center;
            padding: 100px 0;
          }

          .cover-page h1 {
            font-size: 32pt;
            margin-bottom: 40px;
            color: #0066CC;
          }

          .cover-page .subtitle {
            font-size: 16pt;
            color: #666;
            margin-bottom: 60px;
          }

          .cover-page .user-info {
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
            padding: 30px;
            background: #f5f5f5;
            border-radius: 8px;
          }

          .cover-page .user-info div {
            margin-bottom: 10px;
          }

          .cover-page .user-info .label {
            font-weight: 600;
            display: inline-block;
            width: 120px;
          }

          .cover-page .generated {
            margin-top: 60px;
            font-size: 10pt;
            color: #999;
          }

          /* Table of Contents */
          .toc {
            page-break-after: always;
            padding: 40px 0;
          }

          .toc h2 {
            font-size: 24pt;
            margin-bottom: 30px;
            color: #0066CC;
          }

          .toc ul {
            list-style: none;
          }

          .toc li {
            margin-bottom: 15px;
            padding-left: 20px;
            border-left: 3px solid #0066CC;
          }

          .toc a {
            text-decoration: none;
            color: #333;
            font-size: 12pt;
          }

          .toc a:hover {
            color: #0066CC;
          }

          /* Exposure Entries */
          .exposure-entry {
            page-break-before: always;
            padding: 40px 0;
          }

          .exposure-entry h2 {
            font-size: 20pt;
            color: #0066CC;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0066CC;
          }

          .exposure-details {
            margin-bottom: 30px;
          }

          .detail-row {
            display: flex;
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
          }

          .detail-row .label {
            font-weight: 600;
            min-width: 180px;
            color: #555;
          }

          .detail-row .value {
            flex: 1;
          }

          .severity-low {
            color: #28a745;
          }

          .severity-medium {
            color: #ffc107;
          }

          .severity-high {
            color: #dc3545;
          }

          /* Photos */
          .photos {
            margin-top: 30px;
            page-break-inside: avoid;
          }

          .photos h3 {
            font-size: 16pt;
            color: #0066CC;
            margin-bottom: 15px;
          }

          .photo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }

          .photo-img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          /* Print styles */
          @media print {
            body {
              padding: 0;
            }

            .cover-page, .toc, .exposure-entry {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
          <h1>Workplace Exposure Documentation</h1>
          <div class="subtitle">
            Professional Record for ACC Claims
          </div>

          <div class="user-info">
            <div>
              <span class="label">Name:</span>
              <span>${userInfo.name || 'N/A'}</span>
            </div>
            <div>
              <span class="label">Email:</span>
              <span>${userInfo.email}</span>
            </div>
            ${
              userInfo.phoneNumber
                ? `
            <div>
              <span class="label">Phone:</span>
              <span>${userInfo.phoneNumber}</span>
            </div>
            `
                : ''
            }
            ${
              userInfo.occupation
                ? `
            <div>
              <span class="label">Occupation:</span>
              <span>${userInfo.occupation}</span>
            </div>
            `
                : ''
            }
            ${
              userInfo.employer
                ? `
            <div>
              <span class="label">Employer:</span>
              <span>${userInfo.employer}</span>
            </div>
            `
                : ''
            }
            <div>
              <span class="label">Total Exposures:</span>
              <span>${exposures.length}</span>
            </div>
          </div>

          <div class="generated">
            Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')} via Waldo Health
          </div>
        </div>

        <!-- Table of Contents -->
        <div class="toc">
          <h2>Table of Contents</h2>
          <ul>
            ${tocEntries}
          </ul>
        </div>

        <!-- Exposure Entries -->
        ${exposureEntries.join('\n')}
      </body>
    </html>
  `;

  // Generate PDF from HTML
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
