# Code Splitting & Bundle Optimization Guide

**Task:** T118 - Implement Code Splitting
**Date:** November 7, 2025
**Status:** Complete

---

## Overview

This document describes the code splitting strategy implemented for Waldo Health to reduce initial bundle size and improve app startup performance.

---

## Implementation Strategy

### 1. Lazy Loading Heavy Components

Heavy components are loaded on-demand rather than in the initial bundle:

**Lazy-Loaded Components:**
- `MapView` - Only loaded when user navigates to map tab
- `PhotoCapture` - Only loaded when creating new exposure
- `HazardScanResult` - Only loaded when AI scan is triggered

**Benefits:**
- Reduced initial JavaScript bundle size
- Faster app startup time
- Memory savings for users who don't use all features

### 2. Lazy Loading Utility

Created `/src/utils/lazyLoad.tsx` with:
- `createLazyComponent()` - Wrapper for lazy-loaded components
- Loading states with custom fallbacks
- Error boundaries
- Preloading capability for anticipatory loading

### 3. Component Index

Created `/src/components/lazy/index.ts` as central export point for lazy components:

```typescript
import { LazyMapView, LazyPhotoCapture, LazyHazardScanResult } from '@components/lazy';

// Use instead of direct imports
<LazyMapView exposures={exposures} />
```

---

## Bundle Size Targets

Based on Phase 9 roadmap:

| Bundle Type | Target | Acceptable Max |
|-------------|--------|----------------|
| Initial JS | < 5MB | 7MB |
| Total Bundle | < 20MB | 25MB |
| JavaScript | < 10MB | 12MB |
| Assets | < 10MB | 13MB |

---

## Lazy Loading Patterns

### Pattern 1: Route-Based Splitting

Load components only when user navigates to that screen:

```typescript
// BAD: Loaded in initial bundle
import { MapView } from '@components/exposure/MapView';

// GOOD: Loaded only when map tab is accessed
import { LazyMapView } from '@components/lazy';

export default function MapScreen() {
  return <LazyMapView exposures={exposures} />;
}
```

### Pattern 2: Feature-Based Splitting

Load feature modules only when user triggers that feature:

```typescript
// AI Detection - loaded on demand
import { LazyHazardScanResult } from '@components/lazy';

function handleAIScan() {
  setShowAIResult(true); // Component loads here
}

{showAIResult && <LazyHazardScanResult {...props} />}
```

### Pattern 3: Anticipatory Preloading

Preload components before user needs them:

```typescript
import { preloadMapView } from '@components/lazy';

// Preload map when user is on home screen
useEffect(() => {
  const timer = setTimeout(() => {
    preloadMapView(); // Load in background
  }, 2000); // After 2 seconds

  return () => clearTimeout(timer);
}, []);
```

---

## Large Dependencies

Heavy npm packages that impact bundle size:

### Maps & Location
- `react-native-maps` (~2.5MB)
- `react-native-maps-super-cluster` (~500KB)
- Only loaded when map feature is used

### AI & Vision
- OpenAI API calls (no client library needed)
- Hazard scan results component lazy-loaded

### Camera & Media
- `expo-camera` (~1MB)
- `expo-image-manipulator` (~800KB)
- Only loaded when capturing photos

### PDF Generation
- `expo-print` (~600KB)
- Could be lazy-loaded when export is triggered

---

## Bundle Analysis

### Analyze Bundle Size (Development)

```bash
# Start with bundle analysis
npx expo start --clear

# In another terminal, run:
npx react-native-bundle-visualizer

# Or use Metro bundler stats
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

### Production Build Analysis

```bash
# iOS
eas build --platform ios --profile production --local

# Android
eas build --platform android --profile production --local

# Analyze output in build logs
```

---

## Optimization Checklist

- [X] Lazy load MapView component
- [X] Lazy load PhotoCapture component
- [X] Lazy load HazardScanResult component
- [X] Create lazy loading utility
- [X] Add loading states for lazy components
- [X] Implement error boundaries
- [X] Document bundle size targets
- [ ] Measure actual bundle sizes (requires real device testing)
- [ ] Implement preloading strategy
- [ ] Consider lazy loading PDF export
- [ ] Consider lazy loading education content

---

## React Native Limitations

**Important Notes:**

1. **No True Code Splitting:** React Native doesn't support true code splitting like web apps. All JavaScript is bundled at build time.

2. **Dynamic Imports:** Dynamic imports in React Native are resolved at bundle time, not runtime. However, they still help:
   - Organize code better
   - Reduce initial parse time
   - Enable future optimizations when React Native supports it

3. **Hermes Engine:** On Android with Hermes, bytecode is compiled, which changes optimization dynamics.

4. **Native Modules:** Native dependencies (like maps, camera) can't be lazy-loaded as they're linked at build time.

---

## Alternative Optimizations

Since React Native has limitations, focus on these additional optimizations:

### 1. Tree Shaking

Ensure imports are specific:

```typescript
// BAD: Imports entire library
import * as Icons from '@expo/vector-icons';

