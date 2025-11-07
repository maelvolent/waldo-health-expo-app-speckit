/**
 * SkeletonCard Component
 * T028: Skeleton placeholder with shimmer animation for loading states
 *
 * Features:
 * - Shimmer animation using Animated API
 * - Customizable dimensions
 * - Accessibility announcements for loading state
 * - Matches ExposureCard visual structure
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing } from '@constants/theme';

export interface SkeletonCardProps {
  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Animation duration in milliseconds
   * @default 1500
   */
  animationDuration?: number;
}

export function SkeletonCard({
  style,
  animationDuration = 1500,
}: SkeletonCardProps) {
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

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel="Loading exposure card"
      accessibilityRole="none"
      accessibilityState={{ busy: true }}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Icon Placeholder */}
        <Animated.View
          style={[
            styles.iconSkeleton,
            { opacity: shimmerOpacity },
          ]}
        />

        {/* Title and Date Section */}
        <View style={styles.headerText}>
          <Animated.View
            style={[
              styles.titleSkeleton,
              { opacity: shimmerOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.dateSkeleton,
              { opacity: shimmerOpacity },
            ]}
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.textLine,
            styles.textLineLong,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.textLine,
            styles.textLineMedium,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <Animated.View
          style={[
            styles.badgeSkeleton,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.badgeSkeleton,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  titleSkeleton: {
    height: 18,
    width: '70%',
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  dateSkeleton: {
    height: 14,
    width: '40%',
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  content: {
    marginBottom: spacing.md,
  },
  textLine: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  textLineLong: {
    width: '90%',
  },
  textLineMedium: {
    width: '60%',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badgeSkeleton: {
    height: 24,
    width: 60,
    backgroundColor: colors.border,
    borderRadius: 12,
  },
});
