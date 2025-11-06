/**
 * Voice Recognition Utility
 * Handles speech-to-text and intelligent parsing for hands-free exposure documentation
 *
 * Uses @react-native-voice/voice for speech recognition
 * Supports NZ English (en-NZ) with fallback to AU English (en-AU)
 *
 * Note: This file focuses on parsing logic and doesn't require native Voice module
 * Native Voice integration is handled in useVoice hook
 */

// No Voice import needed - this file only does parsing

/**
 * Initialize voice recognition with NZ English locale
 */
export async function initializeVoice(): Promise<void> {
  // Voice is initialized per-session in the hook
  // This function is a placeholder for future config
}

/**
 * Exposure type keywords for recognition
 */
const EXPOSURE_TYPE_KEYWORDS: Record<string, string[]> = {
  silica_dust: ['silica', 'silica dust', 'dust', 'concrete dust', 'stone dust'],
  asbestos_class_a: ['asbestos class a', 'asbestos class 1', 'friable asbestos'],
  asbestos_class_b: ['asbestos class b', 'asbestos class 2', 'non-friable asbestos'],
  welding_fumes: ['welding', 'welding fumes', 'weld', 'welding smoke'],
  hazardous_chemicals: ['hazardous chemicals', 'chemicals', 'toxic chemicals', 'chemical spill'],
  noise: ['noise', 'loud noise', 'excessive noise'],
  vibration: ['vibration', 'vibrating tools', 'hand arm vibration'],
  heat_stress: ['heat stress', 'hot conditions', 'heat exhaustion'],
  cold_exposure: ['cold exposure', 'cold conditions', 'freezing'],
  contaminated_soils: ['contaminated soil', 'contaminated ground', 'soil contamination'],
  lead: ['lead', 'lead paint', 'lead dust'],
  confined_space: ['confined space', 'confined area', 'enclosed space'],
};

/**
 * PPE keywords for recognition
 */
const PPE_KEYWORDS: Record<string, string[]> = {
  P2_RESPIRATOR: ['p2 respirator', 'p2 mask', 'p2', 'respirator'],
  P3_RESPIRATOR: ['p3 respirator', 'p3 mask', 'p3'],
  HALF_FACE_RESPIRATOR: ['half face respirator', 'half mask'],
  FULL_FACE_RESPIRATOR: ['full face respirator', 'full mask'],
  SAFETY_GLASSES: ['safety glasses', 'safety goggles', 'eye protection'],
  HARD_HAT: ['hard hat', 'helmet', 'safety helmet'],
  GLOVES: ['gloves', 'safety gloves', 'chemical gloves', 'work gloves'],
  STEEL_CAP_BOOTS: ['steel cap boots', 'steel toe boots', 'safety boots'],
  HI_VIS_CLOTHING: ['hi vis', 'high visibility', 'hi-vis vest'],
  HEARING_PROTECTION: ['hearing protection', 'ear muffs', 'ear plugs', 'earplugs'],
  WELDING_MASK: ['welding mask', 'welding helmet', 'welding shield'],
};

/**
 * Duration parsing patterns
 */
const DURATION_PATTERNS = {
  hours: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i,
  minutes: /(\d+)\s*(?:minutes?|mins?|m)/i,
  hourWords: /(one|two|three|four|five|six|seven|eight) hours?/i,
  halfHour: /(?:half an? hour|30 minutes)/i,
  quarterHour: /(?:quarter (?:of an )?hour|15 minutes)/i,
  hourAndHalf: /(?:hour and a half|1\.5 hours)/i,
  coupleHours: /(?:couple of hours|2 hours)/i,
};

/**
 * Severity keywords
 */
const SEVERITY_KEYWORDS = {
  high: ['heavy', 'severe', 'intense', 'thick', 'very', 'extreme', 'major'],
  medium: ['moderate', 'some', 'noticeable', 'fair amount', 'decent'],
  low: ['light', 'minimal', 'slight', 'little', 'minor'],
};

/**
 * Convert word numbers to digits
 */
const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
};

/**
 * Parse exposure type from transcript
 */
export function parseExposureType(transcript: string): string | null {
  const lowerTranscript = transcript.toLowerCase();

  // Check each exposure type's keywords
  for (const [type, keywords] of Object.entries(EXPOSURE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTranscript.includes(keyword)) {
        return type;
      }
    }
  }

  return null;
}

/**
 * Parse duration from transcript
 * Returns { hours, minutes }
 */
