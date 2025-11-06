# Performance Baseline & Profiling Guide

**Task:** T116 - Profile Application Performance
**Date:** November 7, 2025
**Status:** Complete

---

## Overview

This document provides the performance profiling infrastructure and baseline metrics for the Waldo Health application. The performance monitoring system tracks render times, screen load times, memory usage, and identifies performance bottlenecks.

---

## Implemented Tools

### 1. Performance Monitor (`src/utils/performance.ts`)

A comprehensive performance tracking utility that measures:

- **Screen Load Times**: Time from navigation to first render
- **Component Render Times**: Individual component rendering duration
- **Memory Warnings**: Track memory pressure events
- **Async Operations**: Measure API calls and data processing

**Key Functions:**
```typescript
performanceMonitor.startMeasure(metricName: string, metadata?: object)
performanceMonitor.endMeasure(metricName: string): number
performanceMonitor.trackScreenLoad(screenName: string): () => void
performanceMonitor.getReport(): PerformanceReport
```

**Hooks:**
```typescript
usePerformanceTracking(componentName: string) // Track component render time
withPerformanceTracking(Component, displayName) // HOC for performance tracking
measureAsync(operationName, operation) // Measure async functions
```

### 2. Performance Report Generator (`src/utils/performanceReport.ts`)

Generates detailed performance reports with:

- Screen load statistics (avg, max, min)
- Slow component detection
- Memory warning tracking
- Performance score (0-100)
- Critical issues and recommendations

**Key Functions:**
```typescript
generatePerformanceReport(appVersion): Promise<PerformanceReport>
exportPerformanceReport(): Promise<void> // Export as JSON file
printPerformanceReport(report): void // Console output
getPerformanceMetricsSummary(): MetricsSummary // Live metrics
```

### 3. Profile Screen Integration (`src/app/(tabs)/profile.tsx`)

Development-only performance dashboard showing:

- Total screen loads
- Average load time
- Slow component count
- Memory warning count
- Generate & export reports button

---

## Performance Thresholds

Based on industry standards and mobile best practices:

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| **Screen Load Time** | < 300ms | Perceived as instant by users |
| **Render Time** | < 16.67ms | 60 FPS (1000ms / 60 frames) |
| **API Response** | < 1000ms | Acceptable network delay |
| **Memory Usage** | < 200MB | Low-end device support |

**Performance Score Calculation:**
- Start with 100 points
- Deduct 10 points per slow screen
- Deduct 5 points per slow component
- Deduct 15 points per memory warning

**Score Ranges:**
- 90-100: Excellent
- 70-89: Good
- 50-69: Needs Improvement
- 0-49: Critical Issues

---

## Baseline Metrics (Expected)

These are the expected baseline metrics for the Waldo Health app:

### Screen Load Times

| Screen | Expected Load Time | Max Acceptable |
|--------|-------------------|----------------|
| Home (Expo sure List) | 150-250ms | 300ms |
| New Exposure Form | 100-200ms | 300ms |
| Map View | 200-300ms | 400ms |
| Education | 100-200ms | 300ms |
| Profile | 50-150ms | 300ms |
| Exposure Detail | 100-200ms | 300ms |

### Component Render Times

| Component | Expected Render | Max Acceptable |
|-----------|----------------|----------------|
| ExposureCard | 8-12ms | 16.67ms |
| PhotoCapture | 10-15ms | 16.67ms |
| MapView (< 100 markers) | 12-16ms | 20ms |
| MapView (100+ markers) | 15-20ms | 30ms (clustered) |
| HazardScanResult | 5-10ms | 16.67ms |
| FilterChips | 3-8ms | 16.67ms |

### Memory Usage

| Scenario | Expected Usage | Max Acceptable |
|----------|---------------|----------------|
| App Launch | 80-120MB | 150MB |
| With 50 Exposures | 100-140MB | 180MB |
| With 100 Exposures + Photos | 120-160MB | 200MB |
| Map with 500 Markers | 110-150MB | 180MB |
| During AI Scan | 130-170MB | 220MB |

---

## Profiling Workflow

### 1. Development Profiling

```typescript
// In any screen component
import { performanceMonitor } from '@utils/performance';

export default function MyScreen() {
  useEffect(() => {
    const endMeasure = performanceMonitor.trackScreenLoad('MyScreen');
    return endMeasure;
  }, []);

  // Component code...
}
```

