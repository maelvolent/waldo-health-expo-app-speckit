/**
 * T075: Unit test for voice-to-text parsing
 * Tests keyword extraction for exposure types, duration, and PPE
 *
 * Run with: npm test __tests__/unit/lib/voice.test.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseExposureType,
  parseDuration,
  parsePPE,
  parseSeverity,
  parseWorkActivity,
  parseChemicalName,
  parseTranscript,
} from '../../../src/lib/voice';

describe('Voice Parsing Unit Tests', () => {
  describe('parseExposureType', () => {
    it('should extract silica dust', () => {
      expect(parseExposureType('I was working with silica dust today')).toBe('silica_dust');
    });

    it('should extract welding fumes', () => {
      expect(parseExposureType('welding steel beams all morning')).toBe('welding_fumes');
    });

    it('should extract asbestos class A', () => {
      expect(parseExposureType('removing asbestos class A insulation')).toBe('asbestos_class_a');
    });

    it('should be case insensitive', () => {
      expect(parseExposureType('SILICA DUST exposure')).toBe('silica_dust');
    });

    it('should return null for unknown types', () => {
      expect(parseExposureType('unknown exposure type')).toBeNull();
    });
  });

  describe('parseDuration', () => {
    it('should extract hours', () => {
      const result = parseDuration('worked for 4 hours');
      expect(result).toEqual({ hours: 4, minutes: 0 });
    });

    it('should extract minutes', () => {
      const result = parseDuration('exposed for 30 minutes');
      expect(result).toEqual({ hours: 0, minutes: 30 });
    });

    it('should handle "hour and a half"', () => {
      const result = parseDuration('about an hour and a half of work');
      expect(result).toEqual({ hours: 1, minutes: 30 });
    });

    it('should handle "couple of hours"', () => {
      const result = parseDuration('couple of hours in the trench');
      expect(result).toEqual({ hours: 2, minutes: 0 });
    });

    it('should handle word numbers', () => {
      const result = parseDuration('worked for four hours');
      expect(result).toEqual({ hours: 4, minutes: 0 });
    });

    it('should return null when no duration found', () => {
      expect(parseDuration('no time mentioned')).toBeNull();
    });
  });

  describe('parsePPE', () => {
    it('should extract P2 respirator', () => {
      const result = parsePPE('wearing P2 respirator');
      expect(result).toContain('P2_RESPIRATOR');
    });

    it('should extract multiple PPE items', () => {
      const result = parsePPE('wearing hard hat, safety glasses, and gloves');
      expect(result).toContain('HARD_HAT');
      expect(result).toContain('SAFETY_GLASSES');
      expect(result).toContain('GLOVES');
    });

    it('should be case insensitive', () => {
      const result = parsePPE('WEARING P2 RESPIRATOR');
      expect(result).toContain('P2_RESPIRATOR');
    });

    it('should return empty array when no PPE found', () => {
      const result = parsePPE('no ppe mentioned');
      expect(result).toEqual([]);
    });
  });

  describe('parseSeverity', () => {
    it('should detect high severity', () => {
      expect(parseSeverity('heavy exposure to dust')).toBe('high');
      expect(parseSeverity('very thick smoke')).toBe('high');
    });

    it('should detect medium severity', () => {
      expect(parseSeverity('moderate dust levels')).toBe('medium');
    });

    it('should detect low severity', () => {
      expect(parseSeverity('light dusting')).toBe('low');
      expect(parseSeverity('minimal exposure')).toBe('low');
    });

    it('should return null when no severity found', () => {
      expect(parseSeverity('no severity mentioned')).toBeNull();
    });
  });

  describe('parseWorkActivity', () => {
    it('should extract cutting activity', () => {
      const result = parseWorkActivity('cutting concrete for foundation');
      expect(result).toContain('cutting concrete');
    });

    it('should extract welding activity', () => {
      const result = parseWorkActivity('welding steel beams');
      expect(result).toContain('welding');
    });

    it('should handle "working with" pattern', () => {
      const result = parseWorkActivity('working with angle grinder');
      expect(result).toContain('working with');
    });
  });

  describe('parseChemicalName', () => {
    it('should extract toluene', () => {
      expect(parseChemicalName('using toluene based adhesive')).toBe('toluene');
    });

    it('should extract paint thinner', () => {
      expect(parseChemicalName('paint thinner for cleanup')).toBe('paint thinner');
    });

    it('should return null when no chemical found', () => {
      expect(parseChemicalName('no chemicals')).toBeNull();
    });
  });

  describe('parseTranscript (full integration)', () => {
    it('should extract multiple fields from complex transcript', () => {
      const transcript =
        'worked for 3 hours cutting concrete, wearing P2 respirator and safety glasses, heavy dust exposure';
      const result = parseTranscript(transcript);

      expect(result.exposureType).toBe('silica_dust');
      expect(result.duration).toEqual({ hours: 3, minutes: 0 });
      expect(result.ppe).toContain('P2_RESPIRATOR');
      expect(result.ppe).toContain('SAFETY_GLASSES');
      expect(result.severity).toBe('high');
      expect(result.workActivity).toContain('cutting concrete');
    });

    it('should handle empty transcript', () => {
      const result = parseTranscript('');
      expect(Object.keys(result).length).toBe(0);
    });

    it('should store unparsed text in notes', () => {
      const transcript = 'this is a random sentence without keywords';
      const result = parseTranscript(transcript);
      expect(result.notes).toBe(transcript);
    });
  });
});
