/**
 * T121-T125: Accessibility Utilities
 *
 * Helper functions for WCAG 2.1 AA compliance:
 * - Color contrast checking
 * - Touch target validation
 * - Screen reader helpers
 * - Accessibility props generation
 */

import { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * WCAG 2.1 AA Contrast Ratios
 */
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5, // 4.5:1 for normal text
  LARGE_TEXT: 3.0, // 3:1 for large text (18pt+ or 14pt+ bold)
  UI_COMPONENTS: 3.0, // 3:1 for UI components and graphics
};

/**
 * Minimum touch target sizes (in points/dp)
 */
export const TOUCH_TARGET_SIZES = {
  IOS_MINIMUM: 44, // iOS HIG minimum
  ANDROID_MINIMUM: 48, // Android Material Design minimum
  RECOMMENDED: 48, // Safe for both platforms
};

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1
 */
export function getRelativeLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16) / 255;
  const g = parseInt(color.substr(2, 2), 16) / 255;
  const b = parseInt(color.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio (e.g., 4.5)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG 2.1 AA standard
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const required = largeText ? CONTRAST_RATIOS.LARGE_TEXT : CONTRAST_RATIOS.NORMAL_TEXT;

  return ratio >= required;
}

/**
 * Validate touch target size
 */
export function isTouchTargetSufficient(width: number, height: number, platform: 'ios' | 'android' = 'ios'): boolean {
  const minimum = platform === 'ios' ? TOUCH_TARGET_SIZES.IOS_MINIMUM : TOUCH_TARGET_SIZES.ANDROID_MINIMUM;
  return width >= minimum && height >= minimum;
}

/**
 * Generate accessibility props for a button
 */
export function buttonA11yProps(
  label: string,
  hint?: string,
  disabled?: boolean,
  state?: AccessibilityState
): {
  accessible: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
} {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: state || { disabled: disabled || false },
  };
}

/**
 * Generate accessibility props for a text input
 */
export function inputA11yProps(
  label: string,
  value?: string,
  required?: boolean,
  error?: string
): {
  accessible: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel: string;
  accessibilityValue?: { text: string };
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
} {
  return {
    accessible: true,
    accessibilityRole: 'none', // Use 'none' for TextInput, it has built-in a11y
    accessibilityLabel: label,
    accessibilityValue: value ? { text: value } : undefined,
    accessibilityHint: error || (required ? 'Required field' : undefined),
    accessibilityState: error ? { disabled: false } : undefined,
  };
}

/**
 * Generate accessibility props for an image
 */
export function imageA11yProps(
  description: string,
  decorative: boolean = false
): {
  accessible: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
} {
  if (decorative) {
    return {
      accessible: false,
    };
  }

  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: description,
  };
}

/**
 * Generate accessibility props for a link
 */
export function linkA11yProps(
  label: string,
  url?: string
): {
  accessible: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel: string;
  accessibilityHint?: string;
} {
  return {
    accessible: true,
    accessibilityRole: 'link',
    accessibilityLabel: label,
    accessibilityHint: url ? `Opens ${url}` : 'Opens link',
  };
}

/**
 * Generate accessibility props for a header
 */
export function headerA11yProps(
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1
): {
  accessible: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel: string;
} {
  return {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: `${text}, heading level ${level}`,
  };
}

/**
 * Create accessibility label for exposure type
 */
export function exposureTypeA11yLabel(exposureType: string, icon?: string): string {
  const cleanType = exposureType.replace(/_/g, ' ').toLowerCase();
  return icon ? `${icon} ${cleanType} exposure` : `${cleanType} exposure`;
}

/**
 * Create accessibility label for date
 */
export function dateA11yLabel(date: Date | number, prefix: string = 'Date'): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `${prefix}: ${formatted}`;
}

/**
 * Create accessibility label for location
 */
export function locationA11yLabel(siteName?: string | null, address?: string | null): string {
  if (siteName && address) {
    return `Location: ${siteName}, ${address}`;
  }
  if (siteName) {
    return `Location: ${siteName}`;
  }
  if (address) {
    return `Location: ${address}`;
  }
  return 'Location not specified';
}

/**
 * Create accessibility label for status badge
 */
export function statusBadgeA11yLabel(status: string, label?: string): string {
  const cleanStatus = status.replace(/_/g, ' ').toLowerCase();
  return label ? `${label}: ${cleanStatus}` : `Status: ${cleanStatus}`;
}

/**
 * Announce to screen reader (for dynamic content changes)
 */
export function announceForAccessibility(message: string): void {
  // This would use AccessibilityInfo.announceForAccessibility in React Native
  if (__DEV__) {
    console.log(`[A11y Announcement] ${message}`);
  }
}

/**
 * Color contrast audit helper
 * Returns array of failing combinations
 */
export function auditColorContrast(
  colorPairs: Array<{ foreground: string; background: string; context: string; largeText?: boolean }>
): Array<{ context: string; ratio: number; required: number; passes: boolean }> {
  return colorPairs.map(pair => {
    const ratio = getContrastRatio(pair.foreground, pair.background);
    const required = pair.largeText ? CONTRAST_RATIOS.LARGE_TEXT : CONTRAST_RATIOS.NORMAL_TEXT;
    const passes = ratio >= required;

    return {
      context: pair.context,
      ratio: Math.round(ratio * 100) / 100,
      required,
      passes,
    };
  });
}

/**
 * Generate test ID for automated testing
 */
export function testID(id: string): { testID: string } {
  return { testID: id };
}

/**
 * Combine accessibility props
 */
export function combineA11yProps(
  ...props: Array<Record<string, any>>
): Record<string, any> {
  return Object.assign({}, ...props);
}

/**
 * Validate glass surface contrast meets WCAG 2.1 AA standards
 * (003-liquid-glass specific)
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text: 4.5:1 minimum
 * - Large text (18pt+): 3:1 minimum
 * - UI components: 3:1 minimum
 *
 * @param fallbackColor - Solid fallback color for glass surface
 * @param textColor - Text color to display on glass
 * @param minimumRatio - Minimum contrast ratio (default: 4.5 for normal text)
 * @returns Validation result with accessibility status and actual ratio
 *
 * @example
 * ```tsx
 * const result = validateGlassContrast('#F5F5F5', '#212121');
 * console.log(result.isAccessible); // true
 * console.log(result.ratio); // 16.1
 * console.log(result.level); // 'AAA'
 * ```
 */
export function validateGlassContrast(
  fallbackColor: string,
  textColor: string,
  minimumRatio: number = CONTRAST_RATIOS.NORMAL_TEXT
): {
  isAccessible: boolean;
  ratio: number;
  level: 'AAA' | 'AA' | 'FAIL';
  message: string;
} {
  const ratio = getContrastRatio(fallbackColor, textColor);

  // Determine WCAG level
  let level: 'AAA' | 'AA' | 'FAIL';
  if (ratio >= 7.0) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else {
    level = 'FAIL';
  }

  const isAccessible = ratio >= minimumRatio;

  const message = isAccessible
    ? `Contrast ratio ${ratio.toFixed(2)}:1 meets WCAG ${level} (≥${minimumRatio}:1 required)`
    : `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA (≥${minimumRatio}:1 required)`;

  return {
    isAccessible,
    ratio: parseFloat(ratio.toFixed(2)),
    level,
    message,
  };
}
