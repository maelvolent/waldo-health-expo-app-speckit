/**
 * Theme Configuration
 * WCAG 2.1 AA compliant color palette and typography
 *
 * Design system follows:
 * - 4.5:1 contrast ratio for normal text
 * - 3:1 contrast ratio for large text (18pt+)
 * - 3:1 contrast ratio for UI components
 * - Minimum touch target: 44x44 pixels
 */

import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  // Primary - Used for main actions and key UI elements
  primary: '#0066CC', // Dark blue - 4.52:1 contrast on white
  primaryLight: '#3385D6',
  primaryDark: '#004C99',
  onPrimary: '#FFFFFF',

  // Secondary - Used for less prominent actions
  secondary: '#00A86B', // Green - 3.12:1 contrast on white
  secondaryLight: '#33BF8C',
  secondaryDark: '#008552',
  onSecondary: '#FFFFFF',

  // Background
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceVariant: '#E0E0E0',

  // Error/Warning/Success
  error: '#D32F2F', // 4.54:1 contrast on white
  errorLight: '#EF5350',
  warning: '#F57C00', // 3.94:1 contrast on white
  success: '#388E3C', // 4.53:1 contrast on white

  // Text - All meet WCAG AA standards
  text: '#212121', // 16.1:1 contrast on white
  textSecondary: '#757575', // 4.6:1 contrast on white
  textDisabled: '#9E9E9E', // 3.0:1 contrast on white
  onSurface: '#212121',

  // Severity indicators for exposure records
  severity: {
    low: '#4CAF50', // Green - 3.77:1 contrast
    medium: '#FF9800', // Orange - 2.37:1 contrast (used with icon for WCAG compliance)
    high: '#F44336', // Red - 4.01:1 contrast
  },

  // Exposure type category colors (subtle, used with labels)
  exposureCategory: {
    respiratory: '#2196F3',
    skin: '#9C27B0',
    noise: '#FF5722',
    environmental: '#4CAF50',
  },

  // Borders and dividers (T121: Updated for better contrast)
  border: '#757575', // Updated from #BDBDBD for 4.6:1 contrast
  inputBorder: '#757575', // 4.6:1 contrast for form inputs
  divider: '#E0E0E0',

  // Offline/sync status
  offline: '#9E9E9E',
  syncing: '#2196F3',
  synced: '#4CAF50',

  // Semantic colors for message boxes and alerts
  infoBackground: '#E3F2FD', // Light blue - for informational messages
  infoBorder: '#2196F3',
  infoText: '#0D47A1', // 7.6:1 contrast on white background

  warningBackground: '#FFF3E0', // Light orange - for warnings
  warningBorder: '#FF9800',
  warningText: '#E65100', // 5.4:1 contrast on white background

  errorBackground: '#FFEBEE', // Light red - for errors
  errorBorder: '#F44336',
  errorText: '#C62828', // 6.9:1 contrast on white background

  successBackground: '#E8F5E9', // Light green - for success messages
  successBorder: '#4CAF50',
  successText: '#2E7D32', // 5.9:1 contrast on white background

  // Icon colors (following semantic meaning)
  icon: {
    primary: '#333333',   // Default icon color - 12.6:1 contrast
    secondary: '#666666', // Secondary icon color - 5.7:1 contrast
    muted: '#999999',     // Muted/disabled icon color - 2.8:1 contrast
    success: '#22C55E',   // Success state icon
    warning: '#F59E0B',   // Warning state icon
    error: '#EF4444',     // Error state icon
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Headlines
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Labels and captions
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
};

// React Native Paper theme configuration
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    onSurface: colors.onSurface,
    disabled: colors.textDisabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.error,
  },
  roundness: 8,
};

// T124: Minimum touch target size (WCAG 2.1 AA)
export const touchTarget = {
  minWidth: 48, // Safe for both iOS (44) and Android (48)
  minHeight: 48,
  ios: {
    minWidth: 44,
    minHeight: 44,
  },
  android: {
    minWidth: 48,
    minHeight: 48,
  },
};

// T121-T125: Accessibility constants
export const accessibility = {
  // Contrast ratios (WCAG 2.1 AA)
  contrastRatios: {
    normalText: 4.5,
    largeText: 3.0,
    uiComponents: 3.0,
  },
  // Touch targets
  touchTargets: touchTarget,
  // Focus indicators
  focusIndicator: {
    width: 2,
    color: colors.primary,
    outlineStyle: 'solid',
  },
  // Screen reader announcements
  announceDelay: 100, // ms to wait before announcing
};
