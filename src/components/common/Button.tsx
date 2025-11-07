/**
 * Button Component
 * T046: Accessible button with WCAG 2.1 AA compliance
 * T057: Haptic feedback on button taps
 *
 * Features:
 * - Minimum 44x44px touch target
 * - High contrast colors (4.5:1 ratio)
 * - Loading state
 * - Disabled state
 * - Multiple variants
 * - Haptic feedback
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { colors, touchTarget } from '@constants/theme';
import { useHaptics } from '@hooks/useHaptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  // T057: Haptic feedback
  const { light } = useHaptics();

  const handlePress = () => {
    if (!disabled && !loading) {
      light(); // Haptic feedback on tap
      onPress();
    }
  };

  const mode =
    variant === 'primary' || variant === 'secondary'
      ? 'contained'
      : variant === 'outline'
        ? 'outlined'
        : 'text';

  const buttonColor =
    variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : undefined;

  return (
    <PaperButton
      mode={mode}
      onPress={handlePress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      buttonColor={buttonColor}
      textColor={
        variant === 'primary' || variant === 'secondary'
          ? colors.onPrimary
          : variant === 'outline'
            ? colors.primary
            : colors.textSecondary
      }
      style={[styles.button, fullWidth && styles.fullWidth, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      accessible={true}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {title}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget.minHeight,
    justifyContent: 'center',
  },
  content: {
    minHeight: touchTarget.minHeight,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
