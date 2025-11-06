/**
 * Card Component
 * T047: Accessible card container with consistent styling
 *
 * WCAG 2.1 AA Compliant:
 * - Sufficient contrast for backgrounds
 * - Touch target size for interactive cards
 * - Clear visual hierarchy
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { colors, spacing } from '@constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  onPress,
  style,
  elevation = 2,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const cardStyle = [styles.card, { elevation }, style];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
