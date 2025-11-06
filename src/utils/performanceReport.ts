/**
 * T116: Performance Report Generator
 * Generate detailed performance reports for profiling
 */

import { performanceMonitor, PERFORMANCE_THRESHOLDS } from './performance';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

interface PerformanceReport {
  timestamp: number;
  appVersion: string;
  metrics: {
    screenLoads: Array<{
      screen: string;
      avgLoadTime: number;
      maxLoadTime: number;
      minLoadTime: number;
      count: number;
    }>;
    slowRenders: Array<{
      component: string;
      duration: number;
      threshold: number;
    }>;
    memoryWarnings: number;
  };
  summary: {
    totalMeasurements: number;
    performanceScore: number; // 0-100
    criticalIssues: string[];
    recommendations: string[];
  };
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(
  appVersion: string = '1.0.0'
): Promise<PerformanceReport> {
  const report = performanceMonitor.getReport();

  // Analyze screen loads
  const screenLoadMap = new Map<string, number[]>();
  report.screenLoads.forEach(load => {
    if (!screenLoadMap.has(load.screenName)) {
      screenLoadMap.set(load.screenName, []);
    }
    screenLoadMap.get(load.screenName)!.push(load.loadTime);
  });

  const screenLoads = Array.from(screenLoadMap.entries()).map(([screen, times]) => ({
    screen,
    avgLoadTime: times.reduce((a, b) => a + b, 0) / times.length,
    maxLoadTime: Math.max(...times),
    minLoadTime: Math.min(...times),
    count: times.length,
  }));

  // Find slow renders
  const slowRenders = report.metrics
    .filter(m => m.name.startsWith('render_') && m.duration! > PERFORMANCE_THRESHOLDS.RENDER_TIME_MS)
    .map(m => ({
      component: m.name.replace('render_', ''),
      duration: m.duration!,
      threshold: PERFORMANCE_THRESHOLDS.RENDER_TIME_MS,
    }));

  // Calculate performance score
  let score = 100;
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];

  // Deduct points for slow screen loads
  screenLoads.forEach(screen => {
    if (screen.avgLoadTime > PERFORMANCE_THRESHOLDS.SCREEN_LOAD_MS) {
      score -= 10;
      criticalIssues.push(
        `${screen.screen} loads slowly (${screen.avgLoadTime.toFixed(0)}ms > ${PERFORMANCE_THRESHOLDS.SCREEN_LOAD_MS}ms)`
      );
      recommendations.push(`Optimize ${screen.screen} screen load time`);
    }
  });

  // Deduct points for slow renders
  if (slowRenders.length > 0) {
    score -= slowRenders.length * 5;
    criticalIssues.push(`${slowRenders.length} components render slowly`);
    recommendations.push('Implement React.memo for slow components');
    recommendations.push('Use useMemo/useCallback for expensive calculations');
  }

  // Deduct points for memory warnings
  if (report.memoryWarnings > 0) {
    score -= report.memoryWarnings * 15;
    criticalIssues.push(`${report.memoryWarnings} memory warnings detected`);
    recommendations.push('Reduce memory usage by clearing caches');
    recommendations.push('Implement image compression');
  }

  score = Math.max(0, Math.min(100, score));

  const performanceReport: PerformanceReport = {
    timestamp: Date.now(),
    appVersion,
    metrics: {
      screenLoads,
      slowRenders,
      memoryWarnings: report.memoryWarnings,
    },
    summary: {
      totalMeasurements: report.metrics.length,
      performanceScore: score,
      criticalIssues,
      recommendations,
    },
  };

  return performanceReport;
}

/**
 * Export performance report as JSON file
 */
export async function exportPerformanceReport(): Promise<void> {
  try {
    const report = await generatePerformanceReport();
    const filename = `performance_report_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(report, null, 2));

    if (__DEV__) {
      console.log('[PERF] Report exported to:', fileUri);
      console.log('[PERF] Performance Score:', report.summary.performanceScore);
    }

    // Share the file
    await shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Share Performance Report',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('[PERF] Error exporting report:', error);
  }
}

/**
 * Print performance report to console
 */
export function printPerformanceReport(report: PerformanceReport): void {
  console.log('\n=== PERFORMANCE REPORT ===');
  console.log(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`App Version: ${report.appVersion}`);
  console.log(`Performance Score: ${report.summary.performanceScore}/100`);

  console.log('\n--- Screen Load Times ---');
  report.metrics.screenLoads.forEach(screen => {
    console.log(
      `${screen.screen}: avg ${screen.avgLoadTime.toFixed(0)}ms, max ${screen.maxLoadTime.toFixed(0)}ms (${screen.count} loads)`
    );
  });

  if (report.metrics.slowRenders.length > 0) {
    console.log('\n--- Slow Renders ---');
    report.metrics.slowRenders.forEach(render => {
      console.log(`${render.component}: ${render.duration.toFixed(2)}ms (threshold: ${render.threshold}ms)`);
    });
  }

  if (report.metrics.memoryWarnings > 0) {
    console.log(`\n--- Memory Warnings: ${report.metrics.memoryWarnings} ---`);
  }

  if (report.summary.criticalIssues.length > 0) {
    console.log('\n--- Critical Issues ---');
    report.summary.criticalIssues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  }

  if (report.summary.recommendations.length > 0) {
    console.log('\n--- Recommendations ---');
    report.summary.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
  }

  console.log('\n=========================\n');
}

/**
 * Get performance metrics summary for display
 */
export function getPerformanceMetricsSummary(): {
  totalScreenLoads: number;
  avgScreenLoadTime: number;
  slowComponents: number;
  memoryWarnings: number;
} {
  const report = performanceMonitor.getReport();

  const avgScreenLoadTime =
    report.screenLoads.length > 0
      ? report.screenLoads.reduce((sum, load) => sum + load.loadTime, 0) / report.screenLoads.length
      : 0;

  const slowComponents = report.metrics.filter(
    m => m.name.startsWith('render_') && m.duration! > PERFORMANCE_THRESHOLDS.RENDER_TIME_MS
  ).length;

  return {
    totalScreenLoads: report.screenLoads.length,
    avgScreenLoadTime,
    slowComponents,
    memoryWarnings: report.memoryWarnings,
  };
}
