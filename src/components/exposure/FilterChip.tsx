/**
 * FilterChip Component
 * T019: Filter chip sub-component for filter UI
 *
 * Features:
 * - Active/inactive states with visual feedback
 * - Optional icon display
 * - Badge count indicator
 * - Haptic feedback on interaction (T024)
 * - Accessibility support
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, touchTarget } from '@constants/theme';
import { useHaptics } from '@hooks/useHaptics';

export interface FilterChipProps {
  /**
   * Display label for the chip
   */
  label: string;

  /**
   * Icon to show in the chip
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Is this chip currently active
   */
  isActive: boolean;

  /**
   * Callback when chip is pressed
   */
  onPress: () => void;

  /**
   * Badge count to display (e.g., number of items with this filter)
   */
  badgeCount?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

export function FilterChip({
  label,
  icon,
  isActive,
  onPress,
  badgeCount,
  style,
}: FilterChipProps) {
  const { selection } = useHaptics();

  /**
   * Handle chip press with haptic feedback (T024)
   */
  const handlePress = () => {
    selection(); // Haptic feedback
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label} filter`}
      accessibilityHint={isActive ? 'Active, tap to remove filter' : 'Tap to apply filter'}
      accessibilityState={{ selected: isActive }}
    >
      {/* Icon */}
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? colors.onPrimary : colors.icon.primary}
          style={styles.icon}
          accessibilityLabel={`${label} icon`}
        />
      )}

      {/* Label */}
      <Text
        style={[
          styles.label,
          isActive && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Badge Count */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <View
          style={[
            styles.badge,
            isActive && styles.badgeActive,
          ]}
          accessibilityLabel={`${badgeCount} items`}
        >
          <Text
            style={[
              styles.badgeText,
              isActive && styles.badgeTextActive,
            ]}
          >
            {badgeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: touchTarget.minHeight,
    gap: spacing.xs,
  },
  containerActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  containerPressed: {
    opacity: 0.7,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  labelActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  badgeActive: {
    backgroundColor: colors.onPrimary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  badgeTextActive: {
    color: colors.primary,
  },
});
