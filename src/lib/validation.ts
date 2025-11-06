/**
 * Validation Utilities
 * Input validation and sanitization for exposure records
 *
 * Ensures data quality and prevents invalid submissions
 */

import { ExposureDraft, ExposureValidationResult } from '../types/exposure';
import { EXPOSURE_TYPES, PPE_TYPES } from '@constants/exposureTypes';

/**
 * Validate exposure draft before submission
 */
export function validateExposure(draft: ExposureDraft): ExposureValidationResult {
  const errors: ExposureValidationResult['errors'] = [];

  // Exposure type
  if (!draft.exposureType) {
    errors.push({
      field: 'exposureType',
      message: 'Exposure type is required',
    });
  } else if (!EXPOSURE_TYPES[draft.exposureType]) {
    errors.push({
      field: 'exposureType',
      message: 'Invalid exposure type',
    });
  }

  // Duration
  if (draft.duration.hours < 0 || draft.duration.hours > 24) {
    errors.push({
      field: 'duration',
      message: 'Hours must be between 0 and 24',
    });
  }
  if (draft.duration.minutes < 0 || draft.duration.minutes > 59) {
    errors.push({
      field: 'duration',
      message: 'Minutes must be between 0 and 59',
    });
  }
  if (draft.duration.hours === 0 && draft.duration.minutes === 0) {
    errors.push({
      field: 'duration',
      message: 'Duration must be greater than 0',
    });
  }

  // Location
  if (!isValidLatitude(draft.location.latitude)) {
    errors.push({
      field: 'location',
      message: 'Invalid latitude',
    });
  }
  if (!isValidLongitude(draft.location.longitude)) {
    errors.push({
      field: 'location',
      message: 'Invalid longitude',
    });
  }

  // Severity
  if (!['low', 'medium', 'high'].includes(draft.severity)) {
    errors.push({
      field: 'severity',
      message: 'Severity must be low, medium, or high',
    });
  }

  // PPE
  if (!Array.isArray(draft.ppe)) {
    errors.push({
      field: 'ppe',
      message: 'PPE must be an array',
    });
  } else {
    const invalidPPE = draft.ppe.filter(ppe => !PPE_TYPES[ppe]);
    if (invalidPPE.length > 0) {
      errors.push({
        field: 'ppe',
        message: `Invalid PPE types: ${invalidPPE.join(', ')}`,
      });
    }
  }

  // Work activity
  if (!draft.workActivity || draft.workActivity.trim().length === 0) {
    errors.push({
      field: 'workActivity',
      message: 'Work activity is required',
    });
  } else if (draft.workActivity.length > 500) {
    errors.push({
      field: 'workActivity',
      message: 'Work activity must be 500 characters or less',
    });
  }

  // Notes (optional, but limit length)
  if (draft.notes && draft.notes.length > 2000) {
    errors.push({
      field: 'notes',
      message: 'Notes must be 2000 characters or less',
    });
  }

  // Chemical name (required for certain exposure types)
  const chemicalTypes = ['hazardous_chemicals', 'contaminated_soils'];
  if (chemicalTypes.includes(draft.exposureType)) {
    if (!draft.chemicalName || draft.chemicalName.trim().length === 0) {
      errors.push({
        field: 'chemicalName',
        message: 'Chemical name is required for this exposure type',
      });
    }
  }

  // Photos
  if (!Array.isArray(draft.photoUris)) {
    errors.push({
      field: 'photoUris',
      message: 'Photos must be an array',
    });
  } else if (draft.photoUris.length > 5) {
    errors.push({
      field: 'photoUris',
      message: 'Maximum 5 photos allowed',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate latitude
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && lat >= -90 && lat <= 90 && !isNaN(lat);
}

/**
 * Validate longitude
 */
export function isValidLongitude(lng: number): boolean {
  return typeof lng === 'number' && lng >= -180 && lng <= 180 && !isNaN(lng);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (NZ format)
 */
export function isValidNZPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // NZ mobile: 02x xxx xxxx (10 digits)
  // NZ landline: 0x xxx xxxx (9-10 digits)
  // International: +64 x xxx xxxx
  const nzMobileRegex = /^(02[0-9])[0-9]{7}$/;
  const nzLandlineRegex = /^(0[3-9])[0-9]{6,7}$/;
  const internationalRegex = /^\+64[2-9][0-9]{7,9}$/;

  return (
    nzMobileRegex.test(cleaned) || nzLandlineRegex.test(cleaned) || internationalRegex.test(cleaned)
  );
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes > 0 && sizeInBytes <= maxSizeBytes;
}

/**
 * Validate image dimensions
 */
export function isValidImageDimensions(
  width: number,
  height: number,
  maxDimension: number = 4096
): boolean {
  return width > 0 && height > 0 && width <= maxDimension && height <= maxDimension;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: number, endDate: number): boolean {
  return startDate <= endDate && startDate <= Date.now();
}

/**
 * Validate duration format
 */
export function isValidDuration(hours: number, minutes: number): boolean {
  return (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 24 &&
    minutes >= 0 &&
    minutes <= 59 &&
    (hours > 0 || minutes > 0)
  );
}
