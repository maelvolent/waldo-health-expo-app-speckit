/**
 * GlassModal Component
 * Modal with layered glass effects
 *
 * @module components/common/GlassModal
 * @since 003-liquid-glass
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { GlassEffect } from './GlassEffect';
import { colors, typography, spacing } from '@constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface GlassModalProps {
  /** Whether modal is visible */
  visible: boolean;

  /** Called when modal should close */
  onClose: () => void;

  /** Modal content */
  children: React.ReactNode;

  /** Optional title */
  title?: string;

  /** Backdrop blur intensity (default: 50) */
  backdropIntensity?: number;

  /** Content glass preset (default: 'card') */
  contentPreset?: 'modal' | 'card';

  /** Animation type */
  animationType?: 'slide' | 'fade' | 'none';

  /** Additional content container styles */
  contentStyle?: ViewStyle;

  /** Test identifier */
  testID?: string;
}

/**
 * Glass Modal Component
 *
 * Layered glass effects:
 * - Dark glass backdrop for focus
 * - Light glass content for readability
 *
 * @example
 * ```tsx
 * <GlassModal
 *   visible={showFilter}
 *   onClose={() => setShowFilter(false)}
 *   title="Filter Exposures"
 * >
 *   <FilterOptions />
 * </GlassModal>
 * ```
 */
export const GlassModal = React.memo<GlassModalProps>(
  ({
    visible,
    onClose,
    children,
    title,
    backdropIntensity = 50,
    contentPreset = 'card',
    animationType = 'fade',
    contentStyle,
    testID,
  }) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType={animationType}
        onRequestClose={onClose}
        testID={testID}
        accessibilityViewIsModal
      >
        {/* Dark glass backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <GlassEffect
              intensity={backdropIntensity}
              tint="dark"
              fallbackColor="rgba(0, 0, 0, 0.6)"
              style={StyleSheet.absoluteFill}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Modal content container */}
        <View style={styles.container} pointerEvents="box-none">
          <TouchableWithoutFeedback>
            <View style={[styles.content, contentStyle]}>
              <GlassEffect
                preset={contentPreset}
                style={styles.contentGlass}
              >
                {/* Header with close button */}
                {title && (
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeButton}
                      accessibilityRole="button"
                      accessibilityLabel="Close modal"
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      testID={testID ? `${testID}-close` : undefined}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Modal content */}
                <View style={styles.body}>{children}</View>
              </GlassEffect>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    );
  }
);

GlassModal.displayName = 'GlassModal';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    maxHeight: '80%',
  },
  contentGlass: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  body: {
    padding: spacing.lg,
  },
});
