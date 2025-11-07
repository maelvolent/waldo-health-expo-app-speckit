/**
 * SkeletonText Component
 * T030: Text placeholder with shimmer animation for loading states
 *
 * Features:
 * - Shimmer animation using Animated API
 * - Customizable width and height
 * - Multiple size presets (small, medium, large)
 * - Accessibility support
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing } from '@constants/theme';

export interface SkeletonTextProps {
  /**
   * Width of the skeleton (number or percentage string)
   * @default '100%'
   */
  width?: number | string;

  /**
   * Height preset or custom height
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | number;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Animation duration in milliseconds
   * @default 1500
   */
  animationDuration?: number;

  /**
   * Number of lines to display
   * @default 1
   */
  lines?: number;

  /**
   * Spacing between lines
   * @default spacing.sm
   */
  lineSpacing?: number;
}

const SIZE_PRESETS = {
  small: 12,
  medium: 16,
  large: 24,
};

export function SkeletonText({
  width = '100%',
  size = 'medium',
  style,
  animationDuration = 1500,
  lines = 1,
  lineSpacing = spacing.sm,
}: SkeletonTextProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create looping shimmer animation
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim, animationDuration]);

  // Interpolate opacity for shimmer effect
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const height = typeof size === 'number' ? size : SIZE_PRESETS[size];

  const renderLine = (index: number) => {
    // Make last line slightly shorter for more natural appearance
    const lineWidth = index === lines - 1 && lines > 1
      ? typeof width === 'string'
        ? '80%'
        : width * 0.8
      : width;

    return (
      <Animated.View
        key={`line-${index}`}
        style={[
          styles.skeleton,
          {
            width: lineWidth,
            height,
            opacity: shimmerOpacity,
            marginBottom: index < lines - 1 ? lineSpacing : 0,
          },
          style,
        ]}
        accessible={true}
        accessibilityLabel="Loading text"
        accessibilityRole="none"
        accessibilityState={{ busy: true }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, index) => renderLine(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: 4,
  },
});
