/**
 * SkeletonList Component
 * T029: Renders multiple skeleton cards for list loading states
 *
 * Features:
 * - Customizable number of skeleton cards
 * - Uses SkeletonCard component
 * - Accessibility support for loading state
 * - Staggered animation for visual polish
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SkeletonCard } from './SkeletonCard';
import { spacing } from '@constants/theme';

export interface SkeletonListProps {
  /**
   * Number of skeleton cards to display
   * @default 5
   */
  count?: number;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Stagger animation start time for each card (ms)
   * @default 100
   */
  staggerDelay?: number;
}

export function SkeletonList({
  count = 5,
  style,
  staggerDelay = 100,
}: SkeletonListProps) {
  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={`Loading ${count} exposure cards`}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={`skeleton-${index}`}
          animationDuration={1500 + index * staggerDelay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
