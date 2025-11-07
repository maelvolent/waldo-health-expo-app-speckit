/**
 * Contract: GlassEffect Component
 *
 * Core wrapper component for applying glass blur effects with platform-aware fallbacks
 * and accessibility support.
 *
 * @module contracts/GlassEffect
 * @since 003-liquid-glass
 */

import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

/**
 * Glass tint color schemes
 */
export type GlassTint = 'light' | 'dark' | 'default';

/**
 * Available glass effect presets
 */
export type GlassPresetName = 'navigation' | 'card' | 'modal' | 'button' | 'input';

/**
 * Props for the GlassEffect component
 */
export interface GlassEffectProps {
  /**
   * Content to render within the glass surface
   */
  children: ReactNode;

  /**
   * Blur intensity (0-100)
   * @default 80
   * @minimum 0
   * @maximum 100
   */
  intensity?: number;

  /**
   * Blur tint color scheme
   * @default 'light'
   */
  tint?: GlassTint;

  /**
   * Solid color fallback for Reduce Transparency mode
   * @default colors.surface
   */
  fallbackColor?: string;

  /**
   * Additional React Native styles
   */
  style?: ViewStyle;

  /**
   * Whether to render blur effect (useful for testing/debugging)
   * @default true
   */
  enabled?: boolean;

  /**
   * Use predefined glass preset
   * If provided, overrides intensity, tint, and fallbackColor
   */
  preset?: GlassPresetName;

  /**
   * Test identifier for automation
   */
  testID?: string;
}

/**
 * BEHAVIOR CONTRACT
 *
 * The GlassEffect component MUST:
 *
 * 1. **Platform Behavior**:
 *    - iOS 13+: Render BlurView with specified intensity and tint
 *    - iOS 26+: Optionally use GlassView if available
 *    - Android: Render opaque View with fallbackColor
 *
 * 2. **Accessibility**:
 *    - Always provide reducedTransparencyFallbackColor prop to BlurView
 *    - Respect iOS "Reduce Transparency" system setting
 *    - Maintain minimum 4.5:1 contrast ratio between fallbackColor and text
 *    - Work correctly with VoiceOver (announced as "container")
 *
 * 3. **Preset Handling**:
 *    - If preset prop provided, use preset configuration
 *    - Manual props (intensity, tint, fallbackColor) override preset values
 *    - Throw error if preset name is invalid
 *
 * 4. **Validation**:
 *    - Clamp intensity to 0-100 range
 *    - Validate fallbackColor is valid CSS color (hex, rgba, named)
 *    - Require children prop (cannot be empty)
 *
 * 5. **Performance**:
 *    - Memoize component to prevent unnecessary re-renders
 *    - Use shouldRasterizeIOS for static (non-animated) blurs
 *    - Limit to 5 GlassEffect instances per screen
 *
 * 6. **Testing**:
 *    - Support enabled={false} for rendering without blur in tests
 *    - Expose testID prop for automated testing
 *    - Render as standard View when blur unavailable
 */

/**
 * USAGE EXAMPLES
 *
 * Basic usage with preset:
 * ```tsx
 * <GlassEffect preset="card">
 *   <Text>Card content</Text>
 * </GlassEffect>
 * ```
 *
 * Custom configuration:
 * ```tsx
 * <GlassEffect
 *   intensity={90}
 *   tint="dark"
 *   fallbackColor={colors.surfaceDark}
 *   style={{ padding: 16, borderRadius: 12 }}
 * >
 *   <Text style={{ color: '#FFFFFF' }}>Custom glass surface</Text>
 * </GlassEffect>
 * ```
 *
 * Disabled for testing:
 * ```tsx
 * <GlassEffect enabled={false} testID="glass-card">
 *   <Text>Opaque surface for snapshot tests</Text>
 * </GlassEffect>
 * ```
 */

/**
 * TEST REQUIREMENTS
 *
 * Unit Tests:
 * - Renders children correctly
 * - Applies preset configuration when preset prop provided
 * - Overrides preset with manual props
 * - Clamps intensity to 0-100 range
 * - Renders fallback on Android
 * - Includes reducedTransparencyFallbackColor on iOS
 * - Throws error for invalid preset name
 * - Respects enabled={false} flag
 *
 * Accessibility Tests:
 * - Validates contrast ratio of fallbackColor + text color >= 4.5:1
 * - Works with VoiceOver enabled
 * - Respects Reduce Transparency setting
 * - Supports Increase Contrast mode
 *
 * Integration Tests:
 * - Integrates with theme system (colors from theme.ts)
 * - Performance: maintains 60fps with 5 instances
 * - Memory: no leaks after repeated mount/unmount
 *
 * Visual Regression Tests:
 * - Screenshot with blur enabled matches baseline
 * - Screenshot with Reduce Transparency matches fallback color
 * - Screenshot on Android matches opaque design
 */

/**
 * ACCESSIBILITY REQUIREMENTS
 *
 * WCAG 2.1 AA Compliance:
 * - Contrast ratio >= 4.5:1 for text on glass surfaces
 * - Provide opaque fallback for Reduce Transparency mode
 * - Text remains readable in High Contrast mode
 * - No interference with screen reader navigation
 *
 * iOS Accessibility Settings Supported:
 * - Reduce Transparency
 * - Increase Contrast
 * - Dynamic Type (text scaling)
 * - VoiceOver
 *
 * Testing Checklist:
 * - Enable VoiceOver: Verify all text is announced
 * - Enable Reduce Transparency: Verify fallbackColor appears
 * - Enable Increase Contrast: Verify text remains readable
 * - Test with Dynamic Type at largest size: Verify no text overflow
 */

/**
 * PERFORMANCE CONSTRAINTS
 *
 * - Maximum 5 GlassEffect instances per screen
 * - Render time: < 16ms per instance (maintain 60fps)
 * - Memory: < 5MB per instance
 * - No blur stacking (nested GlassEffect components)
 * - Use static rasterization for non-animated blurs
 * - Profile on iPhone 12 as minimum baseline device
 */
