# Production Performance Monitoring Setup

**Task:** T119 - Add Performance Monitoring
**Date:** November 7, 2025
**Status:** Complete (Integration Ready)

---

## Overview

This document provides setup instructions for production performance monitoring using Firebase Performance Monitoring and Sentry. The monitoring infrastructure is ready and configured; it just needs Firebase/Sentry credentials to be fully operational.

---

## Architecture

### Monitoring Stack

1. **Development Monitoring** (T116)
   - Local performance profiling
   - Console logging
   - Performance reports
   - **Status:** ✅ Complete

2. **Production Monitoring** (T119)
   - Firebase Performance Monitoring
   - Sentry Performance
   - Custom analytics
   - **Status:** ✅ Code Complete, Awaiting Credentials

---

## Implementation

### 1. Production Monitoring Utility

**File:** `/src/utils/productionMonitoring.ts`

**Features:**
- Performance traces for screens and operations
- Network request tracking
- Custom metrics
- Frame drop detection
- App startup tracking
- Automatic slow operation detection

**Usage:**
```typescript
import { productionMonitoring, useScreenTracking, trackAsyncOperation } from '@utils/productionMonitoring';

// Track screen
export default function MyScreen() {
  useScreenTracking('MyScreen', 'MyScreenClass');
  // ...
}

// Track async operation
const result = await trackAsyncOperation('fetch_exposures', async () => {
  return await convex.query(api.exposures.list);
});

// Custom metric
productionMonitoring.trackCustomMetric({
  name: 'exposure_count',
  value: exposures.length,
});
```

---

## Firebase Performance Monitoring Setup

### Step 1: Install Dependencies

```bash
npm install @react-native-firebase/app @react-native-firebase/perf @react-native-firebase/analytics
```

### Step 2: Configure Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing
3. Add iOS app:
   - Bundle ID: `com.waldohealth.app` (from app.json)
   - Download `GoogleService-Info.plist`
   - Add to iOS project root

4. Add Android app:
   - Package name: `com.waldohealth.app`
   - Download `google-services.json`
   - Add to `android/app/`

### Step 3: Update app.json

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/perf"
    ],
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### Step 4: Enable in Production Monitoring

Uncomment Firebase code in `/src/utils/productionMonitoring.ts`:

```typescript
// Initialize
import perf from '@react-native-firebase/perf';
import analytics from '@react-native-firebase/analytics';

await perf().setPerformanceCollectionEnabled(true);

// Start trace
const trace = await perf().startTrace(traceName);
await trace.stop();

// Screen tracking
await analytics().logScreenView({
  screen_name: screenName,
  screen_class: className,
});
```

### Step 5: Build and Test

```bash
# Rebuild native apps
npx expo prebuild --clean
npx expo run:ios
npx expo run:android

# Verify in Firebase Console
# Performance > Dashboard
```

---

## Sentry Performance Setup

Sentry is already installed (`@sentry/react-native` in package.json).

### Step 1: Configure Sentry DSN

Add to `.env`:
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Step 2: Initialize Sentry in App

**File:** `/src/app/_layout.tsx`

```typescript
import * as Sentry from '@sentry/react-native';

// Initialize before app renders
if (!__DEV__) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: 1.0, // 100% of transactions
    environment: __DEV__ ? 'development' : 'production',
  });
}
```

### Step 3: Enable Performance Monitoring

Uncomment Sentry code in `/src/utils/productionMonitoring.ts`:

```typescript
import * as Sentry from '@sentry/react-native';

// Log slow traces
Sentry.captureMessage(`Slow trace: ${trace.name}`, {
  level: 'warning',
  extra: {
    duration: trace.duration,
    threshold: PERFORMANCE_THRESHOLDS.SCREEN_LOAD_MS,
  },
});

// Start transaction
const transaction = Sentry.startTransaction({
  name: traceName,
  op: 'screen.load',
});

// Finish transaction
transaction.finish();
```

---

## Metrics Being Tracked

### Automatic Metrics

**Firebase Performance:**
- App start time
- Screen rendering
- Network requests (HTTP/HTTPS)
- Custom traces

**Sentry:**
- Crashes and errors
- Performance transactions
- Breadcrumbs (user actions)
- Release tracking

### Custom Metrics

**Screen Performance:**
- Screen load time
- Time to interactive
- Frame drops during scrolling

**API Performance:**
- Convex query duration
- API response times
- Network errors

**User Experience:**
- Photo capture time
- AI scan duration
- Map render time with marker count
- Export generation time

**App Health:**
- Memory warnings
- App startup time
- Background/foreground transitions

---

## Performance Thresholds

From `/src/utils/performance.ts`:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Screen Load | 300ms | Log warning if exceeded |
| API Response | 1000ms | Track as slow query |
| Frame Drop | 5 frames | Send to monitoring |
| Memory Usage | 200MB | Track memory warning |

**Alerts in Firebase/Sentry:**
- Screen load > 500ms (critical)
- API response > 2000ms (critical)
- Error rate > 1% (critical)
- Crash rate > 0.1% (critical)

---

## Dashboard Setup

### Firebase Performance Dashboard

