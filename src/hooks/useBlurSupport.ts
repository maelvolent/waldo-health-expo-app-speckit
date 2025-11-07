/**
 * useBlurSupport Hook
 * Detects device blur capability and accessibility settings
 *
 * @module hooks/useBlurSupport
 * @since 003-liquid-glass
 */

import { useState, useEffect } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';

/**
 * Blur capability information
 */
export interface BlurCapability {
  /** True if iOS 26+ with native Liquid Glass support */
  liquidGlass: boolean;
  /** True if iOS 13+ with standard blur support */
  standardBlur: boolean;
  /** True if Android or no blur support */
  fallbackOnly: boolean;
  /** Current platform */
  platform: 'ios' | 'android';
  /** iOS accessibility setting status */
  reduceTransparencyEnabled: boolean;
}

/**
 * Hook to detect blur capability and accessibility settings
 *
 * Checks:
 * - Platform (iOS vs Android)
 * - iOS version (for Liquid Glass vs standard blur)
 * - iOS "Reduce Transparency" accessibility setting
 *
 * Automatically updates when accessibility settings change.
 *
 * @returns BlurCapability object with platform and setting information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const capability = useBlurSupport();
 *
 *   if (capability.reduceTransparencyEnabled) {
 *     return <OpaqueView />;
 *   }
 *
 *   if (capability.standardBlur) {
 *     return <BlurView />;
 *   }
 *
 *   return <FallbackView />;
 * }
 * ```
 */
export function useBlurSupport(): BlurCapability {
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] =
    useState(false);

  useEffect(() => {
    // Only check on iOS
    if (Platform.OS !== 'ios') {
      return;
    }

    // Check initial state
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then(setReduceTransparencyEnabled)
      .catch(() => {
        // If check fails, assume transparency is enabled
        setReduceTransparencyEnabled(false);
      });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparencyEnabled
    );

    // Cleanup listener
    return () => {
      subscription?.remove();
    };
  }, []);

  // Determine blur capabilities based on platform and version
  const capability: BlurCapability = {
    liquidGlass: false, // iOS 26+ - not yet available
    standardBlur: Platform.OS === 'ios', // iOS 13+
    fallbackOnly: Platform.OS === 'android',
    platform: Platform.OS as 'ios' | 'android',
    reduceTransparencyEnabled,
  };

  return capability;
}
