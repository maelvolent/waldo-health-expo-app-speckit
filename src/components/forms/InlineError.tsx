/**
 * InlineError Component
 * T040: Field-level validation error display
 *
 * Features:
 * - Error icon with message
 * - Animated entrance
 * - Semantic error colors
 * - Accessibility support
 * - Optional error ID for ARIA
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@constants/theme';

export interface InlineErrorProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Optional error ID for ARIA linking
   */
  errorId?: string;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Show error icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Animation enabled
   * @default true
   */
  animated?: boolean;
}

export function InlineError({
  message,
  errorId,
  style,
  showIcon = true,
  animated = true,
}: InlineErrorProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [message, animated, fadeAnim, slideAnim]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      nativeID={errorId}
    >
      {showIcon && (
        <Ionicons
          name="alert-circle"
          size={16}
          color={colors.error}
          style={styles.icon}
          accessibilityLabel="Error"
        />
      )}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.errorBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    borderRadius: 4,
  },
  icon: {
    marginRight: spacing.xs,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
});
