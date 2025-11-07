/**
 * GlassCard Component
 * Card component with glass surface styling
 *
 * @module components/common/GlassCard
 * @since 003-liquid-glass
 */

import React from 'react';
import { TouchableOpacity, View, ViewStyle, StyleSheet } from 'react-native';
import { GlassEffect } from './GlassEffect';
import { useHaptics } from '@hooks/useHaptics';

export interface GlassCardProps {
  /** Content to render within the card */
  children: React.ReactNode;

  /** Called when card is tapped */
  onPress?: () => void;

  /** Called when card is long-pressed */
  onLongPress?: () => void;

  /** Glass preset to use (default: 'card') */
  preset?: 'card' | 'elevated';

  /** Additional styles for the card container */
  style?: ViewStyle;

  /** Additional styles for the content wrapper */
  contentStyle?: ViewStyle;

  /** Whether the card is disabled */
  disabled?: boolean;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Test identifier */
  testID?: string;
}

/**
 * Glass Card Component
 *
 * Wraps content in a glass effect surface with touch interactions.
 *
 * @example
 * ```tsx
 * <GlassCard
 *   onPress={() => navigate('/details')}
 *   accessibilityLabel="Exposure card"
 * >
 *   <Text>Card content</Text>
 * </GlassCard>
 * ```
 */
export const GlassCard = React.memo<GlassCardProps>(
  ({
    children,
    onPress,
    onLongPress,
    preset = 'card',
    style,
    contentStyle,
    disabled = false,
    accessibilityLabel,
    accessibilityHint,
    testID,
  }) => {
    const { light } = useHaptics();

    const handlePress = () => {
      if (!disabled && onPress) {
        light();
        onPress();
      }
    };

    const handleLongPress = () => {
      if (!disabled && onLongPress) {
        light();
        onLongPress();
      }
    };

    const cardContent = (
      <GlassEffect preset={preset} style={[styles.card, style]} testID={testID}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </GlassEffect>
    );

    // If interactive, wrap in TouchableOpacity
    if (onPress || onLongPress) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          testID={testID ? `${testID}-touchable` : undefined}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    // Non-interactive card
    return cardContent;
  }
);

GlassCard.displayName = 'GlassCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});
