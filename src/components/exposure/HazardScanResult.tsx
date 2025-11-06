/**
 * T098: HazardScanResult Component
 * Displays AI-detected hazards with confidence levels and suggested PPE
 * T101: Asbestos disclaimer with assessor directory link
 *
 * Shows:
 * - Detected hazards with confidence percentages
 * - Suggested exposure type
 * - Recommended PPE
 * - Accept/Reject buttons for user feedback
 * - Asbestos-specific warning and assessor directory
 */

import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, Chip, Button as PaperButton, ProgressBar } from 'react-native-paper';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { EXPOSURE_TYPES, PPE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { AI_CONFIG } from '@constants/config';

interface DetectedHazard {
  type: string;
  confidence: number;
  description: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface HazardScanResultProps {
  detectedHazards: DetectedHazard[];
  suggestedExposureType: string | null;
  suggestedPPE: string[];
  processingTime?: number;
  userAccepted?: boolean | null;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export function HazardScanResult({
  detectedHazards,
  suggestedExposureType,
  suggestedPPE,
  processingTime,
  userAccepted,
  onAccept,
  onReject,
  showActions = true,
}: HazardScanResultProps) {
  // Filter hazards by confidence threshold
  const visibleHazards = detectedHazards.filter(
    h => h.confidence >= AI_CONFIG.CONFIDENCE.MINIMUM
  );

  if (visibleHazards.length === 0) {
    return (
      <Card style={styles.noHazardsCard}>
        <View style={styles.noHazardsContainer}>
          <Text style={styles.noHazardsIcon}>✅</Text>
          <Text variant="titleMedium" style={styles.noHazardsTitle}>
            No Significant Hazards Detected
          </Text>
          <Text variant="bodyMedium" style={styles.noHazardsText}>
            The AI analysis did not identify any clear workplace hazards in this photo with
            sufficient confidence.
          </Text>
          {processingTime && (
            <Text variant="bodySmall" style={styles.processingTime}>
              Analyzed in {(processingTime / 1000).toFixed(1)}s
            </Text>
          )}
        </View>
      </Card>
    );
  }

  // Get exposure type info for display
  const exposureTypeInfo = suggestedExposureType
    ? EXPOSURE_TYPES[suggestedExposureType.toUpperCase()]
    : null;

  // Determine if this is a high-confidence detection
  const highestConfidence = Math.max(...visibleHazards.map(h => h.confidence));
  const isHighConfidence = highestConfidence >= AI_CONFIG.CONFIDENCE.HIGH;

  // T101: Check if asbestos is detected
  const asbestosDetected =
    suggestedExposureType?.toLowerCase().includes('asbestos') ||
    visibleHazards.some(h => h.type.toLowerCase().includes('asbestos'));

  /**
   * T101: Open New Zealand Asbestos Assessor Directory
   */
  function openAsbestosDirectory() {
    const url = 'https://www.worksafe.govt.nz/topic-and-industry/asbestos/asbestos-registers/';
    Linking.openURL(url).catch(err => {
      console.error('Failed to open asbestos directory:', err);
    });
  }

  return (
    <Card style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.icon}>🤖</Text>
        </View>
        <View style={styles.headerText}>
          <Text variant="titleMedium" style={styles.title}>
            AI Hazard Detection
          </Text>
          {processingTime && (
            <Text variant="bodySmall" style={styles.subtitle}>
              Analyzed in {(processingTime / 1000).toFixed(1)}s
            </Text>
          )}
        </View>
        {isHighConfidence && (
          <Chip mode="flat" style={styles.highConfidenceBadge} textStyle={styles.badgeText}>
            High Confidence
          </Chip>
        )}
      </View>

      {/* T101: Asbestos Disclaimer */}
      {asbestosDetected && (
        <View style={styles.asbestosDisclaimer}>
          <View style={styles.asbestosHeader}>
            <Text style={styles.asbestosIcon}>⚠️</Text>
            <Text variant="titleSmall" style={styles.asbestosTitle}>
              Professional Assessment Required
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.asbestosText}>
            Asbestos detection requires confirmation by a licensed asbestos assessor. Never disturb
            suspected asbestos materials without proper testing and professional guidance.
          </Text>
          <Text variant="bodySmall" style={[styles.asbestosText, { marginTop: spacing.sm }]}>
            In New Zealand, asbestos work must comply with WorkSafe regulations and be performed by
            licensed removalists.
          </Text>
          <TouchableOpacity style={styles.asbestosButton} onPress={openAsbestosDirectory}>
            <Text style={styles.asbestosButtonText}>
              📋 Find Licensed Asbestos Assessors (WorkSafe NZ)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Suggested Exposure Type */}
      {suggestedExposureType && exposureTypeInfo && (
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Suggested Exposure Type
          </Text>
          <View style={styles.exposureTypeContainer}>
            <Text style={styles.exposureIcon}>{exposureTypeInfo.icon}</Text>
            <Text variant="titleSmall" style={styles.exposureLabel}>
              {exposureTypeInfo.label}
            </Text>
          </View>
        </View>
      )}

      {/* Detected Hazards */}
      <View style={styles.section}>
        <Text variant="labelLarge" style={styles.sectionLabel}>
          Detected Hazards ({visibleHazards.length})
        </Text>
        {visibleHazards.map((hazard, index) => (
          <View key={index} style={styles.hazardItem}>
            <View style={styles.hazardHeader}>
              <Text variant="bodyMedium" style={styles.hazardDescription}>
                {hazard.description}
              </Text>
              <Chip
                mode="outlined"
                compact
                style={[
                  styles.confidenceChip,
                  {
                    borderColor: getConfidenceColor(hazard.confidence),
                  },
                ]}
                textStyle={{
                  color: getConfidenceColor(hazard.confidence),
                  fontSize: 11,
                }}
              >
                {(hazard.confidence * 100).toFixed(0)}% confident
              </Chip>
            </View>
            <ProgressBar
              progress={hazard.confidence}
              color={getConfidenceColor(hazard.confidence)}
              style={styles.confidenceBar}
            />
          </View>
        ))}
      </View>

      {/* Suggested PPE */}
      {suggestedPPE.length > 0 && (
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Recommended PPE
          </Text>
          <View style={styles.ppeContainer}>
            {suggestedPPE.map((ppeId, index) => {
              const ppe = PPE_TYPES[ppeId.toUpperCase()];
              return (
                <Chip
                  key={index}
                  mode="outlined"
                  style={styles.ppeChip}
                  icon="shield-check"
                  textStyle={styles.ppeChipText}
                >
                  {ppe?.label || ppeId}
                </Chip>
              );
            })}
          </View>
        </View>
      )}

      {/* User Acceptance Status */}
      {userAccepted !== null && (
        <View style={styles.acceptanceStatus}>
          <Text variant="bodySmall" style={styles.acceptanceText}>
            {userAccepted ? '✅ Accepted by user' : '❌ Rejected by user'}
          </Text>
        </View>
      )}

      {/* Actions */}
      {showActions && userAccepted === null && (onAccept || onReject) && (
        <View style={styles.actions}>
          <Text variant="bodySmall" style={styles.actionsHint}>
            Does this match what you observed?
          </Text>
          <View style={styles.actionButtons}>
            {onReject && (
              <Button
                title="Not Accurate"
                onPress={onReject}
                variant="outline"
                style={styles.rejectButton}
              />
            )}
            {onAccept && (
              <Button
                title="Accept Suggestion"
                onPress={onAccept}
                variant="primary"
                style={styles.acceptButton}
              />
            )}
          </View>
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text variant="bodySmall" style={styles.disclaimerText}>
          ⚠️ AI detection is a suggested starting point. Always verify hazards yourself and follow
          your site's safety procedures.
        </Text>
      </View>
    </Card>
  );
}

/**
 * Get color for confidence level
 */
function getConfidenceColor(confidence: number): string {
  if (confidence >= AI_CONFIG.CONFIDENCE.HIGH) {
    return colors.success;
  } else if (confidence >= AI_CONFIG.CONFIDENCE.MINIMUM + 0.15) {
    return colors.warning;
  } else {
    return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  noHazardsCard: {
    backgroundColor: colors.successContainer,
    borderColor: colors.success,
    borderWidth: 1,
  },
  noHazardsContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  noHazardsIcon: {
    fontSize: 48,
  },
  noHazardsTitle: {
    color: colors.text,
    textAlign: 'center',
  },
  noHazardsText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  processingTime: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  highConfidenceBadge: {
    backgroundColor: colors.successContainer,
    borderColor: colors.success,
  },
  badgeText: {
    fontSize: 11,
    color: colors.onSuccessContainer,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  exposureTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
  },
  exposureIcon: {
    fontSize: 24,
  },
  exposureLabel: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  hazardItem: {
    marginBottom: spacing.md,
  },
  hazardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  hazardDescription: {
    flex: 1,
    color: colors.text,
  },
  confidenceChip: {
    height: 24,
  },
  confidenceBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceVariant,
  },
  ppeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ppeChip: {
    borderColor: colors.success,
  },
  ppeChipText: {
    fontSize: 12,
  },
  acceptanceStatus: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  acceptanceText: {
    color: colors.text,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionsHint: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  disclaimer: {
    padding: spacing.sm,
    backgroundColor: colors.warningContainer,
    borderRadius: 8,
  },
  disclaimerText: {
    color: colors.text,
    lineHeight: 18,
  },
  // T101: Asbestos Disclaimer Styles
  asbestosDisclaimer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 2,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  asbestosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  asbestosIcon: {
    fontSize: 24,
  },
  asbestosTitle: {
    fontWeight: '700',
    color: '#856404',
    flex: 1,
  },
  asbestosText: {
    color: '#856404',
    lineHeight: 20,
  },
  asbestosButton: {
    marginTop: spacing.md,
    backgroundColor: '#856404',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  asbestosButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
