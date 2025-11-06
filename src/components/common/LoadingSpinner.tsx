/**
 * LoadingSpinner Component
 * T045: Accessible loading indicator using React Native Paper
 *
 * WCAG 2.1 AA Compliant:
 * - Visible spinner with sufficient contrast
 * - Optional accessible label for screen readers
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { colors, spacing } from '@constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessible={true}
      accessibilityLabel={message || 'Loading'}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator animating={true} size={size} color={color} />
      {message && (
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
      )}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
