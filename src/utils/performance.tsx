/**
 * T116: Performance Monitoring Utilities
 * Tools for profiling render times, memory usage, and app performance
 */

import { InteractionManager, PerformanceObserver } from 'react-native';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ScreenLoadMetric {
  screenName: string;
  loadTime: number;
  timestamp: number;
  userInteractive: boolean;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private screenLoads: ScreenLoadMetric[] = [];
  private memoryWarningCount = 0;

  /**
   * Start measuring a performance metric
   */
  startMeasure(metricName: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.metrics.set(metricName, {
      name: metricName,
      startTime,
      metadata,
    });

    if (__DEV__) {
      console.log(`[PERF] Started measuring: ${metricName}`);
    }
  }

  /**
   * End measuring a performance metric
   */
  endMeasure(metricName: string): number | null {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      if (__DEV__) {
        console.warn(`[PERF] No metric found for: ${metricName}`);
      }
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    if (__DEV__) {
      console.log(`[PERF] ${metricName}: ${duration.toFixed(2)}ms`, metric.metadata);
    }

    // Send to analytics in production
    if (!__DEV__) {
      this.logMetricToAnalytics(metric);
    }

    return duration;
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string): () => void {
    const startTime = performance.now();
    this.startMeasure(`screen_load_${screenName}`, { screenName });

    return () => {
      const loadTime = this.endMeasure(`screen_load_${screenName}`);
      if (loadTime) {
        // Wait for interactions to complete
        InteractionManager.runAfterInteractions(() => {
          const interactiveTime = performance.now();
          const timeToInteractive = interactiveTime - startTime;

          this.screenLoads.push({
            screenName,
            loadTime,
            timestamp: Date.now(),
            userInteractive: true,
          });

          if (__DEV__) {
            console.log(
              `[PERF] Screen "${screenName}" loaded in ${loadTime.toFixed(2)}ms, interactive in ${timeToInteractive.toFixed(2)}ms`
            );
          }

          // Send to analytics
          if (!__DEV__) {
            this.logScreenLoadToAnalytics(screenName, loadTime, timeToInteractive);
          }
        });
      }
    };
  }

  /**
   * Get memory usage (iOS/Android only)
   */
  async getMemoryUsage(): Promise<{ used: number; limit: number } | null> {
    try {
      // React Native doesn't expose memory APIs directly
      // This would need native module implementation
      // For now, return null as placeholder
      return null;
    } catch (error) {
      console.error('[PERF] Error getting memory usage:', error);
      return null;
    }
  }

  /**
   * Track memory warning
   */
  trackMemoryWarning(): void {
    this.memoryWarningCount++;
    if (__DEV__) {
      console.warn(`[PERF] Memory warning #${this.memoryWarningCount}`);
    }
  }

  /**
   * Get performance report
   */
  getReport(): {
    metrics: PerformanceMetric[];
    screenLoads: ScreenLoadMetric[];
    memoryWarnings: number;
  } {
    return {
      metrics: Array.from(this.metrics.values()),
      screenLoads: [...this.screenLoads],
      memoryWarnings: this.memoryWarningCount,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.screenLoads = [];
    this.memoryWarningCount = 0;
  }

  /**
   * Log metric to analytics (placeholder)
   */
  private logMetricToAnalytics(metric: PerformanceMetric): void {
    // TODO: Integrate with Firebase Analytics or similar
    // Example: analytics().logEvent('performance_metric', { ... });
  }

  /**
   * Log screen load to analytics (placeholder)
   */
  private logScreenLoadToAnalytics(
    screenName: string,
    loadTime: number,
    timeToInteractive: number
  ): void {
    // TODO: Integrate with Firebase Analytics or similar
    // Example: analytics().logEvent('screen_load', { screen: screenName, duration: loadTime });
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for tracking component render time
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    if (__DEV__ && renderTime > 16.67) {
      // Warn if render takes longer than one frame (60 FPS = 16.67ms per frame)
      console.warn(`[PERF] ${componentName} render time: ${renderTime.toFixed(2)}ms (> 16.67ms)`);
    }
  });
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const startMeasure = React.useCallback(() => {
      performanceMonitor.startMeasure(`render_${displayName}`);
    }, []);

    const endMeasure = React.useCallback(() => {
      performanceMonitor.endMeasure(`render_${displayName}`);
    }, []);

    React.useEffect(() => {
      startMeasure();
      return endMeasure;
    });

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceTracking(${displayName})`;
  return WrappedComponent;
}

/**
 * Measure async operation performance
 */
export async function measureAsync<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  performanceMonitor.startMeasure(operationName);
  try {
    const result = await operation();
    performanceMonitor.endMeasure(operationName);
    return result;
  } catch (error) {
    performanceMonitor.endMeasure(operationName);
    throw error;
  }
}

/**
 * Get app start time (time from app launch to first render)
 */
export function getAppStartTime(): number {
  // This would need to be set in App.tsx on first render
  const appStartKey = 'app_start_time';
  return performanceMonitor.metrics.get(appStartKey)?.duration || 0;
}

/**
 * Performance thresholds for warnings
 */
export const PERFORMANCE_THRESHOLDS = {
  SCREEN_LOAD_MS: 300, // Screens should load in < 300ms
  RENDER_TIME_MS: 16.67, // 60 FPS = 16.67ms per frame
  API_RESPONSE_MS: 1000, // API calls should respond in < 1s
  MEMORY_MB: 200, // App should use < 200MB RAM
};

// Import React for hooks
import React from 'react';
