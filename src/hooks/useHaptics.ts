/**
 * useHaptics Hook
 * Provides consistent haptic feedback across the app
 *
 * Usage:
 *   const haptics = useHaptics();
 *   <TouchableOpacity onPress={() => {
 *     haptics.light();
 *     handlePress();
 *   }}>
 *
 * Haptic Types:
 * - light: Subtle tap (filter chips, navigation)
 * - medium: Standard button press
 * - heavy: Significant action (delete, submit)
 * - selection: Scrolling through items (picker)
 * - success: Task completed successfully
 * - warning: User should pay attention
 * - error: Action failed or prevented
 */

import * as Haptics from 'expo-haptics';

export function useHaptics() {
  /**
   * Light impact - for subtle interactions
   * Use for: filter chips, tab navigation, minor UI changes
   */
  const light = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics may not be supported on all devices (simulator, web)
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Medium impact - for standard interactions
   * Use for: button taps, card selections, form submissions
   */
  const medium = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Heavy impact - for significant interactions
   * Use for: destructive actions, important confirmations
   */
  const heavy = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Selection changed - for continuous feedback
   * Use for: scrolling through picker items, adjusting values
   */
  const selection = () => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Success notification - for successful operations
   * Use for: form submitted, exposure saved, sync completed
   */
  const success = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Warning notification - for attention-worthy events
   * Use for: validation warnings, low battery, sync issues
   */
  const warning = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  /**
   * Error notification - for failed operations
   * Use for: validation errors, failed saves, network errors
   */
  const error = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  return {
    light,
    medium,
    heavy,
    selection,
    success,
    warning,
    error,
  };
}
