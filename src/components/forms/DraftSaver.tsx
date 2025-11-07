/**
 * DraftSaver Component
 * T041: Auto-save indicator with status display
 *
 * Features:
 * - Saving/saved status indicator
 * - Last saved timestamp
 * - Visual feedback (spinner, checkmark)
 * - Compact mode for inline display
 * - Accessibility support
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@constants/theme';
import { formatDistanceToNow } from 'date-fns';

export interface DraftSaverProps {
  /**
   * Last saved timestamp (milliseconds)
   */
  lastSaved: number | null;

  /**
   * Whether currently saving
   */
  isSaving: boolean;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Compact mode (smaller text and spacing)
   * @default false
   */
  compact?: boolean;

  /**
   * Show relative time (e.g., "2 minutes ago")
   * @default true
   */
  showRelativeTime?: boolean;
}

export function DraftSaver({
  lastSaved,
  isSaving,
  style,
  compact = false,
  showRelativeTime = true,
}: DraftSaverProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Update relative time every 30 seconds
  useEffect(() => {
    if (!lastSaved || !showRelativeTime) {
      setRelativeTime('');
      return;
    }

    const updateTime = () => {
      try {
        setRelativeTime(formatDistanceToNow(lastSaved, { addSuffix: true }));
      } catch (error) {
        console.error('Error formatting time:', error);
        setRelativeTime('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [lastSaved, showRelativeTime]);

  // Don't show anything if never saved and not currently saving
  if (!lastSaved && !isSaving) {
    return null;
  }

  return (
    <View
      style={[styles.container, compact && styles.containerCompact, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={
        isSaving
          ? 'Saving draft'
          : lastSaved
            ? `Draft saved ${relativeTime}`
            : 'Draft auto-save enabled'
      }
      accessibilityLiveRegion="polite"
    >
      {isSaving ? (
        <>
          <ActivityIndicator
            size="small"
            color={colors.textSecondary}
            style={styles.spinner}
          />
          <Text style={[styles.text, compact && styles.textCompact]}>
            Saving...
          </Text>
        </>
      ) : lastSaved ? (
        <>
          <Ionicons
            name="checkmark-circle"
            size={compact ? 14 : 16}
            color={colors.success}
            style={styles.icon}
            accessibilityLabel="Saved"
          />
          <Text style={[styles.text, styles.textSuccess, compact && styles.textCompact]}>
            Saved {showRelativeTime && relativeTime && `${relativeTime}`}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  containerCompact: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: 0,
  },
  spinner: {
    marginRight: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  textCompact: {
    fontSize: 12,
  },
  textSuccess: {
    color: colors.success,
  },
});