**Screens to Monitor:**
1. Home Screen (`screen_index`)
2. New Exposure (`screen_new`)
3. Map View (`screen_map`)
4. Education (`screen_education`)
5. Profile (`screen_profile`)

**Custom Traces:**
1. `ai_hazard_scan` - AI detection duration
2. `photo_capture` - Camera capture time
3. `pdf_export` - Export generation time
4. `map_render` - Map with N markers

**Network Monitoring:**
- Convex API calls (wss://)
- OpenAI API (https://api.openai.com)
- Photo uploads
- Export downloads

### Sentry Performance Dashboard

**Transactions:**
- Screen loads
- API calls
- User interactions
- Background tasks

**Metrics:**
- P50, P75, P95, P99 latencies
- Error rates by screen
- Slow transactions
- User impact

---

## Testing Monitoring

### Development Testing

```typescript
// Test performance trace
import { productionMonitoring } from '@utils/productionMonitoring';

productionMonitoring.startTrace('test_trace');
// ... do some work ...
productionMonitoring.stopTrace('test_trace');

// Test custom metric
productionMonitoring.trackCustomMetric({
  name: 'test_metric',
  value: 42,
});

// Test screen tracking
productionMonitoring.trackScreen('TestScreen');
```

### Production Testing

1. Build production app
2. Perform key user flows
3. Check Firebase Console after 1-2 hours
4. Verify metrics are appearing

**Key Flows to Test:**
- App launch
- Create new exposure with photos
- View map with 100+ exposures
- Run AI scan
- Export PDF
- Navigate between tabs

---

## Monitoring Checklist

### Firebase Performance
- [ ] Firebase project created
- [ ] iOS app configured
- [ ] Android app configured
- [ ] `GoogleService-Info.plist` added
- [ ] `google-services.json` added
- [ ] Dependencies installed
- [ ] Code uncommented in productionMonitoring.ts
- [ ] Production build tested
- [ ] Dashboard verified

### Sentry
- [ ] Sentry project created
- [ ] DSN configured in `.env`
- [ ] Initialization code added
- [ ] Performance monitoring enabled
- [ ] Source maps configured
- [ ] Release tracking enabled
- [ ] Production build tested
- [ ] Dashboard verified

### Custom Analytics (Optional)
- [ ] Amplitude/Mixpanel account created
- [ ] SDK installed
- [ ] Events defined
- [ ] Integration tested

---

## Troubleshooting

### Firebase Not Showing Data

1. **Wait 1-2 hours**: Data can take time to appear
2. **Check network**: Ensure device has internet
3. **Verify config**: Double-check GoogleService files
4. **Enable debug**: `adb shell setprop log.tag.FirebasePerformance DEBUG`
5. **Check logs**: Look for Firebase initialization errors

### Sentry Not Capturing Events

1. **Verify DSN**: Check `.env` file
2. **Check initialization**: Ensure Sentry.init() is called
3. **Test manually**: `Sentry.captureMessage('test')`
4. **Check network**: Sentry needs internet connection
5. **Verify environment**: Production vs development

### High Data Usage

If monitoring uses too much data:

1. **Reduce sample rate**: `tracesSampleRate: 0.1` (10%)
2. **Disable in certain conditions**: Cellular data only
3. **Filter traces**: Only track important screens
4. **Batch events**: Send in batches vs real-time

---

## Cost Considerations

### Firebase Performance

**Free Tier:**
- 50,000 monthly active users
- Unlimited custom traces
- Unlimited network requests

**Paid (Blaze):**
- $0.005 per 1000 traces beyond free tier
- Very unlikely to exceed for small app

### Sentry

**Free Tier:**
- 5,000 errors/month
- 10,000 performance units/month

**Paid:**
- $26/month for more events
- Performance units: $0.00018 per unit

**Estimate for 1000 DAU:**
- ~$50-100/month total for both services

---

## Privacy & Compliance

### Data Collection

**Firebase collects:**
- Screen names
- App start time
- Network request URLs (no body/headers)
- Device model and OS version
- App version

**Sentry collects:**
- Error stack traces
- Breadcrumbs (user actions)
- Performance data
- Device information

### GDPR Compliance

1. Add to privacy policy
2. Provide opt-out mechanism
3. Anonymize user IDs
4. Set data retention limits

**Implementation:**
```typescript
// Allow users to opt out
productionMonitoring.setEnabled(userConsent);

// Anonymize user data
analytics().setUserId(hashedUserId);
```

---

## Success Criteria

T119 is complete when:

- ✅ Production monitoring utility created
- ✅ Integration code ready for Firebase Performance
- ✅ Integration code ready for Sentry
- ✅ Screen tracking implemented
- ✅ Custom metrics defined
- ✅ Documentation complete
- ⏳ Firebase Performance configured (requires credentials)
- ⏳ Sentry configured (requires credentials)
- ⏳ Production build tested with monitoring

---

## Next Steps

1. **Immediate:** Set up Firebase project and add credentials
2. **Before launch:** Configure Sentry DSN
3. **Post-launch:** Monitor dashboard daily for first week
4. **Ongoing:** Review performance metrics weekly

---

**Monitoring is ready to go live as soon as credentials are configured! 🚀**
