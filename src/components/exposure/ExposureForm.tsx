/**
 * ExposureForm Component
 * T050: Complete form for exposure documentation
 * T092: Added contextual education links
 *
 * Fields:
 * - Exposure type (selector)
 * - Duration (hours/minutes)
 * - Severity (low/medium/high)
 * - PPE worn
 * - Work activity
 * - Notes
 * - Chemical name (if applicable)
 * - SDS reference
 * - Control measures
 * - Educational content link (contextual)
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, SegmentedButtons, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ExposureDraft } from '../../types/exposure';
import { PPE_TYPES, EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';

interface ExposureFormProps {
  exposureType: string | null;
  formData: Partial<ExposureDraft>;
  onChange: (field: keyof ExposureDraft, value: any) => void;
}

export function ExposureForm({ exposureType, formData, onChange }: ExposureFormProps) {
  const router = useRouter();
  const ppeOptions = Object.values(PPE_TYPES);

  // Query educational content for the selected exposure type
  const educationalContent = useQuery(
    api.educationalContent.list,
    exposureType ? { exposureType, limit: 1 } : 'skip'
  );

  /**
   * Toggle PPE selection
   */
  function togglePPE(ppeId: string) {
    const currentPPE = formData.ppe || [];
    const newPPE = currentPPE.includes(ppeId)
      ? currentPPE.filter(id => id !== ppeId)
      : [...currentPPE, ppeId];
    onChange('ppe', newPPE);
  }

  /**
   * Check if chemical name is required
   */
  const requiresChemicalName = ['hazardous_chemicals', 'contaminated_soils'].includes(
    exposureType || ''
  );

  // Get exposure type info for display
  const exposureTypeInfo = exposureType
    ? EXPOSURE_TYPES[exposureType.toUpperCase()]
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* T092: Contextual Education Link */}
      {exposureType && educationalContent && educationalContent.length > 0 && (
        <TouchableOpacity
          style={styles.educationBanner}
          onPress={() => router.push(`/education/${educationalContent[0]._id}`)}
          accessibilityLabel="Learn about workplace safety"
          accessibilityHint="Tap to read safety information"
        >
          <View style={styles.educationIconContainer}>
            <Text style={styles.educationIcon}>📚</Text>
          </View>
          <View style={styles.educationContent}>
            <Text style={styles.educationTitle}>Safety Information Available</Text>
            <Text style={styles.educationSubtitle} numberOfLines={1}>
              {educationalContent[0].title}
            </Text>
          </View>
          <Text style={styles.educationArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Duration */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.label}>
          Duration *
        </Text>
        <View style={styles.durationRow}>
          <View style={styles.durationField}>
            <TextInput
              label="Hours"
              value={formData.duration?.hours?.toString() || '0'}
              onChangeText={text => {
                const hours = parseInt(text) || 0;
                onChange('duration', {
                  ...formData.duration,
                  hours: Math.min(Math.max(hours, 0), 24),
                  minutes: formData.duration?.minutes || 0,
                });
              }}
              keyboardType="number-pad"
              mode="outlined"
              maxLength={2}
              accessibilityLabel="Duration in hours"
            />
          </View>
          <View style={styles.durationField}>
            <TextInput
              label="Minutes"
              value={formData.duration?.minutes?.toString() || '0'}
              onChangeText={text => {
                const minutes = parseInt(text) || 0;
                onChange('duration', {
                  hours: formData.duration?.hours || 0,
                  minutes: Math.min(Math.max(minutes, 0), 59),
                });
              }}
              keyboardType="number-pad"
              mode="outlined"
              maxLength={2}
              accessibilityLabel="Duration in minutes"
            />
          </View>
        </View>
      </View>

      {/* Severity */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.label}>
          Severity *
        </Text>
        <SegmentedButtons
          value={formData.severity || 'low'}
          onValueChange={value => onChange('severity', value)}
          buttons={[
            {
              value: 'low',
              label: 'Low',
              style: formData.severity === 'low' ? styles.severityLow : undefined,
            },
            {
              value: 'medium',
              label: 'Medium',
              style: formData.severity === 'medium' ? styles.severityMedium : undefined,
            },
            {
              value: 'high',
              label: 'High',
              style: formData.severity === 'high' ? styles.severityHigh : undefined,
            },
          ]}
        />
      </View>

      {/* PPE */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.label}>
          PPE Worn
        </Text>
        <View style={styles.chipContainer}>
          {ppeOptions.map(ppe => {
            const isSelected = (formData.ppe || []).includes(ppe.id);
            return (
              <Chip
                key={ppe.id}
                selected={isSelected}
                onPress={() => togglePPE(ppe.id)}
                style={styles.chip}
                accessibilityLabel={ppe.label}
                accessibilityHint={ppe.description}
              >
                {ppe.label}
              </Chip>
            );
          })}
        </View>
      </View>

      {/* Work Activity */}
      <View style={styles.section}>
        <TextInput
          label="Work Activity *"
          value={formData.workActivity || ''}
          onChangeText={text => onChange('workActivity', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          maxLength={500}
          placeholder="Describe what you were doing during the exposure"
          accessibilityLabel="Work activity description"
        />
      </View>

      {/* Chemical Name (conditional) */}
      {requiresChemicalName && (
        <View style={styles.section}>
          <TextInput
            label="Chemical Name *"
            value={formData.chemicalName || ''}
            onChangeText={text => onChange('chemicalName', text)}
            mode="outlined"
            placeholder="Name of chemical or substance"
            accessibilityLabel="Chemical name"
          />
        </View>
      )}

      {/* SDS Reference */}
      <View style={styles.section}>
        <TextInput
          label="SDS Reference"
          value={formData.sdsReference || ''}
          onChangeText={text => onChange('sdsReference', text)}
          mode="outlined"
          placeholder="Safety Data Sheet reference number"
          accessibilityLabel="SDS reference"
        />
      </View>

      {/* Control Measures */}
      <View style={styles.section}>
        <TextInput
          label="Control Measures"
          value={formData.controlMeasures || ''}
          onChangeText={text => onChange('controlMeasures', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="What controls were in place to minimize exposure?"
          accessibilityLabel="Control measures"
        />
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <TextInput
          label="Additional Notes"
          value={formData.notes || ''}
          onChangeText={text => onChange('notes', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          maxLength={2000}
          placeholder="Any additional details or observations"
          accessibilityLabel="Additional notes"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  educationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  educationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationIcon: {
    fontSize: 20,
  },
  educationContent: {
    flex: 1,
  },
  educationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onPrimaryContainer,
    marginBottom: 2,
  },
  educationSubtitle: {
    fontSize: 12,
    color: colors.onPrimaryContainer,
    opacity: 0.8,
  },
  educationArrow: {
    fontSize: 24,
    color: colors.onPrimaryContainer,
    opacity: 0.6,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.text,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  durationField: {
    flex: 1,
  },
  severityLow: {
    backgroundColor: colors.severity.low + '30',
  },
  severityMedium: {
    backgroundColor: colors.severity.medium + '30',
  },
  severityHigh: {
    backgroundColor: colors.severity.high + '30',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginBottom: spacing.xs,
  },
});
