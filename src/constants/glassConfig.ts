/**
 * Glass Effect Configuration
 * Liquid Glass design pattern presets for iOS-style translucent surfaces
 *
 * @module constants/glassConfig
 * @since 003-liquid-glass
 */

import { colors } from './theme';

/**
 * Glass tint color schemes
 */
export type GlassTint = 'light' | 'dark' | 'default';

/**
 * Available glass effect presets
 */
export type GlassPresetName = 'navigation' | 'card' | 'modal' | 'button' | 'input';

/**
 * Glass effect configuration
 */
export interface GlassEffectConfig {
  /** Blur intensity (0-100) */
  intensity: number;
  /** Blur tint color scheme */
  tint: GlassTint;
  /** Solid color fallback for Reduce Transparency mode and Android */
  fallbackColor: string;
  /** Border radius in points */
  cornerRadius: number;
}

/**
 * Predefined glass effect presets for common UI patterns
 *
 * Each preset is optimized for specific use cases:
 * - navigation: Tab bars and navigation headers (85% blur)
 * - card: Exposure cards and content containers (75% blur)
 * - modal: Modal overlays and dialogs (50% dark blur)
 * - button: Primary and secondary buttons (80% blur)
 * - input: Form input fields (70% blur)
 */
export const glassPresets: Record<GlassPresetName, GlassEffectConfig> = {
  navigation: {
    intensity: 85,
    tint: 'light',
    fallbackColor: colors.surface, // #F5F5F5
    cornerRadius: 0,
  },
  card: {
    intensity: 75,
    tint: 'light',
    fallbackColor: colors.surface, // #F5F5F5
    cornerRadius: 12,
  },
  modal: {
    intensity: 50,
    tint: 'dark',
    fallbackColor: 'rgba(0, 0, 0, 0.6)',
    cornerRadius: 16,
  },
  button: {
    intensity: 80,
    tint: 'light',
    fallbackColor: colors.primary + '20', // Primary with 12% opacity
    cornerRadius: 8,
  },
  input: {
    intensity: 70,
    tint: 'default',
    fallbackColor: colors.surfaceVariant, // #E0E0E0
    cornerRadius: 8,
  },
};

/**
 * Get a glass preset by name
 *
 * @param presetName - Name of the preset to retrieve
 * @returns Glass effect configuration
 * @throws Error if preset name is invalid
 *
 * @example
 * ```typescript
 * const cardConfig = getGlassPreset('card');
 * // { intensity: 75, tint: 'light', fallbackColor: '#F5F5F5', cornerRadius: 12 }
 * ```
 */
export function getGlassPreset(presetName: GlassPresetName): GlassEffectConfig {
  const preset = glassPresets[presetName];
  if (!preset) {
    throw new Error(
      `Invalid glass preset name: ${presetName}. Available presets: ${Object.keys(
        glassPresets
      ).join(', ')}`
    );
  }
  return preset;
}

/**
 * Merge a glass preset with custom overrides
 *
 * @param presetName - Name of the base preset
 * @param overrides - Custom configuration values to override preset
 * @returns Merged glass effect configuration
 *
 * @example
 * ```typescript
 * const customCard = mergeGlassPreset('card', { intensity: 90 });
 * // { intensity: 90, tint: 'light', fallbackColor: '#F5F5F5', cornerRadius: 12 }
 * ```
 */
export function mergeGlassPreset(
  presetName: GlassPresetName,
  overrides: Partial<GlassEffectConfig>
): GlassEffectConfig {
  const preset = getGlassPreset(presetName);
  return { ...preset, ...overrides };
}

/**
 * Clamp blur intensity to valid range (0-100)
 *
 * @param intensity - Blur intensity value
 * @returns Clamped intensity value
 *
 * @example
 * ```typescript
 * clampIntensity(150); // 100
 * clampIntensity(-10); // 0
 * clampIntensity(75);  // 75
 * ```
 */
export function clampIntensity(intensity: number): number {
  return Math.max(0, Math.min(100, intensity));
}