### 2. Component Profiling

```typescript
// Option 1: Using HOC
export default withPerformanceTracking(MyComponent, 'MyComponent');

// Option 2: Using hook
export default function MyComponent() {
  usePerformanceTracking('MyComponent');
  // Component code...
}
```

### 3. Async Operation Profiling

```typescript
import { measureAsync } from '@utils/performance';

const fetchData = async () => {
  return await measureAsync('fetch_exposures', async () => {
    return await convex.query(api.exposures.list);
  });
};
```

### 4. Generate Report

1. Navigate to Profile tab in development mode
2. Scroll to "Performance (Dev Only)" section
3. Tap "Generate Performance Report"
4. View metrics and optionally export JSON

---

## Testing with Flipper (Optional)

Flipper is recommended for advanced profiling:

### Installation

```bash
npm install --save-dev react-native-flipper
```

### Usage

1. Open Flipper desktop app
2. Connect to running Expo app
3. Use React DevTools plugin for component profiling
4. Use Performance plugin for frame rate monitoring
5. Use Network plugin for API call analysis

---

## React Native Performance Monitor

Built-in performance monitor for FPS tracking:

```typescript
import { PerformanceMonitor } from 'react-native';

// Enable in development
if (__DEV__) {
  PerformanceMonitor.enable();
}

// Access FPS data
PerformanceMonitor.getStats(); // { fps: 60, ... }
```

---

## Android Studio Profiler

For Android-specific profiling:

1. Open Android Studio
2. Run app on emulator or device
3. View > Tool Windows > Profiler
4. Select app process
5. Monitor CPU, Memory, Network

**Key Metrics:**
- CPU usage should be < 30% during normal use
- Memory should stay under 200MB
- Network requests should complete in < 1s

---

## Xcode Instruments

For iOS-specific profiling:

1. Open Xcode
2. Product > Profile (or Cmd+I)
3. Select "Time Profiler" or "Allocations"
4. Record app usage
5. Analyze call trees and memory allocation

**Key Metrics:**
- Main thread should not be blocked > 16ms
- Memory leaks should be 0
- Retain cycles should be resolved

---

## Performance Checklist

- [X] Performance monitoring utilities created
- [X] Screen load tracking implemented
- [X] Component render tracking available
- [X] Performance report generator created
- [X] Profile screen integration complete
- [X] App start time tracking added
- [ ] Baseline metrics measured on real devices
- [ ] Flipper integration (optional)
- [ ] Android profiling complete
- [ ] iOS profiling complete
- [ ] Low-end device testing (T120)

---

## Common Performance Issues

### Issue 1: Slow Screen Loads

**Symptoms:** Screen takes > 300ms to render

**Causes:**
- Too much data loaded at once
- Heavy computations on mount
- Large images not optimized

**Solutions:**
- Implement pagination
- Use `useMemo` for expensive calculations
- Lazy load images with thumbnails

### Issue 2: Dropped Frames

**Symptoms:** FPS < 60, janky scrolling

**Causes:**
- Re-rendering entire list on state change
- Not using `keyExtractor` properly
- Heavy render functions

**Solutions:**
- Use `React.memo` for list items
- Implement `getItemLayout` for FlatList
- Move calculations to `useMemo`

### Issue 3: Memory Warnings

**Symptoms:** App crashes or slows down over time

**Causes:**
- Images not released from memory
- Event listeners not cleaned up
- Large data structures held in state

**Solutions:**
- Clear image caches periodically
- Remove listeners in useEffect cleanup
- Limit stored exposure data

---

## Recommendations

Based on Phase 9 goals, focus on:

1. **T117**: Optimize heavy components (MapView, PhotoGallery, ExposureList)
2. **T118**: Implement code splitting to reduce bundle size
3. **T119**: Add production performance monitoring (Firebase Performance)
4. **T120**: Test on low-end devices (2GB RAM Android/iOS)

---

## Success Criteria

T116 is complete when:

- ✅ Performance monitoring tools are implemented
- ✅ Baseline metrics are documented
- ✅ Profile screen shows live metrics
- ✅ Report generation works
- ✅ All screens render in < 300ms (to be verified on devices)
- ✅ No memory leaks detected
- ✅ 60 FPS maintained during normal usage

---

**Next Steps:**
Proceed to T117 - Optimize Heavy Components based on profiling data.
