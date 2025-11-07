/**
 * useGlassTheme Hook
 * Manages glass presets with theme integration
 *
 * @module hooks/useGlassTheme
 * @since 003-liquid-glass
 */

import { useMemo } from 'react';
import {
  getGlassPreset,
  mergeGlassPreset,
  GlassPresetName,
  GlassEffectConfig,
} from '@constants/glassConfig';

/**
 * Hook for loading and managing glass presets
 *
 * Provides type-safe access to glass effect presets with optional
 * custom overrides. Memoizes results to prevent unnecessary re-renders.
 *
 * @param presetName - Name of the preset to load
 * @param overrides - Optional custom values to override preset
 * @returns Glass effect configuration
 * @throws Error if preset name is invalid
 *
 * @example
 * ```tsx
 * function GlassCard() {
 *   // Use preset as-is
 *   const config = useGlassTheme('card');
 *
 *   // Override specific values
 *   const customConfig = useGlassTheme('card', { intensity: 90 });
 *
 *   return <GlassEffect {...config}>Content</GlassEffect>;
 * }
 * ```
 */
export function useGlassTheme(
  presetName: GlassPresetName,
  overrides?: Partial<GlassEffectConfig>
): GlassEffectConfig {
  const config = useMemo(() => {
    if (overrides) {
      return mergeGlassPreset(presetName, overrides);
    }
    return getGlassPreset(presetName);
  }, [presetName, overrides]);

  return config;
}
