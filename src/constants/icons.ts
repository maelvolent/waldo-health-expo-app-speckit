/**
 * Icon Mapping Constants
 * Centralized mapping of exposure types and severity levels to Ionicons
 *
 * Usage:
 *   import { EXPOSURE_TYPE_ICONS, SEVERITY_ICONS } from '@/constants/icons';
 *   <Ionicons name={EXPOSURE_TYPE_ICONS[exposure.exposureType]} size={24} />
 */

import { Ionicons } from '@expo/vector-icons';

/**
 * Maps exposure type IDs to their corresponding Ionicon names
 */
export const EXPOSURE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  silica_dust: 'cloud-outline',
  asbestos_class_a: 'warning',
  asbestos_class_b: 'warning-outline',
  welding_fumes: 'flame',
  hazardous_chemicals: 'flask',
  noise: 'volume-high',
  vibration: 'pulse',
  heat_stress: 'thermometer',
  cold_exposure: 'snow',
  contaminated_soils: 'earth',
  lead: 'beaker',
  confined_space: 'contract',
};

/**
 * Maps severity levels to their corresponding Ionicon names
 */
export const SEVERITY_ICONS = {
  low: 'checkmark-circle-outline' as const,
  medium: 'alert-circle-outline' as const,
  high: 'close-circle' as const,
};

/**
 * Maps severity levels to their theme colors
 */
export const SEVERITY_COLORS = {
  low: '#22C55E',    // Green
  medium: '#F59E0B', // Amber
  high: '#EF4444',   // Red
};

/**
 * Tab navigation icon mapping
 */
export const TAB_ICONS = {
  home: {
    active: 'home' as const,
    inactive: 'home-outline' as const,
  },
  new: {
    active: 'add-circle' as const,
    inactive: 'add-circle-outline' as const,
  },
  map: {
    active: 'map' as const,
    inactive: 'map-outline' as const,
  },
  education: {
    active: 'book' as const,
    inactive: 'book-outline' as const,
  },
  profile: {
    active: 'person' as const,
    inactive: 'person-outline' as const,
  },
};

/**
 * Common UI icons used throughout the app
 */
export const UI_ICONS = {
  search: 'search' as const,
  filter: 'filter' as const,
  close: 'close' as const,
  checkmark: 'checkmark' as const,
  arrowBack: 'arrow-back' as const,
  arrowForward: 'arrow-forward' as const,
  refresh: 'refresh' as const,
  download: 'download' as const,
  share: 'share-social' as const,
  trash: 'trash' as const,
  edit: 'create' as const,
  camera: 'camera' as const,
  mic: 'mic' as const,
  location: 'location' as const,
  calendar: 'calendar' as const,
  time: 'time' as const,
  document: 'document-text' as const,
  settings: 'settings' as const,
  information: 'information-circle' as const,
  warning: 'warning' as const,
  error: 'alert-circle' as const,
  success: 'checkmark-circle' as const,
};

/**
 * Standard icon sizes (in pixels)
 */
export const ICON_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;