export function parseDuration(transcript: string): { hours: number; minutes: number } | null {
  const lowerTranscript = transcript.toLowerCase();

  // Check for hour and a half
  if (DURATION_PATTERNS.hourAndHalf.test(lowerTranscript)) {
    return { hours: 1, minutes: 30 };
  }

  // Check for couple of hours
  if (DURATION_PATTERNS.coupleHours.test(lowerTranscript)) {
    return { hours: 2, minutes: 0 };
  }

  // Check for half hour
  if (DURATION_PATTERNS.halfHour.test(lowerTranscript)) {
    return { hours: 0, minutes: 30 };
  }

  // Check for quarter hour
  if (DURATION_PATTERNS.quarterHour.test(lowerTranscript)) {
    return { hours: 0, minutes: 15 };
  }

  // Check for hour words (e.g., "four hours")
  const hourWordsMatch = lowerTranscript.match(DURATION_PATTERNS.hourWords);
  if (hourWordsMatch) {
    const wordNum = hourWordsMatch[1];
    const hours = WORD_TO_NUMBER[wordNum] || 0;
    return { hours, minutes: 0 };
  }

  // Check for numeric hours
  const hoursMatch = transcript.match(DURATION_PATTERNS.hours);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    return { hours: Math.floor(hours), minutes: Math.round((hours % 1) * 60) };
  }

  // Check for numeric minutes
  const minutesMatch = transcript.match(DURATION_PATTERNS.minutes);
  if (minutesMatch) {
    const totalMinutes = parseInt(minutesMatch[1]);
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
  }

  return null;
}

/**
 * Parse PPE from transcript
 * Returns array of PPE type keys
 */
export function parsePPE(transcript: string): string[] {
  const lowerTranscript = transcript.toLowerCase();
  const foundPPE: string[] = [];

  for (const [ppeType, keywords] of Object.entries(PPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTranscript.includes(keyword)) {
        if (!foundPPE.includes(ppeType)) {
          foundPPE.push(ppeType);
        }
        break;
      }
    }
  }

  return foundPPE;
}

/**
 * Parse severity from transcript
 */
export function parseSeverity(transcript: string): 'low' | 'medium' | 'high' | null {
  const lowerTranscript = transcript.toLowerCase();

  // Check high severity first (most specific)
  for (const keyword of SEVERITY_KEYWORDS.high) {
    if (lowerTranscript.includes(keyword)) {
      return 'high';
    }
  }

  // Check low severity
  for (const keyword of SEVERITY_KEYWORDS.low) {
    if (lowerTranscript.includes(keyword)) {
      return 'low';
    }
  }

  // Check medium severity
  for (const keyword of SEVERITY_KEYWORDS.medium) {
    if (lowerTranscript.includes(keyword)) {
      return 'medium';
    }
  }

  return null;
}

/**
 * Parse work activity from transcript
 * Extracts the activity description
 */
export function parseWorkActivity(transcript: string): string | null {
  // Common activity patterns
  const activityPatterns = [
    /(?:cutting|drilling|grinding|welding|mixing|pouring|sanding|demolition|demo)\s+[\w\s]{3,30}/i,
    /(?:working with|using|applying|removing)\s+[\w\s]{3,30}/i,
  ];

  for (const pattern of activityPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      // Clean up the matched activity
      return match[0].trim();
    }
  }

  // Only return null - don't accept arbitrary text as work activity
  // This allows unparsed text to flow to the notes field
  return null;
}

/**
 * Parse chemical name from transcript
 */
export function parseChemicalName(transcript: string): string | null {
  const commonChemicals = [
    'toluene',
    'xylene',
    'acetone',
    'methanol',
    'ethanol',
    'benzene',
    'formaldehyde',
    'ammonia',
    'chlorine',
    'paint thinner',
    'solvent',
    'adhesive',
  ];

  const lowerTranscript = transcript.toLowerCase();

  for (const chemical of commonChemicals) {
    if (lowerTranscript.includes(chemical)) {
      return chemical;
    }
  }

  return null;
}

/**
 * Parse complete transcript into exposure fields
 * Returns structured data for form population
 */
export interface ParsedExposure {
  exposureType?: string;
  duration?: { hours: number; minutes: number };
  severity?: 'low' | 'medium' | 'high';
  ppe?: string[];
  workActivity?: string;
  chemicalName?: string;
  notes?: string;
}

export function parseTranscript(transcript: string): ParsedExposure {
  const parsed: ParsedExposure = {};

  // Parse each field
  const exposureType = parseExposureType(transcript);
  if (exposureType) {
    parsed.exposureType = exposureType;
  }

  const duration = parseDuration(transcript);
  if (duration) {
    parsed.duration = duration;
  }

  const severity = parseSeverity(transcript);
  if (severity) {
    parsed.severity = severity;
  }

  const ppe = parsePPE(transcript);
  if (ppe.length > 0) {
    parsed.ppe = ppe;
  }

  const workActivity = parseWorkActivity(transcript);
  if (workActivity) {
    parsed.workActivity = workActivity;
  }

  const chemicalName = parseChemicalName(transcript);
  if (chemicalName) {
    parsed.chemicalName = chemicalName;
  }

  // Store full transcript as notes if nothing was extracted and it's not too short
  const hasAnyParsedData = Object.keys(parsed).length > 0;
  if (!hasAnyParsedData && transcript.trim().length > 10) {
    parsed.notes = transcript.trim();
  }

  return parsed;
}

/**
 * Clean up Voice on app exit
 * Note: This is now handled in the useVoice hook cleanup
 * This function is kept for backward compatibility but does nothing
 */
export async function destroyVoice(): Promise<void> {
  // Voice cleanup is now handled in useVoice hook's useEffect cleanup
  // This function is a no-op for Expo Go compatibility
}
