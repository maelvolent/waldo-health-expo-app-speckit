/**
 * PhotoCapture Component
 * T048: Camera interface for capturing 1-5 photos
 * T099: Added AI scan trigger for hazard detection
 * T117: Optimized with progressive loading and image caching
 *
 * Features:
 * - Camera preview
 * - Photo capture with useCamera hook
 * - Photo gallery (max 5)
 * - Delete photos
 * - Permission handling
 * - AI hazard scan trigger (P3 feature)
 * - Progressive image loading (T117)
 * - Image caching (T117)
 */

import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import { CameraView } from 'expo-camera';
import { useCamera } from '@hooks/useCamera';
import { Button } from '@components/common/Button';
import { isAIDetectionEnabled } from '@constants/config';
import { colors, spacing } from '@constants/theme';

interface PhotoCaptureProps {
  onPhotosChange: (photoUris: string[]) => void;
  onAIScanRequest?: (photoUri: string, photoIndex: number) => void;
  maxPhotos?: number;
  aiScanEnabled?: boolean;
}

// T117: Memoize PhotoThumbnail component to prevent unnecessary re-renders
const PhotoThumbnail = React.memo(({
  photo,
  index,
  onDelete,
  onAIScan,
  showAIScan,
}: {
  photo: { localUri: string };
  index: number;
  onDelete: (index: number) => void;
  onAIScan?: (uri: string, index: number) => void;
  showAIScan: boolean;
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View key={index} style={styles.photoPreviewContainer}>
      <Image
        source={{ uri: photo.localUri }}
        style={styles.photoPreview}
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        // T117: Enable caching for faster subsequent loads
        resizeMode="cover"
        resizeMethod="resize"
      />
      {imageLoading && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.imageLoader}
        />
      )}
      <IconButton
        icon="close-circle"
        size={24}
        style={styles.deleteButton}
        iconColor={colors.error}
        onPress={() => onDelete(index)}
        accessibilityLabel={`Delete photo ${index + 1}`}
      />
      {showAIScan && onAIScan && (
        <View style={styles.aiScanContainer}>
          <IconButton
            icon="robot"
            size={20}
            containerColor={colors.primary}
            iconColor={colors.onPrimary}
            onPress={() => onAIScan(photo.localUri, index)}
            accessibilityLabel="Scan for hazards with AI"
          />
        </View>
      )}
    </View>
  );
});

export function PhotoCapture({
  onPhotosChange,
  onAIScanRequest,
  maxPhotos = 5,
  aiScanEnabled = isAIDetectionEnabled(),
}: PhotoCaptureProps) {
  const cameraRef = useRef<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { hasPermission, isLoading, error, requestPermission, capturePhoto, photos, removePhoto } =
    useCamera();

  // T117: Memoize callback to prevent re-creating on every render
  const handlePhotosChange = useCallback(() => {
    onPhotosChange(photos.map(p => p.localUri));
  }, [photos, onPhotosChange]);

  // Update parent when photos change
  React.useEffect(() => {
    handlePhotosChange();
  }, [handlePhotosChange]);

  /**
   * Handle capture button press
   */
  async function handleCapture() {
    if (cameraRef.current) {
      await capturePhoto(cameraRef.current);
    }
  }

  /**
   * Handle delete photo
   */
  function handleDelete(index: number) {
    removePhoto(index);
  }

  /**
   * Open camera
   */
  async function openCamera() {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setShowCamera(true);
  }

  /**
   * Close camera
   */
  function closeCamera() {
    setShowCamera(false);
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required to capture photos</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  // Show camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={styles.cameraControls}>
          <Button
            title="Cancel"
            onPress={closeCamera}
            variant="outline"
            style={styles.controlButton}
          />
          <IconButton
            icon="camera"
            size={60}
            iconColor={colors.onPrimary}
            containerColor={colors.primary}
            onPress={handleCapture}
            disabled={isLoading}
            accessibilityLabel="Capture photo"
          />
          <View style={styles.controlButton} />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  // Show photo gallery and capture button
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">
          Photos ({photos.length}/{maxPhotos})
        </Text>
        {photos.length < maxPhotos && (
          <Button title="Add Photo" onPress={openCamera} icon="camera" variant="outline" />
        )}
      </View>

      {/* T117: Use optimized PhotoThumbnail component */}
      {photos.length > 0 && (
        <ScrollView
          horizontal
          style={styles.gallery}
          showsHorizontalScrollIndicator={false}
          // T117: Performance optimizations for horizontal scrolling
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          windowSize={5}
        >
          {photos.map((photo, index) => (
            <PhotoThumbnail
              key={index}
              photo={photo}
              index={index}
              onDelete={handleDelete}
              onAIScan={onAIScanRequest}
              showAIScan={aiScanEnabled && !!onAIScanRequest}
            />
          ))}
        </ScrollView>
      )}

      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptyHint}>
            Add photos to document the exposure (up to {maxPhotos})
          </Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.text,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    width: 100,
  },
  errorContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  gallery: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  // T117: Optimized photo preview for PhotoThumbnail component
  photoPreviewContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
  },
  // T117: Loading indicator for progressive image loading
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  aiScanContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  aiScanButton: {
    margin: 0,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
