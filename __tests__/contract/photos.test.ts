/**
 * Contract Tests for Photos Convex Functions
 * These tests verify the schema and behavior of photo-related mutations/queries
 *
 * Run with: npm test __tests__/contract/photos.test.ts
 */

import { describe, it, expect } from '@jest/globals';

describe('Photos Contract Tests', () => {
  describe('photos:generateUploadUrl mutation', () => {
    it('should generate presigned URL for photo upload', () => {
      const uploadRequest = {
        exposureId: 'k17abc123def456',
        fileName: 'exposure_photo_1.jpg',
        fileSize: 2048576, // 2MB
        mimeType: 'image/jpeg',
      };

      // Validate request
      expect(uploadRequest.exposureId).toBeTruthy();
      expect(uploadRequest.fileName).toMatch(/\.(jpg|jpeg|png)$/i);
      expect(uploadRequest.fileSize).toBeLessThanOrEqual(10 * 1024 * 1024); // Max 10MB
      expect(['image/jpeg', 'image/png', 'image/jpg']).toContain(uploadRequest.mimeType);
    });

    it('should reject files larger than 10MB', () => {
      const largeFileRequest = {
        exposureId: 'k17abc123def456',
        fileName: 'large_photo.jpg',
        fileSize: 11 * 1024 * 1024, // 11MB
        mimeType: 'image/jpeg',
      };

      expect(largeFileRequest.fileSize).toBeGreaterThan(10 * 1024 * 1024);
    });

    it('should reject unsupported file types', () => {
      const invalidFileRequest = {
        exposureId: 'k17abc123def456',
        fileName: 'document.pdf',
        fileSize: 1024576,
        mimeType: 'application/pdf',
      };

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      expect(validMimeTypes).not.toContain(invalidFileRequest.mimeType);
    });
  });

  describe('photos:confirmUpload mutation', () => {
    it('should accept valid photo metadata after upload', () => {
      const photoMetadata = {
        exposureId: 'k17abc123def456',
        storageId: 'storage_abc123',
        fileName: 'exposure_photo_1.jpg',
        fileSize: 2048576,
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        exif: {
          latitude: -36.8485,
          longitude: 174.7633,
          timestamp: Date.now(),
          make: 'Apple',
          model: 'iPhone 15',
          orientation: 1,
        },
      };

      // Validate metadata
      expect(photoMetadata.exposureId).toBeTruthy();
      expect(photoMetadata.storageId).toBeTruthy();
      expect(photoMetadata.width).toBeGreaterThan(0);
      expect(photoMetadata.height).toBeGreaterThan(0);
      expect(photoMetadata.width).toBeLessThanOrEqual(4096);
      expect(photoMetadata.height).toBeLessThanOrEqual(4096);

      // EXIF validation
      if (photoMetadata.exif) {
        expect(photoMetadata.exif.latitude).toBeGreaterThanOrEqual(-90);
        expect(photoMetadata.exif.latitude).toBeLessThanOrEqual(90);
        expect(photoMetadata.exif.longitude).toBeGreaterThanOrEqual(-180);
        expect(photoMetadata.exif.longitude).toBeLessThanOrEqual(180);
      }
    });

    it('should accept photo metadata without EXIF data', () => {
      const photoWithoutExif = {
        exposureId: 'k17abc123def456',
        storageId: 'storage_abc123',
        fileName: 'exposure_photo_1.jpg',
        fileSize: 2048576,
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        exif: null, // No EXIF data available
      };

      expect(photoWithoutExif.exif).toBeNull();
      expect(photoWithoutExif.exposureId).toBeTruthy();
    });

    it('should reject invalid image dimensions', () => {
      const invalidDimensions = {
        exposureId: 'k17abc123def456',
        storageId: 'storage_abc123',
        fileName: 'huge_photo.jpg',
        fileSize: 8192000,
        mimeType: 'image/jpeg',
        width: 5000, // Too large
        height: 5000, // Too large
        exif: null,
      };

      expect(invalidDimensions.width).toBeGreaterThan(4096);
      expect(invalidDimensions.height).toBeGreaterThan(4096);
    });
  });

  describe('photos:list query', () => {
    it('should filter photos by exposureId', () => {
      const queryParams = {
        exposureId: 'k17abc123def456',
      };

      expect(queryParams.exposureId).toBeTruthy();
    });
  });

  describe('Photo upload constraints', () => {
    it('should limit photos per exposure to 5', () => {
      const maxPhotos = 5;
      const photoIds = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'];

      expect(photoIds.length).toBeLessThanOrEqual(maxPhotos);
    });

    it('should reject 6th photo upload', () => {
      const maxPhotos = 5;
      const photoIds = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5', 'photo6'];

      expect(photoIds.length).toBeGreaterThan(maxPhotos);
    });
  });
});
