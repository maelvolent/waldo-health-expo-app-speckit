/**
 * T119: Production Performance Monitoring
 *
 * Integrates with performance monitoring services for production apps:
 * - Firebase Performance Monitoring
 * - Sentry Performance
 * - Custom analytics
 *
 * Tracks:
 * - App startup time
 * - Screen load times
 * - API response times
 * - Frame drops and jank
 * - Network requests
 * - User interactions
 */

import { performanceMonitor, PERFORMANCE_THRESHOLDS } from './performance';
import { APP_CONFIG } from '@constants/config';

// Types for monitoring events
interface PerformanceTrace {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes?: Record<string, string | number | boolean>;
}

interface NetworkMetric {
  url: string;
  method: string;
  statusCode: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
}

interface CustomMetric {
  name: string;
  value: number;
  attributes?: Record<string, string | number>;
}

/**
 * Production Monitoring Class
 * Wraps Firebase Performance and Sentry APIs
 */
class ProductionMonitoring {
  private enabled: boolean = !__DEV__;
  private traces: Map<string, PerformanceTrace> = new Map();

  constructor() {
    if (this.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize monitoring services
   */
  private async initialize() {
    try {
      // TODO: Initialize Firebase Performance
      // import('@react-native-firebase/perf').then(perf => {
      //   perf().setPerformanceCollectionEnabled(true);
      // });

      // Sentry is already initialized in the app
      console.log('[ProductionMonitoring] Monitoring initialized');
    } catch (error) {
      console.error('[ProductionMonitoring] Failed to initialize:', error);
    }
  }

  /**
   * Start a performance trace
   */
  startTrace(traceName: string, attributes?: Record<string, string | number | boolean>): void {
    if (!this.enabled) return;

    const trace: PerformanceTrace = {
      name: traceName,
      startTime: performance.now(),
      attributes,
    };

    this.traces.set(traceName, trace);

    // TODO: Start Firebase trace
    // perf().startTrace(traceName).then(trace => {
    //   if (attributes) {
    //     Object.entries(attributes).forEach(([key, value]) => {
    //       trace.putAttribute(key, String(value));
    //     });
    //   }
    // });

    if (__DEV__) {
      console.log(`[Trace] Started: ${traceName}`, attributes);
    }
  }

  /**
   * Stop a performance trace
   */
  stopTrace(traceName: string, attributes?: Record<string, string | number | boolean>): void {
    if (!this.enabled) return;

    const trace = this.traces.get(traceName);
    if (!trace) {
      console.warn(`[Trace] No trace found: ${traceName}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - trace.startTime;

    trace.endTime = endTime;
    trace.duration = duration;

    // Merge additional attributes
    if (attributes) {
      trace.attributes = { ...trace.attributes, ...attributes };
    }

    // TODO: Stop Firebase trace
    // perf().trace(traceName).stop();

    // Log slow traces
    if (duration > PERFORMANCE_THRESHOLDS.SCREEN_LOAD_MS) {
      this.logSlowTrace(trace);
    }

    this.traces.delete(traceName);

    if (__DEV__) {
      console.log(`[Trace] Stopped: ${traceName} (${duration.toFixed(2)}ms)`, attributes);
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, className?: string): void {
    if (!this.enabled) return;

    const traceName = `screen_${screenName}`;
    this.startTrace(traceName, {
      screen_name: screenName,
      screen_class: className || screenName,
    });

    // Auto-stop after a reasonable time
    setTimeout(() => {
      if (this.traces.has(traceName)) {
        this.stopTrace(traceName);
      }
    }, 10000); // 10 seconds max

    // TODO: Firebase screen tracking
    // analytics().logScreenView({ screen_name: screenName, screen_class: className });

    if (__DEV__) {
      console.log(`[Screen] ${screenName}`);
    }
  }

  /**
   * Track network request
   */
  trackNetworkRequest(metric: NetworkMetric): void {
    if (!this.enabled) return;

    // TODO: Firebase network monitoring
    // This is automatically handled by Firebase Performance for HTTP requests

    // Log slow API calls
    if (metric.duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_MS) {
      this.logSlowAPI(metric);
    }

    if (__DEV__) {
      console.log(`[Network] ${metric.method} ${metric.url} - ${metric.statusCode} (${metric.duration}ms)`);
    }
  }

  /**
   * Track custom metric
   */
  trackCustomMetric(metric: CustomMetric): void {
    if (!this.enabled) return;

    // TODO: Firebase custom metrics
    // perf().newTrace(metric.name).putMetric(metric.name, metric.value);

    if (__DEV__) {
      console.log(`[Metric] ${metric.name}: ${metric.value}`, metric.attributes);
    }
  }

  /**
   * Log slow trace to error monitoring
   */
  private logSlowTrace(trace: PerformanceTrace): void {
    // TODO: Send to Sentry as performance issue
    // Sentry.captureMessage(`Slow trace: ${trace.name}`, {
    //   level: 'warning',
    //   extra: {
    //     duration: trace.duration,
    //     threshold: PERFORMANCE_THRESHOLDS.SCREEN_LOAD_MS,
    //     attributes: trace.attributes,
    //   },
    // });

    console.warn(`[Performance] Slow trace detected: ${trace.name} (${trace.duration}ms)`);
  }

  /**
   * Log slow API call
   */
  private logSlowAPI(metric: NetworkMetric): void {
    // TODO: Send to Sentry
    console.warn(`[Performance] Slow API call: ${metric.method} ${metric.url} (${metric.duration}ms)`);
  }

  /**
   * Track app startup time
   */
  trackAppStartup(duration: number): void {
    if (!this.enabled) return;

    this.trackCustomMetric({
      name: 'app_startup_time',
      value: duration,
      attributes: {
        app_version: APP_CONFIG.APP_VERSION,
        platform: Platform.OS,
      },
    });

    // Send to analytics
    // TODO: analytics().logEvent('app_startup', { duration });
  }

  /**
   * Track frame drop
   */
  trackFrameDrop(droppedFrames: number): void {
    if (!this.enabled) return;

    if (droppedFrames > 5) {
      this.trackCustomMetric({
        name: 'frame_drops',
        value: droppedFrames,
      });
    }
  }

  /**
   * Set user properties for analytics
   */
  setUserProperties(properties: Record<string, string | number | boolean>): void {
    if (!this.enabled) return;

    // TODO: Firebase Analytics
    // Object.entries(properties).forEach(([key, value]) => {
    //   analytics().setUserProperty(key, String(value));
    // });
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const productionMonitoring = new ProductionMonitoring();

/**
 * React Hook for tracking screen performance
 */
export function useScreenTracking(screenName: string, className?: string) {
  React.useEffect(() => {
    productionMonitoring.trackScreen(screenName, className);

    // Track with development monitor too
    const endMeasure = performanceMonitor.trackScreenLoad(screenName);

    return () => {
      endMeasure();
    };
  }, [screenName, className]);
}

/**
 * Higher-order function to track async operations
 */
export async function trackAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  productionMonitoring.startTrace(operationName, attributes);

  try {
    const result = await operation();
    productionMonitoring.stopTrace(operationName, { success: true });
    return result;
  } catch (error) {
    productionMonitoring.stopTrace(operationName, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Track Convex query performance
 */
export function trackConvexQuery(queryName: string, duration: number, success: boolean): void {
  productionMonitoring.trackCustomMetric({
    name: 'convex_query',
    value: duration,
    attributes: {
      query_name: queryName,
      success,
    },
  });

  if (duration > PERFORMANCE_THRESHOLDS.API_RESPONSE_MS) {
    console.warn(`[Convex] Slow query: ${queryName} (${duration}ms)`);
  }
}

// Import React for hooks
import React from 'react';
import { Platform } from 'react-native';
