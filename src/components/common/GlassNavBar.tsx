/**
 * GlassNavBar Component
 * Navigation bar with translucent glass effect
 *
 * @module components/common/GlassNavBar
 * @since 003-liquid-glass
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassEffect } from './GlassEffect';
import { colors, typography, spacing } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface GlassNavBarProps {
  /** Navigation bar title */
  title?: string;

  /** Left action (e.g., back button) */
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };

  /** Right action (e.g., settings, edit) */
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };

  /** Test identifier */
  testID?: string;
}

/**
 * Glass Navigation Bar Component
 *
 * Features:
 * - Translucent glass with navigation preset (85% blur)
 * - Safe area support for notched devices
 * - Optional left/right action buttons
 * - Content blurs beneath when scrolling
 *
 * @example
 * ```tsx
 * <GlassNavBar
 *   title="Exposure Details"
 *   leftAction={{
 *     icon: 'arrow-back',
 *     onPress: () => router.back(),
 *     accessibilityLabel: 'Go back'
 *   }}
 * />
 * ```
 */
export const GlassNavBar = React.memo<GlassNavBarProps>(
  ({ title, leftAction, rightAction, testID }) => {
    const insets = useSafeAreaInsets();

    // Calculate total height including safe area
    const navBarHeight = 56;
    const totalHeight = navBarHeight + insets.top;

    return (
      <GlassEffect
        preset="navigation"
        style={[styles.container, { height: totalHeight }]}
        testID={testID}
      >
        {/* Status bar spacer */}
        <View style={{ height: insets.top }} />

        {/* Navigation bar content */}
        <View style={[styles.navbar, { height: navBarHeight }]}>
          {/* Left action */}
          <View style={styles.leftAction}>
            {leftAction && (
              <TouchableOpacity
                onPress={leftAction.onPress}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={leftAction.accessibilityLabel}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                testID={testID ? `${testID}-left-action` : undefined}
              >
                <Ionicons
                  name={leftAction.icon}
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          {title && (
            <View style={styles.titleContainer}>
              <Text
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode="tail"
                accessibilityRole="header"
              >
                {title}
              </Text>
            </View>
          )}

          {/* Right action */}
          <View style={styles.rightAction}>
            {rightAction && (
              <TouchableOpacity
                onPress={rightAction.onPress}
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={rightAction.accessibilityLabel}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                testID={testID ? `${testID}-right-action` : undefined}
              >
                <Ionicons
                  name={rightAction.icon}
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </GlassEffect>
    );
  }
);

GlassNavBar.displayName = 'GlassNavBar';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  leftAction: {
    width: 44,
    justifyContent: 'center',
  },
  rightAction: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
});
