/**
 * T097: Application Configuration
 * Centralized configuration for app settings, API keys, and feature flags
 */

/**
 * AI Hazard Detection Configuration
 * For P3 feature: AI-powered hazard detection from photos
 */
export const AI_CONFIG = {
  /**
   * AI Model Configuration
   * Using GPT-4 Vision for hazard detection
   */
  MODEL: {
    NAME: 'gpt-4-vision-preview' as const,
    PROVIDER: 'OpenAI' as const,
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3, // Lower temperature for consistent, factual responses
  },

  /**
   * Confidence Thresholds
   * Minimum confidence level to show detection to user
   */
  CONFIDENCE: {
    MINIMUM: 0.5, // Don't show detections below 50% confidence
    HIGH: 0.8, // Consider high confidence at 80%+
    AUTO_ACCEPT: 0.95, // Auto-accept suggestions at 95%+ (future feature)
  },

  /**
   * Feature Flags
   */
  FEATURES: {
    ENABLED: true, // Enable/disable AI detection (P3 feature)
    AUTO_SCAN_ON_CAPTURE: false, // Automatically scan photos after capture
    SHOW_CONFIDENCE_LEVELS: true, // Show confidence percentages to user
    SHOW_BOUNDING_BOXES: false, // Show detection bounding boxes (not implemented yet)
  },

  /**
   * Rate Limiting
   * Protect against excessive API calls
   */
  RATE_LIMITS: {
    MAX_SCANS_PER_HOUR: 50, // Limit scans per user per hour
    MAX_SCANS_PER_DAY: 200, // Limit scans per user per day
    COOLDOWN_SECONDS: 5, // Minimum seconds between scans
  },

  /**
   * Timeout Configuration
   */
  TIMEOUT: {
    SCAN_TIMEOUT_MS: 30000, // 30 second timeout for AI scan
    RETRY_ATTEMPTS: 2, // Number of retry attempts on failure
    RETRY_DELAY_MS: 2000, // Delay between retries
  },
} as const;

/**
 * App Configuration
 */
export const APP_CONFIG = {
  /**
   * App Information
   */
  APP_NAME: 'Waldo Health',
  APP_VERSION: '1.0.0',
  APP_BUNDLE_ID: 'com.waldo.health',

  /**
   * Feature Flags
   */
  FEATURES: {
    VOICE_ENTRY: true, // Voice-to-text exposure documentation
    EDUCATION: true, // Educational content about hazards
    AI_DETECTION: AI_CONFIG.FEATURES.ENABLED, // AI hazard detection
    LOCATION_TRACKING: false, // Location/maps feature (P2, not yet implemented)
    EXPORT_PDF: true, // PDF export functionality
    EXPORT_CSV: true, // CSV export functionality
  },

  /**
   * Performance Settings
   */
  PERFORMANCE: {
    MAX_PHOTOS_PER_EXPOSURE: 5,
    MAX_PHOTO_SIZE_MB: 10,
    IMAGE_QUALITY: 0.8, // JPEG compression quality
    THUMBNAIL_SIZE: 200, // Thumbnail dimension (square)
  },

  /**
   * Offline Mode Settings
   */
  OFFLINE: {
    SYNC_INTERVAL_MS: 30000, // Sync every 30 seconds when online
    MAX_QUEUE_SIZE: 100, // Maximum queued mutations
    RETRY_FAILED_AFTER_MS: 300000, // Retry failed syncs after 5 minutes
  },

  /**
   * Accessibility Settings
   */
  ACCESSIBILITY: {
    MIN_TOUCH_TARGET_SIZE: 44, // WCAG 2.1 AA minimum
    FONT_SCALE_SUPPORT: true,
    SCREEN_READER_SUPPORT: true,
  },
} as const;

/**
 * External Services Configuration
 * (API keys should be loaded from environment variables)
 */
export const SERVICES_CONFIG = {
  CONVEX: {
    URL: process.env.EXPO_PUBLIC_CONVEX_URL || '',
  },

  CLERK: {
    PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  },

  SENTRY: {
    DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    ENABLED: false, // Enable in production
  },
} as const;

/**
 * Development Mode Helpers
 */
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

/**
 * Get AI confidence threshold setting
 * Can be overridden by user preferences in future
 */
export function getAIConfidenceThreshold(): number {
  // TODO: Load from user preferences when implemented
  return AI_CONFIG.CONFIDENCE.MINIMUM;
}

/**
 * Check if AI detection is enabled
 */
export function isAIDetectionEnabled(): boolean {
  return AI_CONFIG.FEATURES.ENABLED && APP_CONFIG.FEATURES.AI_DETECTION;
}
