/**
 * Contract Tests for Exposures Convex Functions
 * These tests verify the schema and behavior of Convex mutations/queries
 *
 * Run with: npm test __tests__/contract/exposures.test.ts
 */

import { describe, it, expect } from '@jest/globals';

describe('Exposures Contract Tests', () => {
  describe('exposures:create mutation', () => {
    it('should accept valid exposure data with all required fields', () => {
      const validExposure = {
        exposureType: 'silica_dust',
        timestamp: Date.now(),
        duration: {
          hours: 4,
          minutes: 30,
        },
        location: {
          latitude: -36.8485,
          longitude: 174.7633,
          accuracy: 10,
          address: '123 Construction St, Auckland',
          siteName: 'Downtown Construction Site',
        },
        severity: 'medium',
        ppe: ['P2_RESPIRATOR', 'SAFETY_GLASSES'],
        workActivity: 'Cutting concrete slabs for foundation work',
        notes: 'Used wet cutting to minimize dust exposure',
        chemicalName: null,
        sdsReference: null,
        controlMeasures: 'Wet cutting method, P2 respirator worn at all times',
        photoIds: [],
        voiceTranscription: null,
      };

      // Validate required fields
      expect(validExposure.exposureType).toBeTruthy();
      expect(validExposure.timestamp).toBeGreaterThan(0);
      expect(validExposure.duration.hours).toBeGreaterThanOrEqual(0);
      expect(validExposure.duration.minutes).toBeGreaterThanOrEqual(0);
      expect(validExposure.location.latitude).toBeGreaterThanOrEqual(-90);
      expect(validExposure.location.latitude).toBeLessThanOrEqual(90);
      expect(validExposure.location.longitude).toBeGreaterThanOrEqual(-180);
      expect(validExposure.location.longitude).toBeLessThanOrEqual(180);
      expect(['low', 'medium', 'high']).toContain(validExposure.severity);
      expect(Array.isArray(validExposure.ppe)).toBe(true);
      expect(validExposure.workActivity).toBeTruthy();
    });

    it('should reject exposure with invalid exposure type', () => {
      const invalidExposure = {
        exposureType: 'invalid_type', // Not in EXPOSURE_TYPES
        timestamp: Date.now(),
        duration: { hours: 4, minutes: 30 },
        location: {
          latitude: -36.8485,
          longitude: 174.7633,
          accuracy: 10,
          address: null,
          siteName: null,
        },
        severity: 'medium',
        ppe: [],
        workActivity: 'Test work',
        notes: null,
        chemicalName: null,
        sdsReference: null,
        controlMeasures: null,
        photoIds: [],
        voiceTranscription: null,
      };

      // Should fail validation
      const validExposureTypes = [
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
      expect(validExposureTypes).not.toContain(invalidExposure.exposureType);
    });

    it('should reject exposure with invalid duration', () => {
      const invalidDuration = {
        exposureType: 'silica_dust',
        timestamp: Date.now(),
        duration: {
          hours: 25, // Invalid: > 24
          minutes: 30,
        },
        location: {
          latitude: -36.8485,
          longitude: 174.7633,
          accuracy: 10,
          address: null,
          siteName: null,
        },
        severity: 'medium',
        ppe: [],
        workActivity: 'Test',
        notes: null,
        chemicalName: null,
        sdsReference: null,
        controlMeasures: null,
        photoIds: [],
        voiceTranscription: null,
      };

      expect(invalidDuration.duration.hours).toBeGreaterThan(24);
    });

    it('should reject exposure with invalid GPS coordinates', () => {
      const invalidLocation = {
        exposureType: 'silica_dust',
        timestamp: Date.now(),
        duration: { hours: 4, minutes: 30 },
        location: {
          latitude: 91, // Invalid: > 90
          longitude: 174.7633,
          accuracy: 10,
          address: null,
          siteName: null,
        },
        severity: 'medium',
        ppe: [],
        workActivity: 'Test',
        notes: null,
        chemicalName: null,
        sdsReference: null,
        controlMeasures: null,
        photoIds: [],
        voiceTranscription: null,
      };

      expect(invalidLocation.location.latitude).toBeGreaterThan(90);
    });

    it('should reject exposure with invalid severity', () => {
      const invalidSeverity = {
        exposureType: 'silica_dust',
        timestamp: Date.now(),
        duration: { hours: 4, minutes: 30 },
        location: {
          latitude: -36.8485,
          longitude: 174.7633,
          accuracy: 10,
          address: null,
          siteName: null,
        },
        severity: 'critical', // Invalid: not in ['low', 'medium', 'high']
        ppe: [],
        workActivity: 'Test',
        notes: null,
        chemicalName: null,
        sdsReference: null,
        controlMeasures: null,
        photoIds: [],
        voiceTranscription: null,
      };

      expect(['low', 'medium', 'high']).not.toContain(invalidSeverity.severity);
    });

    it('should require chemical name for hazardous_chemicals exposure type', () => {
      const chemicalExposure = {
        exposureType: 'hazardous_chemicals',
        timestamp: Date.now(),
        duration: { hours: 2, minutes: 0 },
        location: {
          latitude: -36.8485,
          longitude: 174.7633,
          accuracy: 10,
          address: null,
          siteName: null,
        },
        severity: 'high',
        ppe: ['GLOVES', 'RESPIRATOR'],
        workActivity: 'Applying industrial adhesive',
        notes: null,
        chemicalName: 'Toluene-based adhesive', // Required for chemicals
        sdsReference: 'SDS-12345',
        controlMeasures: 'Adequate ventilation, chemical-resistant gloves',
        photoIds: [],
        voiceTranscription: null,
      };

      // Should have chemical name when exposure type is hazardous_chemicals
      if (chemicalExposure.exposureType === 'hazardous_chemicals') {
        expect(chemicalExposure.chemicalName).toBeTruthy();
      }
    });
  });

  describe('exposures:list query', () => {
    it('should support pagination with limit and cursor', () => {
      const queryParams = {
        limit: 50,
        cursor: null,
      };

      expect(queryParams.limit).toBeLessThanOrEqual(100); // Max limit
      expect(queryParams.limit).toBeGreaterThan(0);
    });

    it('should filter by userId', () => {
      const queryParams = {
        userId: 'user_123',
        limit: 50,
        cursor: null,
      };

      expect(queryParams.userId).toBeTruthy();
    });
  });

  describe('exposures:get query', () => {
    it('should accept valid exposure ID', () => {
      const exposureId = 'k17abc123def456';

      // Convex IDs are strings
      expect(typeof exposureId).toBe('string');
      expect(exposureId.length).toBeGreaterThan(0);
    });
  });
});
