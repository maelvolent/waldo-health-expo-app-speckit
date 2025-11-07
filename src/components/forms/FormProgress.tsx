/**
 * FormProgress Component
 * T039: Multi-step progress indicator for forms
 *
 * Features:
 * - Visual step indicator with numbered circles
 * - Current step highlighting
 * - Completed step checkmarks
 * - Step labels
 * - Responsive layout
 * - Accessibility support
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@constants/theme';

export interface FormStep {
  /**
   * Unique step identifier
   */
  id: string;

  /**
   * Display label for the step
   */
  label: string;

  /**
   * Optional description
   */
  description?: string;
}

export interface FormProgressProps {
  /**
   * Array of form steps
   */
  steps: FormStep[];

  /**
   * Current step index (0-based)
   */
  currentStep: number;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Compact mode (smaller size)
   * @default false
   */
  compact?: boolean;
}

export function FormProgress({
  steps,
  currentStep,
  style,
  compact = false,
}: FormProgressProps) {
  const renderStep = (step: FormStep, index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isUpcoming = index > currentStep;

    const stepCircleStyle = [
      styles.stepCircle,
      compact && styles.stepCircleCompact,
      isCompleted && styles.stepCircleCompleted,
      isCurrent && styles.stepCircleCurrent,
      isUpcoming && styles.stepCircleUpcoming,
    ];

    return (
      <View
        key={step.id}
        style={styles.stepContainer}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`Step ${index + 1} of ${steps.length}: ${step.label}. ${
          isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'
        }`}
        accessibilityState={{
          selected: isCurrent,
          disabled: isUpcoming,
        }}
      >
        {/* Step Circle */}
        <View style={stepCircleStyle}>
          {isCompleted ? (
            <Ionicons
              name="checkmark"
              size={compact ? 14 : 18}
              color={colors.onPrimary}
              accessibilityLabel="Completed"
            />
          ) : (
            <Text
              style={[
                styles.stepNumber,
                compact && styles.stepNumberCompact,
                isCurrent && styles.stepNumberCurrent,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>

        {/* Step Label */}
        {!compact && (
          <View style={styles.stepLabelContainer}>
            <Text
              style={[
                styles.stepLabel,
                isCurrent && styles.stepLabelCurrent,
                isUpcoming && styles.stepLabelUpcoming,
              ]}
            >
              {step.label}
            </Text>
            {step.description && isCurrent && (
              <Text style={styles.stepDescription}>{step.description}</Text>
            )}
          </View>
        )}

        {/* Connector Line */}
        {index < steps.length - 1 && (
          <View
            style={[
              styles.connector,
              compact && styles.connectorCompact,
              isCompleted && styles.connectorCompleted,
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, compact && styles.containerCompact, style]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={`Progress: Step ${currentStep + 1} of ${steps.length}`}
      accessibilityValue={{
        min: 0,
        max: steps.length,
        now: currentStep + 1,
      }}
    >
      {steps.map((step, index) => renderStep(step, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  containerCompact: {
    paddingVertical: spacing.md,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 2,
  },
  stepCircleCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleUpcoming: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepNumberCompact: {
    fontSize: 14,
  },
  stepNumberCurrent: {
    color: colors.onPrimary,
  },
  stepLabelContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  stepLabelUpcoming: {
    color: colors.textSecondary,
  },
  stepDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  connector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  connectorCompact: {
    top: 14,
  },
  connectorCompleted: {
    backgroundColor: colors.primary,
  },
});