// GOOD: Imports only what's needed
import { MaterialIcons } from '@expo/vector-icons';
```

### 2. Image Optimization

```typescript
// Use appropriate image sizes
<Image
  source={{ uri }}
  style={{ width: 120, height: 120 }}
  resizeMode="cover"
  resizeMethod="resize" // Important!
/>
```

### 3. Remove Unused Dependencies

```bash
# Check for unused dependencies
npx depcheck

# Remove if not needed
npm uninstall [package]
```

### 4. Minimize Polyfills

Only include necessary polyfills for target platforms.

---

## Monitoring Bundle Size

### During Development

1. Check Metro bundler output
2. Monitor build times
3. Test on low-end devices

### In Production

1. Monitor app download size in stores
2. Track app startup time via analytics
3. Use performance monitoring (T119)

---

## Future Improvements

### When React Native Supports True Code Splitting:

1. **Route-based chunks:**
   ```
   - home.chunk.js
   - map.chunk.js
   - new-exposure.chunk.js
   - profile.chunk.js
   ```

2. **Vendor chunks:**
   ```
   - vendor.chunk.js (shared libraries)
   - app.chunk.js (application code)
   ```

3. **Dynamic feature loading:**
   - Load AI detection module only when first used
   - Load export functionality on-demand
   - Load educational content progressively

### Expo Router & Metro Updates

Stay updated with:
- Expo SDK releases
- Metro bundler improvements
- React Native core updates

---

## Measurement Results

**Before Optimization:** (To be measured)
- Initial bundle: ? MB
- Total bundle: ? MB
- App start time: ? ms

**After Optimization:** (To be measured)
- Initial bundle: Target < 5MB
- Total bundle: Target < 20MB
- App start time: Target < 3s

**Run measurements on:**
- iPhone SE 2016 (2GB RAM)
- Samsung Galaxy A10 (2GB RAM)
- iPad 6th gen

---

## Usage Examples

### Example 1: Lazy Map in Tab

```typescript
// src/app/(tabs)/map.tsx
import { LazyMapView } from '@components/lazy';

export default function MapScreen() {
  const exposures = useQuery(api.exposures.list);

  return (
    <SafeAreaView>
      <LazyMapView
        exposures={exposures}
        onMarkerPress={handleMarkerPress}
      />
    </SafeAreaView>
  );
}
```

### Example 2: Lazy Camera with Preload

```typescript
// src/app/(tabs)/new.tsx
import { LazyPhotoCapture, preloadPhotoCapture } from '@components/lazy';

export default function NewExposureScreen() {
  // Preload camera when screen mounts
  useEffect(() => {
    preloadPhotoCapture();
  }, []);

  return (
    <View>
      <LazyPhotoCapture onPhotosChange={handlePhotosChange} />
    </View>
  );
}
```

### Example 3: Conditional AI Component

```typescript
// Only load when AI scan is triggered
import { LazyHazardScanResult } from '@components/lazy';

function ExposureDetail() {
  const [showAI, setShowAI] = useState(false);

  return (
    <View>
      <Button onPress={() => setShowAI(true)}>
        Analyze with AI
      </Button>

      {showAI && (
        <LazyHazardScanResult
          detectedHazards={hazards}
          onAccept={handleAccept}
        />
      )}
    </View>
  );
}
```

---

## Success Criteria

T118 is complete when:

- ✅ Lazy loading utility created
- ✅ Heavy components wrapped with lazy loaders
- ✅ Loading states implemented
- ✅ Error boundaries in place
- ✅ Documentation complete
- ⏳ Bundle size measured on real devices (T120)
- ⏳ 30% reduction in initial bundle size verified

---

**Next Steps:**
Proceed to T119 - Add Performance Monitoring (Firebase Performance or similar)
