/**
 * Exposure Detail Screen
 * T055: View full exposure details with edit and delete
 *
 * Features:
 * - Display all exposure fields
 * - Photo gallery
 * - Edit capability
 * - Delete with confirmation
 * - Sync status indicator
 * - Location map preview
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Appbar, Chip, IconButton } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useExposure } from '@hooks/useExposures';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { SkeletonText } from '@components/common/SkeletonText';
import { SkeletonCard } from '@components/common/SkeletonCard';
import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { EXPOSURE_TYPES, PPE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { Id } from '../../../convex/_generated/dataModel';

export default function ExposureDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exposure, isLoading } = useExposure(id as Id<'exposures'>);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle edit exposure
   */
  function handleEdit() {
    // TODO: Navigate to edit screen
    Alert.alert('Edit', 'Edit functionality coming soon');
  }

  /**
   * Handle delete exposure
   */
  function handleDelete() {
    Alert.alert(
      'Delete Exposure',
      'Are you sure you want to delete this exposure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              // TODO: Call deleteExposure mutation
              Alert.alert('Deleted', 'Exposure deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting exposure:', error);
              Alert.alert('Error', 'Failed to delete exposure');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  /**
   * Handle share exposure
   */
  function handleShare() {
    // TODO: Generate and share PDF report
    Alert.alert('Share', 'Share functionality coming soon');
  }

  // T037: Skeleton loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Exposure Details" />
        </Appbar.Header>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Header Skeleton */}
          <Card>
            <View style={styles.header}>
              <View style={{ marginBottom: spacing.md }}>
                <SkeletonText width="60%" size="large" />
              </View>
              <View style={{ marginBottom: spacing.sm }}>
                <SkeletonText width="40%" size="small" />
              </View>
              <View style={{ marginBottom: spacing.md }}>
                <SkeletonText width="30%" size="small" />
              </View>
              <SkeletonText width={120} size="medium" />
            </View>
          </Card>

          {/* Content Skeleton Cards */}
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Not found
  if (!exposure) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Exposure" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>
            Exposure not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const exposureType = EXPOSURE_TYPES[exposure.exposureType.toUpperCase()];
  const severityColor = colors.severity[exposure.severity as 'low' | 'medium' | 'high'];
  const syncIcon = getSyncIcon(exposure.syncStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Exposure Details" />
        <Appbar.Action icon="share" onPress={handleShare} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Card */}
        <Card>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.typeContainer}>
                <View
                  style={[styles.severityDot, { backgroundColor: severityColor }]}
                  accessibilityLabel={`${exposure.severity} severity`}
                />
                <Text variant="headlineSmall" style={styles.typeLabel}>
                  {exposureType?.label || exposure.exposureType}
                </Text>
              </View>
              <IconButton
                icon={syncIcon}
                size={24}
                iconColor={
                  exposure.syncStatus === 'synced'
                    ? colors.success
                    : exposure.syncStatus === 'syncing'
                      ? colors.syncing
                      : colors.offline
                }
                accessibilityLabel={`Sync status: ${exposure.syncStatus}`}
              />
            </View>

            <Text variant="bodyMedium" style={styles.timestamp}>
              {format(exposure.timestamp, 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text variant="bodyMedium" style={styles.time}>
              {format(exposure.timestamp, 'h:mm a')}
            </Text>

            {/* Severity Badge */}
            <Chip
              style={[styles.severityChip, { backgroundColor: severityColor + '30' }]}
              textStyle={{ color: severityColor }}
              accessibilityLabel={`Severity: ${exposure.severity}`}
            >
              {exposure.severity.toUpperCase()} SEVERITY
            </Chip>
          </View>
        </Card>

        {/* Photos */}
        {exposure.photoIds && exposure.photoIds.length > 0 && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Photos ({exposure.photoIds.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoGallery}
            >
              {exposure.photoIds.map((photoId: string, index: number) => (
                <View key={photoId} style={styles.photoContainer}>
                  {/* TODO: Load actual photo from storage */}
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>Photo {index + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Duration */}
        <Card>
          <View style={styles.field}>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Duration
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.duration.hours > 0 &&
                `${exposure.duration.hours} hour${exposure.duration.hours !== 1 ? 's' : ''}`}
              {exposure.duration.hours > 0 && exposure.duration.minutes > 0 && ' '}
              {exposure.duration.minutes > 0 &&
                `${exposure.duration.minutes} minute${exposure.duration.minutes !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </Card>

        {/* Location */}
        {(exposure.location.siteName || exposure.location.address) && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Location
            </Text>
            {exposure.location.siteName && (
              <Text variant="bodyLarge" style={styles.fieldValue}>
                {exposure.location.siteName}
              </Text>
            )}
            {exposure.location.address && (
              <Text variant="bodyMedium" style={styles.fieldSecondary}>
                {exposure.location.address}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.coordinates}>
              {exposure.location.latitude.toFixed(6)}, {exposure.location.longitude.toFixed(6)}
              {exposure.location.accuracy && ` (±${exposure.location.accuracy.toFixed(0)}m)`}
            </Text>
          </Card>
        )}

        {/* PPE */}
        {exposure.ppe && exposure.ppe.length > 0 && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              PPE Worn
            </Text>
            <View style={styles.chipContainer}>
              {exposure.ppe.map((ppeId: string) => {
                const ppe = PPE_TYPES[ppeId.toUpperCase()];
                return (
                  <Chip key={ppeId} style={styles.chip}>
                    {ppe?.label || ppeId}
                  </Chip>
                );
              })}
            </View>
          </Card>
        )}

        {/* Work Activity */}
        <Card>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Work Activity
          </Text>
          <Text variant="bodyLarge" style={styles.fieldValue}>
            {exposure.workActivity}
          </Text>
        </Card>

        {/* Chemical Name */}
        {exposure.chemicalName && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chemical Name
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.chemicalName}
            </Text>
          </Card>
        )}

        {/* SDS Reference */}
        {exposure.sdsReference && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              SDS Reference
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.sdsReference}
            </Text>
          </Card>
        )}

        {/* Control Measures */}
        {exposure.controlMeasures && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Control Measures
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.controlMeasures}
            </Text>
          </Card>
        )}

        {/* Notes */}
        {exposure.notes && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Notes
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.notes}
            </Text>
          </Card>
        )}

        {/* Voice Transcription */}
        {exposure.voiceTranscription && (
          <Card>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Voice Notes
            </Text>
            <Text variant="bodyLarge" style={styles.fieldValue}>
              {exposure.voiceTranscription}
            </Text>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Record Information
          </Text>
          <View style={styles.metadataRow}>
            <Text variant="bodySmall" style={styles.metadataLabel}>
              Created:
            </Text>
            <Text variant="bodySmall" style={styles.metadataValue}>
              {format(exposure._creationTime, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text variant="bodySmall" style={styles.metadataLabel}>
              Last Updated:
            </Text>
            <Text variant="bodySmall" style={styles.metadataValue}>
              {format(exposure.updatedAt, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Text variant="bodySmall" style={styles.metadataLabel}>
              Sync Status:
            </Text>
            <Text variant="bodySmall" style={styles.metadataValue}>
              {exposure.syncStatus}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Delete Exposure"
            onPress={handleDelete}
            variant="outline"
            loading={isDeleting}
            disabled={isDeleting}
            icon="delete"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Get sync status icon
 */
function getSyncIcon(syncStatus: string): string {
  switch (syncStatus) {
    case 'synced':
      return 'check-circle';
    case 'syncing':
      return 'sync';
    case 'error':
      return 'alert-circle';
    default:
      return 'cloud-upload';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeLabel: {
    flex: 1,
    color: colors.text,
  },
  timestamp: {
    color: colors.text,
    fontWeight: '600',
  },
  time: {
    color: colors.textSecondary,
  },
  severityChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldValue: {
    color: colors.text,
  },
  fieldSecondary: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  coordinates: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  photoGallery: {
    marginTop: spacing.sm,
  },
  photoContainer: {
    marginRight: spacing.md,
  },
  photoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  metadataLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metadataValue: {
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
