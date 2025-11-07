/**
 * GlassEffect Component
 * Core wrapper component for applying iOS-style glass blur effects
 *
 * @module components/common/GlassEffect
 * @since 003-liquid-glass
 */

import React, { useMemo } from 'react';
import { Platform, View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  glassPresets,
  GlassPresetName,
  GlassTint,
  clampIntensity,
} from '@constants/glassConfig';
import { colors } from '@constants/theme';

export interface GlassEffectProps {
  /** Content to render within the glass surface */
  children: React.ReactNode;

  /** Blur intensity (0-100) - overrides preset */
  intensity?: number;

  /** Blur tint color scheme - overrides preset */
  tint?: GlassTint;

  /** Solid color fallback for Reduce Transparency mode - overrides preset */
  fallbackColor?: string;

  /** Additional React Native styles */
  style?: ViewStyle;

  /** Whether to render blur effect (useful for testing/debugging) */
  enabled?: boolean;

  /** Use predefined glass preset */
  preset?: GlassPresetName;

  /** Test identifier for automation */
  testID?: string;
}

/**
 * GlassEffect wrapper component
 *
 * Provides translucent glass-like surfaces with dynamic blur on iOS,
 * with graceful degradation to opaque surfaces on Android.
 *
 * **Platform Behavior**:
 * - iOS: Renders BlurView with specified intensity and tint
 * - Android: Renders opaque View with fallbackColor
 *
 * **Accessibility**:
 * - Respects iOS "Reduce Transparency" system setting
 * - Provides opaque fallback with WCAG 2.1 AA compliant contrast
 * - Works correctly with VoiceOver and screen readers
 *
 * @example
 * ```tsx
 * // Using preset
 * <GlassEffect preset="card">
 *   <Text>Card content</Text>
 * </GlassEffect>
 *
 * // Custom configuration
 * <GlassEffect
 *   intensity={90}
 *   tint="dark"
 *   fallbackColor={colors.surfaceDark}
 *   style={{ padding: 16, borderRadius: 12 }}
 * >
 *   <Text>Custom glass surface</Text>
 * </GlassEffect>
 * ```
 */
export const GlassEffect = React.memo<GlassEffectProps>(
  ({
    children,
    intensity,
    tint,
    fallbackColor,
    style,
    enabled = true,
    preset,
    testID,
  }) => {
    // Load preset configuration if specified
    const config = useMemo(() => {
      if (preset) {
        const presetConfig = glassPresets[preset];
        return {
          intensity: intensity ?? presetConfig.intensity,
          tint: tint ?? presetConfig.tint,
          fallbackColor: fallbackColor ?? presetConfig.fallbackColor,
        };
      }
      return {
        intensity: intensity ?? 80,
        tint: tint ?? ('light' as GlassTint),
        fallbackColor: fallbackColor ?? colors.surface,
      };
    }, [preset, intensity, tint, fallbackColor]);

    // Clamp intensity to valid range
    const clampedIntensity = useMemo(
      () => clampIntensity(config.intensity),
      [config.intensity]
    );

    // Determine if we should render blur or fallback
    const shouldRenderBlur = useMemo(() => {
      return enabled && Platform.OS === 'ios';
    }, [enabled]);

    // iOS: Render BlurView with glass effect
    if (shouldRenderBlur) {
      return (
        <BlurView
          intensity={clampedIntensity}
          tint={config.tint}
          style={[styles.container, style]}
          testID={testID}
          // Accessibility: Provide fallback for Reduce Transparency mode
          // @ts-ignore - reducedTransparencyFallbackColor not in type def
          reducedTransparencyFallbackColor={config.fallbackColor}
        >
          {children}
        </BlurView>
      );
    }

    // Android / Disabled: Render opaque View with fallback color
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: config.fallbackColor },
          style,
        ]}
        testID={testID}
        accessibilityRole="none"
      >
        {children}
      </View>
    );
  },
  // Custom comparison function for performance optimization
  (prevProps, nextProps) => {
    return (
      prevProps.intensity === nextProps.intensity &&
      prevProps.tint === nextProps.tint &&
      prevProps.fallbackColor === nextProps.fallbackColor &&
      prevProps.enabled === nextProps.enabled &&
      prevProps.preset === nextProps.preset &&
      prevProps.testID === nextProps.testID &&
      prevProps.style === nextProps.style &&
      prevProps.children === nextProps.children
    );
  }
);

GlassEffect.displayName = 'GlassEffect';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
