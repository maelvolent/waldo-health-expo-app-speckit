/**
 * GlassButton Component
 * Button with glass styling for primary/secondary actions
 *
 * @module components/common/GlassButton
 * @since 003-liquid-glass
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { GlassEffect } from './GlassEffect';
import { useHaptics } from '@hooks/useHaptics';
import { colors, typography } from '@constants/theme';

export type GlassButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface GlassButtonProps {
  /** Button text */
  children: string;

  /** Called when button is pressed */
  onPress: () => void;

  /** Button variant */
  variant?: GlassButtonVariant;

  /** Whether button is disabled */
  disabled?: boolean;

  /** Whether button is in loading state */
  loading?: boolean;

  /** Additional button styles */
  style?: ViewStyle;

  /** Additional text styles */
  textStyle?: TextStyle;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Accessibility hint */
  accessibilityHint?: string;

  /** Test identifier */
  testID?: string;
}

/**
 * Glass Button Component
 *
 * Three variants:
 * - primary: Intense glass with vibrant tinting
 * - secondary: Subtle glass effect
 * - destructive: Red-tinted glass for destructive actions
 *
 * @example
 * ```tsx
 * <GlassButton
 *   variant="primary"
 *   onPress={handleSave}
 * >
 *   Save Exposure
 * </GlassButton>
 * ```
 */
export const GlassButton = React.memo<GlassButtonProps>(
  ({
    children,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
    accessibilityLabel,
    accessibilityHint,
    testID,
  }) => {
    const { medium } = useHaptics();

    const handlePress = () => {
      if (!disabled && !loading) {
        medium();
        onPress();
      }
    };

    // Configure glass effect based on variant
    const glassConfig = {
      primary: {
        intensity: 85,
        tint: 'light' as const,
        fallbackColor: colors.primary + '30', // 18% opacity
        textColor: colors.primary,
      },
      secondary: {
        intensity: 70,
        tint: 'light' as const,
        fallbackColor: colors.surface,
        textColor: colors.text,
      },
      destructive: {
        intensity: 85,
        tint: 'light' as const,
        fallbackColor: colors.error + '30', // 18% opacity
        textColor: colors.error,
      },
    }[variant];

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || children}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        testID={testID}
        style={[styles.touchable, style]}
      >
        <GlassEffect
          intensity={glassConfig.intensity}
          tint={glassConfig.tint}
          fallbackColor={glassConfig.fallbackColor}
          style={[
            styles.button,
            disabled && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={glassConfig.textColor}
              testID={testID ? `${testID}-spinner` : undefined}
            />
          ) : (
            <Text
              style={[
                styles.text,
                { color: glassConfig.textColor },
                disabled && styles.textDisabled,
                textStyle,
              ]}
            >
              {children}
            </Text>
          )}
        </GlassEffect>
      </TouchableOpacity>
    );
  }
);

GlassButton.displayName = 'GlassButton';

const styles = StyleSheet.create({
  touchable: {
    minHeight: 48, // WCAG touch target
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.6,
  },
});
