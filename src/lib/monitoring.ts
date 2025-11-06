/**
 * Error Monitoring and Logging
 * Sentry integration for production error tracking
 *
 * Features:
 * - Crash reporting
 * - Performance monitoring
 * - User context tracking
 * - Breadcrumb tracking
 */

import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry monitoring
 * Call this once at app startup
 */
export function initializeMonitoring(): void {
  // Only initialize in production or if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

    // Session tracking
    enableAutoSessionTracking: true,

    // Debug mode (disable in production)
    debug: process.env.NODE_ENV !== 'production',

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive user data
      if (event.user) {
        delete event.user.email;
        delete event.user.phone_number;
      }

      // Remove location data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data?.location) {
            delete breadcrumb.data.location;
          }
          return breadcrumb;
        });
      }

      return event;
    },
  });
}

/**
 * Set user context for error reports
 */
export function setUser(userId: string): void {
  Sentry.setUser({
    id: userId,
    // Don't include email or other PII per privacy policy
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Log error manually
 */
export function logError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log warning message
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  Sentry.captureMessage(message, {
    level: 'warning',
    extra: context,
  });
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  Sentry.captureMessage(message, {
    level: 'info',
    extra: context,
  });
}

/**
 * Start performance transaction
 */
export function startTransaction(name: string, operation: string): any {
  // Note: Sentry v7 uses startSpan instead of startTransaction
  // This is a placeholder for future implementation
  console.log(`Performance tracking: ${name} - ${operation}`);
  return undefined;
}

/**
 * Set custom tag for filtering
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  Sentry.setContext(name, context);
}

/**
 * Wrap component with error boundary
 */
export const ErrorBoundary = Sentry.wrap;

// Export Sentry instance for advanced usage
export { Sentry };

// Common breadcrumb categories
export const BreadcrumbCategory = {
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  EXPOSURE: 'exposure',
  PHOTO: 'photo',
  SYNC: 'sync',
  OFFLINE: 'offline',
  UI: 'ui',
  NETWORK: 'network',
} as const;

// Usage example for developers:
/*
import { addBreadcrumb, logError, BreadcrumbCategory } from '@lib/monitoring';

// Add breadcrumb
addBreadcrumb(
  BreadcrumbCategory.EXPOSURE,
  'User started creating exposure',
  'info',
  { exposureType: 'silica_dust' }
);

// Log error
try {
  // Some operation
} catch (error) {
  logError(error as Error, { context: 'exposure creation' });
}
*/
