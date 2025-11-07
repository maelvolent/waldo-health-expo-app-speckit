/**
 * EmptyState Component
 * T031: Empty state display with icon, title, description, and CTA button
 *
 * Features:
 * - Icon from @expo/vector-icons
 * - Title and description text
 * - Optional CTA button
 * - Customizable styling
 * - Accessibility support
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, touchTarget } from '@constants/theme';

export interface EmptyStateProps {
  /**
   * Icon name from Ionicons
   * @default 'document-text-outline'
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Icon size
   * @default 64
   */
  iconSize?: number;

  /**
   * Icon color
   * @default colors.icon.muted
   */
  iconColor?: string;

  /**
   * Main title text
   */
  title: string;

  /**
   * Description text (optional)
   */
  description?: string;

  /**
   * CTA button label (optional)
   */
  ctaLabel?: string;

  /**
   * CTA button press handler
   */
  onCtaPress?: () => void;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Should display with reduced vertical padding
   * @default false
   */
  compact?: boolean;
}

export function EmptyState({
  icon = 'document-text-outline',
  iconSize = 64,
  iconColor = colors.icon.muted,
  title,
  description,
  ctaLabel,
  onCtaPress,
  style,
  compact = false,
}: EmptyStateProps) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description || ''}`}
    >
      {/* Icon */}
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor}
        style={styles.icon}
        accessibilityLabel={`${title} icon`}
      />

      {/* Title */}
      <Text
        variant="headlineSmall"
        style={styles.title}
      >
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          variant="bodyMedium"
          style={styles.description}
        >
          {description}
        </Text>
      )}

      {/* CTA Button */}
      {ctaLabel && onCtaPress && (
        <Pressable
          onPress={onCtaPress}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          accessibilityHint="Tap to perform action"
        >
          <Text style={styles.ctaButtonText}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerCompact: {
    paddingVertical: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
