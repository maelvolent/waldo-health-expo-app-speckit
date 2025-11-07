/**
 * ExposureCard Component
 * T051: Card for exposure list items
 * T117: Optimized with React.memo and progressive loading
 *
 * Displays:
 * - Thumbnail photo
 * - Exposure type with icon
 * - Timestamp
 * - Location
 * - Severity indicator
 * - Sync status
 *
 * Performance Optimizations (T117):
 * - React.memo with custom comparison
 * - Memoized calculations
 * - Progressive image loading
 * - Minimal re-renders
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, Image, Alert, Modal, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@components/common/GlassCard';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { format } from 'date-fns';
import { useHaptics } from '@hooks/useHaptics';

interface ExposureCardProps {
  exposure: {
    _id: string;
    exposureType: string;
    timestamp: number;
    location: {
      latitude: number;
      longitude: number;
      address: string | null;
      siteName: string | null;
    };
    severity: 'low' | 'medium' | 'high';
    syncStatus: string;
    photoIds: any[];
  };
  thumbnailUri?: string | null;
  onPress: () => void;
  onEdit?: () => void; // T076: Optional edit handler
  onDelete?: () => void; // T076: Optional delete handler
}

// T117: Wrap with React.memo for performance
export const ExposureCard = React.memo(function ExposureCard({
  exposure,
  thumbnailUri,
  onPress,
  onEdit,
  onDelete
}: ExposureCardProps) {
  const { medium } = useHaptics(); // T076: Haptic feedback for long press
  const [showMenu, setShowMenu] = useState(false);

  // T076: Handle long press to show context menu
  const handleLongPress = useCallback(() => {
    medium(); // Haptic feedback on long press
    setShowMenu(true);
  }, [medium]);

  // T117: Memoize expensive calculations
  const exposureType = useMemo(
    () => EXPOSURE_TYPES[exposure.exposureType.toUpperCase()],
    [exposure.exposureType]
  );

  const severityColor = useMemo(
    () => getSeverityColor(exposure.severity),
    [exposure.severity]
  );

  const syncIcon = useMemo(
    () => getSyncIcon(exposure.syncStatus),
    [exposure.syncStatus]
  );

  const formattedDate = useMemo(
    () => format(exposure.timestamp, 'MMM d, yyyy h:mm a'),
    [exposure.timestamp]
  );

  const accessibilityLabel = useMemo(
    () => `${exposureType?.label || 'Exposure'} on ${format(exposure.timestamp, 'MMM d, yyyy')}`,
    [exposureType, exposure.timestamp]
  );

  return (
    <>
      {/* T024: Glass card effect */}
      <GlassCard
        onPress={onPress}
        onLongPress={handleLongPress} // T076: Long press to show menu
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Tap to view details, long press for options"
      >
        <View style={styles.container}>
        {/* Thumbnail or placeholder */}
        <View style={styles.thumbnailContainer}>
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.thumbnail}
              accessibilityLabel="Exposure photo"
              // T117: Performance optimizations
              resizeMode="cover"
              resizeMethod="resize"
            />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Ionicons
                name={exposure.photoIds.length > 0 ? 'camera' : 'document-text'}
                size={32}
                color={colors.icon.muted}
                accessibilityLabel={exposure.photoIds.length > 0 ? 'Photo icon' : 'Document icon'}
              />
            </View>
          )}
          {exposure.photoIds.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{exposure.photoIds.length}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header: Type and sync status */}
          <View style={styles.header}>
            <View style={styles.typeContainer}>
              <View
                style={[styles.severityIndicator, { backgroundColor: severityColor }]}
                accessibilityLabel={`${exposure.severity} severity`}
              />
              <Text variant="titleMedium" style={styles.typeLabel} numberOfLines={1}>
                {exposureType?.label || exposure.exposureType}
              </Text>
            </View>
            <IconButton
              icon={syncIcon}
              size={20}
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

          {/* T117: Use memoized formatted date */}
          <Text variant="bodySmall" style={styles.timestamp}>
            {formattedDate}
          </Text>

          {/* Location */}
          {(exposure.location.siteName || exposure.location.address) && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color={colors.icon.secondary} style={styles.locationIcon} />
              <Text
                variant="bodySmall"
                style={styles.location}
                numberOfLines={1}
                accessibilityLabel={`Location: ${exposure.location.siteName || exposure.location.address}`}
              >
                {exposure.location.siteName || exposure.location.address}
              </Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>

    {/* T076: Context menu modal */}
    <Modal
      visible={showMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
        <View style={styles.contextMenu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel="View details"
          >
            <Ionicons name="eye" size={20} color={colors.icon.primary} />
            <Text style={styles.menuItemText}>View</Text>
          </Pressable>

          {onEdit && (
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onEdit();
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit exposure"
            >
              <Ionicons name="create" size={20} color={colors.icon.primary} />
              <Text style={styles.menuItemText}>Edit</Text>
            </Pressable>
          )}

          {onDelete && (
            <Pressable
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowMenu(false);
                onDelete();
              }}
              accessibilityRole="button"
              accessibilityLabel="Delete exposure"
            >
              <Ionicons name="trash" size={20} color={colors.error} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.menuItem, styles.menuItemCancel]}
            onPress={() => setShowMenu(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.menuItemText}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  </>
  );
}, (prevProps, nextProps) => {
  // T117: Custom comparison function for React.memo
  // Only re-render if these props change
  return (
    prevProps.exposure._id === nextProps.exposure._id &&
    prevProps.exposure.exposureType === nextProps.exposure.exposureType &&
    prevProps.exposure.timestamp === nextProps.exposure.timestamp &&
    prevProps.exposure.severity === nextProps.exposure.severity &&
    prevProps.exposure.syncStatus === nextProps.exposure.syncStatus &&
    prevProps.exposure.photoIds.length === nextProps.exposure.photoIds.length &&
    prevProps.thumbnailUri === nextProps.thumbnailUri &&
    prevProps.exposure.location?.siteName === nextProps.exposure.location?.siteName
  );
});

/**
 * Get severity color
 */
function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
  return colors.severity[severity];
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
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  placeholderThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  photoCountText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
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
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    flex: 1,
    color: colors.text,
  },
  timestamp: {
    color: colors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    marginTop: 2,
  },
  location: {
    flex: 1,
    color: colors.textSecondary,
  },
  // T076: Context menu styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  contextMenu: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemDanger: {
    backgroundColor: colors.errorBackground,
  },
  menuItemCancel: {
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: colors.error,
  },
});
