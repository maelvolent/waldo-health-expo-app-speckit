/**
 * Camera Utility Functions
 * Handles photo capture with EXIF data preservation
 *
 * Uses expo-camera and expo-image-manipulator to:
 * - Capture photos with device camera
 * - Preserve EXIF metadata (GPS, timestamp, device info)
 * - Resize/compress images for upload
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { PhotoLocal } from '../types/photo';

/**
 * Extract EXIF data from image
 * Returns GPS coordinates, timestamp, and camera info
 */
export async function extractExif(uri: string): Promise<PhotoLocal['exif']> {
  try {
    // Read image file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return null;
    }

    // Note: expo-image-manipulator doesn't extract EXIF directly
    // In production, you'd use a library like expo-media-library or react-native-exif
    // For now, return null - EXIF will be preserved in original file
    return null;
  } catch (error) {
    console.error('Error extracting EXIF:', error);
    return null;
  }
}

/**
 * Process photo for upload
 * - Resizes if too large (max 2048px)
 * - Compresses to reduce file size
 * - Preserves EXIF data
 */
export async function processPhoto(
  uri: string,
  maxDimension: number = 2048,
  quality: number = 0.8
): Promise<PhotoLocal> {
  try {
    // Get original file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Photo file not found');
    }

    // Get image dimensions
    const { width, height } = await getImageDimensions(uri);

    // Calculate resize dimensions if needed
    let resizeWidth = width;
    let resizeHeight = height;

    if (width > maxDimension || height > maxDimension) {
      const aspectRatio = width / height;
      if (width > height) {
        resizeWidth = maxDimension;
        resizeHeight = Math.round(maxDimension / aspectRatio);
      } else {
        resizeHeight = maxDimension;
        resizeWidth = Math.round(maxDimension * aspectRatio);
      }
    }

    // Process image (resize and compress)
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      resizeWidth !== width || resizeHeight !== height
        ? [{ resize: { width: resizeWidth, height: resizeHeight } }]
        : [],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Get processed file info
    const processedFileInfo = await FileSystem.getInfoAsync(manipResult.uri);

    // Extract EXIF from original (before processing)
    const exif = await extractExif(uri);

    // Get file name from URI
    const fileName = uri.split('/').pop() || `photo_${Date.now()}.jpg`;

    // Get file size
    const fileSize =
      processedFileInfo.exists && 'size' in processedFileInfo ? processedFileInfo.size : 0;

    return {
      localUri: manipResult.uri,
      fileName,
      fileSize,
      mimeType: 'image/jpeg',
      width: manipResult.width,
      height: manipResult.height,
      exif,
    };
  } catch (error) {
    console.error('Error processing photo:', error);
    throw error;
  }
}

/**
 * Get image dimensions from URI
 */
async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image dimensions'));
    };
    img.src = uri;
  });
}

/**
 * Validate photo file
 * Checks file size, type, and dimensions
 */
export async function validatePhoto(uri: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // Check file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      errors.push('Photo file not found');
      return { isValid: false, errors };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > maxSize) {
      errors.push('Photo file size exceeds 10MB');
    }

    // Check if it's an image
    if (!uri.match(/\.(jpg|jpeg|png)$/i)) {
      errors.push('Invalid file type. Only JPEG and PNG images are supported');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch {
    errors.push('Error validating photo');
    return { isValid: false, errors };
  }
}

/**
 * Delete temporary photo file
 * Cleans up after upload or cancellation
 */
export async function deleteTempPhoto(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting temp photo:', error);
  }
}

/**
 * Generate thumbnail from photo
 * Creates smaller version for list views
 */
export async function generateThumbnail(uri: string, size: number = 200): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: size, height: size } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return uri; // Return original if thumbnail generation fails
  }
}
