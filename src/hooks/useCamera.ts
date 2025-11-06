/**
 * useCamera Hook
 * React hook for camera access and photo capture
 *
 * Handles:
 * - Permission requests
 * - Photo capture
 * - Photo processing
 * - Error handling
 */

import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { processPhoto, validatePhoto } from '../lib/camera';
import { PhotoLocal } from '../types/photo';

interface UseCameraResult {
  hasPermission: boolean | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  capturePhoto: (cameraRef: any) => Promise<PhotoLocal | null>;
  photos: PhotoLocal[];
  addPhoto: (photo: PhotoLocal) => void;
  removePhoto: (index: number) => void;
  clearPhotos: () => void;
}

/**
 * T041: useCamera hook
 * Manages camera permissions and photo capture
 */
export function useCamera(): UseCameraResult {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoLocal[]>([]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  /**
   * Check if camera permission is granted
   */
  async function checkPermission() {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking camera permission:', err);
      setError('Failed to check camera permission');
      setHasPermission(false);
    }
  }

  /**
   * Request camera permission
   */
  async function requestPermission(): Promise<boolean> {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        setError('Camera permission denied');
      }

      return granted;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      setError('Failed to request camera permission');
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Capture photo from camera
   */
  async function capturePhoto(cameraRef: any): Promise<PhotoLocal | null> {
    try {
      setIsLoading(true);
      setError(null);

      if (!cameraRef) {
        throw new Error('Camera reference not available');
      }

      // Check photo limit (max 5)
      if (photos.length >= 5) {
        setError('Maximum 5 photos per exposure');
        return null;
      }

      // Take photo
      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      // Validate photo
      const validation = await validatePhoto(photo.uri);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return null;
      }

      // Process photo (resize, compress)
      const processedPhoto = await processPhoto(photo.uri);

      // Add to photos array
      setPhotos(prev => [...prev, processedPhoto]);

      return processedPhoto;
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Add photo to array (for pre-processed photos)
   */
  function addPhoto(photo: PhotoLocal) {
    if (photos.length >= 5) {
      setError('Maximum 5 photos per exposure');
      return;
    }
    setPhotos(prev => [...prev, photo]);
  }

  /**
   * Remove photo by index
   */
  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setError(null);
  }

  /**
   * Clear all photos
   */
  function clearPhotos() {
    setPhotos([]);
    setError(null);
  }

  return {
    hasPermission,
    isLoading,
    error,
    requestPermission,
    capturePhoto,
    photos,
    addPhoto,
    removePhoto,
    clearPhotos,
  };
}
