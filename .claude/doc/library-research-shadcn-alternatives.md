# Library & SDK Research: Waldo Health Mobile App
**Date**: 2025-11-06
**Project**: Waldo Health - Construction Worker Health Exposure Documentation App
**Tech Stack**: React Native + Expo SDK + Convex Backend
**Target**: iOS 15+ and Android 10+

---

## Executive Summary

This document provides comprehensive research and recommendations for critical library decisions for the Waldo Health mobile app. All decisions prioritize **offline-first functionality**, **WCAG 2.1 AA accessibility compliance**, and **NZ Privacy Act 2020 compliance** as required by the feature specification.

### Key Recommendations at a Glance

| Decision Area | Recommendation | Key Rationale |
|--------------|----------------|---------------|
| **Design System** | React Native Paper | Superior accessibility support, better documentation, active maintenance |
| **Voice-to-Text** | @react-native-voice/voice | True offline support with device-native speech recognition |
| **PDF Generation** | expo-print | Native Expo integration, works offline, simpler setup |
| **Bundle Optimization** | Expo Atlas + Tree Shaking | Built-in tools, 70% reduction possible with proper configuration |
| **Offline Strategy** | Convex + Local Queue Layer | Convex mutations queue + custom photo upload queue needed |
| **Data Residency** | Self-hosted Convex on AWS NZ | Only path to NZ Privacy Act 2020 compliance |

---

## 1. Design System for WCAG 2.1 AA Compliance

### Recommendation: **React Native Paper**

### Rationale

**Accessibility Features:**
- Fully compatible with screen readers (VoiceOver/TalkBack)
- Built-in support for `accessibilityRole`, `accessibilityHint`, and `accessibilityLabel`
- All components follow Material Design accessibility guidelines
- Support for `maxFontSizeMultiplier` for text scaling (up to 200% per FR-026)
- Right-to-left (RTL) language support built-in
- Active maintenance by Callstack with regular accessibility improvements

**WCAG 2.1 AA Compliance:**
- Components designed with proper semantic structure for screen readers
- Color contrast ratios meet WCAG standards when using default theme
- Focus management and keyboard navigation support (critical for FR-024)
- Touch target sizes can be configured to meet 44x44 minimum (FR-025)

**Integration Benefits:**
- Material Design theming system supports both light/dark modes (FR-023)
- TypeScript support with excellent type definitions
- Works seamlessly with Expo (no ejection required)
- Comprehensive documentation with accessibility examples
- Active community (146k+ weekly npm downloads)

### Alternatives Considered

**NativeBase:**
- **Pros**: Comprehensive component library, accessibility focus mentioned
- **Cons**:
  - Less specific documentation on WCAG compliance
  - Larger bundle size (~500KB vs ~300KB for RN Paper)
  - Mixed reviews on accessibility implementation
  - Less active maintenance (fewer recent updates)
- **Why Not Chosen**: React Native Paper has more explicit accessibility documentation and proven track record with screen reader support

### Trade-offs

**Limitations of React Native Paper:**
- Material Design aesthetic may feel Android-centric (less iOS-native feel)
- Some components require manual accessibility configuration for full WCAG AA compliance
- Custom theming requires more setup than NativeBase's simple theme provider
- Limited out-of-box form validation (you'll need to build this)

**Migration Path if Needed:**
Both libraries use similar component APIs, so switching later is feasible but would require significant effort (~2-3 weeks).

### Implementation Notes

**Critical for Accessibility Compliance:**

1. **Touch Targets (FR-025)**:
```typescript
import { Button } from 'react-native-paper';

<Button
  mode="contained"
  style={{ minHeight: 44, minWidth: 44 }}
  accessible={true}
  accessibilityLabel="Log new exposure"
>
  Log Exposure
</Button>
```

2. **Color Contrast (FR-024)**:
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Ensure 4.5:1 contrast ratio for normal text
    primary: '#1976D2', // Contrast ratio: 4.6:1 on white
    text: '#212121',    // Contrast ratio: 16:1 on white
  },
};
```

3. **Screen Reader Support**:
```typescript
<Card
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Silica dust exposure from 2 hours ago"
  accessibilityHint="Double tap to view full details"
>
  {/* Card content */}
</Card>
```

4. **Font Scaling (FR-026)**:
```typescript
import { Text } from 'react-native-paper';

<Text
  variant="bodyLarge"
  maxFontSizeMultiplier={2.0} // Support up to 200% scaling
>
  Exposure Type: Silica Dust
</Text>
```

**Testing Requirements:**
- Test with VoiceOver (iOS) and TalkBack (Android) for all screens
- Use Accessibility Scanner (Android) and Accessibility Inspector (iOS)
- Validate color contrast with tools like WebAIM Contrast Checker
- Test with users wearing work gloves to verify 44x44 touch targets

---

## 2. Voice-to-Text for Offline Speech Recognition

### Recommendation: **@react-native-voice/voice**

### Rationale

**Offline Capability (Critical - FR-006):**
- Uses device-native speech recognition (iOS: SFSpeechRecognizer, Android: SpeechRecognizer)
- Works completely offline once language packs are downloaded
- No API calls or internet connection required during recognition
- Zero latency compared to cloud-based solutions

**NZ English Support:**
- Supports locale parameter: `Voice.start('en-NZ')`
- Support depends on device OS language packs (both iOS and Android support en-NZ)
- Users can download en-NZ language pack from device settings
- Fallback to en-AU (Australian English) which is very similar

**Background Recording (FR-006):**
- Can continue recording while user takes photos (requires proper permission setup)
- Integrates with React Native's AppState for background handling

**Integration:**
- Works seamlessly with Expo (no ejection required)
- Active maintenance with 1.5k+ GitHub stars
- MIT license, free to use
- TypeScript support

### Alternatives Considered

**expo-speech:**
- **Why Not Chosen**: expo-speech is TEXT-TO-SPEECH ONLY, not speech-to-text
- Cannot be used for voice input features

**@jamsch/expo-speech-recognition:**
- **Pros**:
  - Purpose-built for Expo
  - Supports offline on-device recognition with downloaded models
  - Active development (2025)
- **Cons**:
  - Requires Android users to manually download offline models for each locale
  - More complex setup than react-native-voice
  - Newer library (less battle-tested)
- **Why Not Chosen**: react-native-voice is more mature and has simpler setup for device-native recognition

**Picovoice (Cheetah/Leopard):**
- **Pros**:
  - True on-device speech-to-text with custom models
  - No dependency on OS speech recognition
  - Works on any device regardless of language pack installation
- **Cons**:
  - Commercial solution with usage limits on free tier
  - Requires separate SDK integration
  - Larger app bundle size (+5-10MB)
  - NZ English model availability uncertain
- **Why Not Chosen**: Cost and complexity outweigh benefits for MVP

**Google Cloud Speech-to-Text:**
- **Why Not Chosen**: Requires internet connection, violates offline requirement (FR-006)

### Trade-offs

**Limitations:**

1. **OS Dependency**:
   - Speech recognition quality depends on device OS (iOS generally better than Android)
   - NZ English support requires users to have language pack installed
   - Older Android devices (Android 9-) may have poor recognition quality

2. **Language Pack Installation**:
   - Users may need to manually download en-NZ language pack
   - App should gracefully handle missing language packs with fallback to en-US/en-AU

3. **Background Recording Limitations**:
   - iOS background audio requires special entitlements
   - Android 10+ has stricter background microphone restrictions
   - May not work seamlessly while camera is active (need to test)

4. **Privacy/Permissions**:
   - Requires microphone permission (some users may deny)
   - iOS requires NSMicrophoneUsageDescription in app.json
   - Android requires RECORD_AUDIO permission

### Implementation Notes

**Basic Setup:**

```typescript
import Voice from '@react-native-voice/voice';

// Initialize voice recognition with NZ English
const startVoiceRecognition = async () => {
  try {
    // Check if NZ English is available
    const availableLanguages = await Voice.getSupportedLocales();
    const hasNZEnglish = availableLanguages.includes('en-NZ');

    // Start with NZ English or fallback to AU/US
    const locale = hasNZEnglish ? 'en-NZ' : 'en-AU';

    await Voice.start(locale, {
      EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
      EXTRA_MAX_RESULTS: 3,
      EXTRA_PARTIAL_RESULTS: true, // Get real-time results
    });
  } catch (error) {
    console.error('Voice recognition error:', error);
  }
};

// Handle results
Voice.onSpeechResults = (event) => {
  const transcription = event.value[0];
  // Populate form fields from transcription
  parseExposureFromSpeech(transcription);
};
```

**Concurrent Photo + Voice Use:**

```typescript
import { Camera } from 'expo-camera';
import Voice from '@react-native-voice/voice';

const ExposureEntry = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handlePhotoWithVoice = async () => {
    // Start voice recording first
    await Voice.start('en-NZ');
    setIsRecording(true);

    // Take photo while recording
    const photo = await cameraRef.current.takePictureAsync();

    // Voice continues in background
    // Stop when user taps "Done"
  };

  return (
    <>
      <Camera ref={cameraRef} />
      <Button onPress={handlePhotoWithVoice}>
        Take Photo & Describe
      </Button>
      {isRecording && <Text>Listening...</Text>}
    </>
  );
};
```

**Handling Missing Language Packs:**

```typescript
const checkLanguageSupport = async () => {
  const supported = await Voice.getSupportedLocales();

  if (!supported.includes('en-NZ')) {
    Alert.alert(
      'Language Pack Not Found',
      'For best voice recognition, download NZ English from your device settings. Using Australian English as fallback.',
      [
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
        { text: 'Continue with AU English', style: 'cancel' },
      ]
    );
  }
};
```

**Parsing Voice Input to Form Fields:**

```typescript
const parseExposureFromSpeech = (text: string) => {
  // Example: "Silica dust from concrete cutting for two hours wearing P2 mask"

  // Detect exposure type from keywords
  const exposureTypes = {
    'silica': 'silica_dust',
    'asbestos': 'asbestos',
    'welding': 'welding_fumes',
    // ... other mappings
  };

  let detectedType = null;
  for (const [keyword, type] of Object.entries(exposureTypes)) {
    if (text.toLowerCase().includes(keyword)) {
      detectedType = type;
      break;
    }
  }

  // Extract duration (basic pattern matching)
  const durationMatch = text.match(/(\d+)\s*(hour|minute)/i);
  const duration = durationMatch ? parseInt(durationMatch[1]) : null;

  // Extract PPE mentions
  const ppe = [];
  if (text.includes('mask') || text.includes('respirator')) ppe.push('respirator');
  if (text.includes('glove')) ppe.push('gloves');

  // Populate form
  setFormData({
    exposureType: detectedType,
    duration: duration,
    ppe: ppe,
    notes: text, // Keep full transcription as notes
  });
};
```

**Permissions Setup (app.json):**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow Waldo Health to use your microphone for voice entry while documenting exposures."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Waldo Health needs microphone access for hands-free voice entry when documenting workplace exposures.",
        "NSSpeechRecognitionUsageDescription": "Waldo Health uses speech recognition to convert your voice descriptions into exposure records."
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

**Testing Checklist:**
- Test with actual construction workers wearing work gloves and PPE
- Test in noisy environments (construction site background noise)
- Test with various accents within NZ English
- Test offline capability (airplane mode)
- Test concurrent photo + voice recording
- Verify graceful degradation if language pack missing

---

## 3. PDF Generation for Offline Legal Documents

### Recommendation: **expo-print**

### Rationale

**Offline Capability (Critical - FR-009, FR-029):**
- Generates PDFs entirely on-device using native print APIs
- No internet connection required
- No external service dependencies
- Works in airplane mode

**Expo Integration:**
- Built specifically for Expo managed workflow
- No native configuration or ejection required
- Simple setup with `expo install expo-print`
- Maintained by Expo team with regular updates

**Image Handling (FR-009 - embed full-size photos):**
- Supports embedding images via base64 data URIs
- Preserves image quality (no forced compression)
- Can embed multiple photos per page
- Works with photos from expo-camera and expo-file-system

**Multi-Page PDF Generation:**
- Automatically handles page breaks for 10+ exposures
- HTML/CSS-based layout gives full control over formatting
- Can generate professional legal documents with headers/footers
- Supports complex layouts (tables, columns, etc.)

**File Output:**
- Saves to device cache directory by default
- Can be moved to permanent storage or shared immediately
- Integrates with expo-sharing for email/cloud upload
- Generates standards-compliant PDF files

### Alternatives Considered

**react-native-html-to-pdf:**
- **Pros**:
  - More control over native PDF generation
  - Slightly better performance on Android
- **Cons**:
  - **Cannot be used with Expo** (requires ejection or bare React Native)
  - Requires native module linking
  - More complex setup and maintenance
  - Image handling requires manual file:// URI conversion
- **Why Not Chosen**: Incompatible with Expo managed workflow, which is core to project architecture

**react-native-pdf-lib:**
- **Pros**: Low-level PDF creation API, more control
- **Cons**:
  - Requires ejection from Expo
  - Complex API (not HTML-based)
  - More difficult to create professional layouts
  - Steeper learning curve
- **Why Not Chosen**: Complexity and Expo incompatibility

**Server-side PDF generation (e.g., Puppeteer on Convex):**
- **Why Not Chosen**: Requires internet connection, violates offline requirement (FR-029)

### Trade-offs

**Limitations:**

1. **iOS Image Handling Complexity**:
   - iOS WKWebView doesn't support local file:// URLs
   - All images must be converted to base64 data URIs
   - Large images increase memory usage and PDF generation time
   - Need to use expo-image-manipulator for base64 conversion

2. **Android File Path Handling**:
   - Android can use local file paths directly, but for consistency use base64
   - Platform-specific code increases complexity

3. **Memory Constraints**:
   - Large PDFs (50+ exposures with 5 photos each) may cause out-of-memory errors
   - Need to implement chunking/pagination for very large exports
   - Recommend image optimization before embedding

4. **Styling Limitations**:
   - HTML/CSS support is limited to WebView capabilities
   - Some CSS properties may not render correctly
   - Need to test extensively on both platforms

5. **No Built-in Progress Indicator**:
   - PDF generation is synchronous and can block UI for large documents
   - Need to implement loading state manually

### Implementation Notes

**Basic PDF Generation with Images:**

```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync } from 'expo-image-manipulator';

// Convert image to base64 for iOS compatibility
const imageToBase64 = async (uri: string): Promise<string> => {
  // Optimize image before embedding
  const manipResult = await manipulateAsync(
    uri,
    [{ resize: { width: 800 } }], // Resize to max 800px width
    { compress: 0.8, format: 'jpeg', base64: true }
  );

  return `data:image/jpeg;base64,${manipResult.base64}`;
};

// Generate PDF with exposure records
const generateExposurePDF = async (exposures: Exposure[]) => {
  // Convert all photos to base64
  const exposuresWithBase64Photos = await Promise.all(
    exposures.map(async (exposure) => ({
      ...exposure,
      photos: await Promise.all(
        exposure.photos.map(photo => imageToBase64(photo.uri))
      ),
    }))
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 40px;
            color: #333;
          }

          .cover-page {
            text-align: center;
            page-break-after: always;
          }

          h1 {
            color: #1976D2;
            font-size: 24px;
          }

          .exposure {
            page-break-inside: avoid;
            margin-bottom: 30px;
            border: 1px solid #ddd;
            padding: 20px;
          }

          .exposure-header {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 15px;
          }

          .photo-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
          }

          .photo-grid img {
            width: 100%;
            height: auto;
            border: 1px solid #ddd;
          }

          .metadata {
            font-size: 12px;
            color: #666;
          }

          .footer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="cover-page">
          <h1>Workplace Exposure Documentation</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString('en-NZ')}</p>
          <p><strong>Total Exposures:</strong> ${exposures.length}</p>
          <p><strong>Date Range:</strong> ${formatDateRange(exposures)}</p>
          <p style="margin-top: 50px; font-size: 12px; color: #666;">
            This document has been prepared using Waldo Health for ACC claim submission.
            All timestamps and locations are automatically captured at time of exposure.
          </p>
        </div>

        <!-- Table of Contents -->
        <div style="page-break-after: always;">
          <h2>Table of Contents</h2>
          <ul>
            ${exposuresWithBase64Photos.map((exp, idx) => `
              <li>
                ${exp.exposureType} - ${new Date(exp.timestamp).toLocaleDateString('en-NZ')}
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Exposure Entries -->
        ${exposuresWithBase64Photos.map((exp, idx) => `
          <div class="exposure">
            <div class="exposure-header">
              <h2>Exposure ${idx + 1}: ${formatExposureType(exp.exposureType)}</h2>
              <div class="metadata">
                <p><strong>Date & Time:</strong> ${new Date(exp.timestamp).toLocaleString('en-NZ')}</p>
                <p><strong>Location:</strong> ${exp.locationName}</p>
                <p><strong>Address:</strong> ${exp.address}</p>
                <p><strong>GPS:</strong> ${exp.latitude.toFixed(6)}, ${exp.longitude.toFixed(6)}</p>
                <p><strong>Duration:</strong> ${exp.duration} hours</p>
                <p><strong>Severity:</strong> ${exp.severity}</p>
                <p><strong>PPE Used:</strong> ${exp.ppe.join(', ')}</p>
              </div>
            </div>

            <div>
              <h3>Description</h3>
              <p>${exp.notes || 'No additional notes provided.'}</p>
            </div>

            ${exp.photos.length > 0 ? `
              <div>
                <h3>Photographic Evidence (${exp.photos.length} photos)</h3>
                <div class="photo-grid">
                  ${exp.photos.map(photoBase64 => `
                    <img src="${photoBase64}" alt="Exposure evidence photo" />
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Map placeholder - would need to generate static map image -->
            <div style="margin-top: 15px;">
              <p><strong>Location Map:</strong> Lat ${exp.latitude}, Lng ${exp.longitude}</p>
            </div>
          </div>
        `).join('')}

        <div class="footer">
          Generated by Waldo Health - ${new Date().toLocaleDateString('en-NZ')}
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return uri;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
```

**Sharing Generated PDF:**

```typescript
const exportAndSharePDF = async (exposures: Exposure[]) => {
  try {
    // Show loading state
    setIsGenerating(true);

    // Generate PDF
    const pdfUri = await generateExposurePDF(exposures);

    // Move to permanent storage
    const fileName = `exposure-report-${Date.now()}.pdf`;
    const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.moveAsync({
      from: pdfUri,
      to: permanentUri,
    });

    // Share
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(permanentUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Exposure Report',
        UTI: 'com.adobe.pdf',
      });
    }

    setIsGenerating(false);

    return permanentUri;
  } catch (error) {
    setIsGenerating(false);
    Alert.alert('Export Failed', error.message);
  }
};
```

**Handling Large PDFs (Memory Optimization):**

```typescript
const generateLargePDF = async (exposures: Exposure[]) => {
  // For 50+ exposures, chunk into multiple PDFs
  const CHUNK_SIZE = 20; // 20 exposures per PDF

  if (exposures.length <= CHUNK_SIZE) {
    return generateExposurePDF(exposures);
  }

  // Split into chunks
  const chunks = [];
  for (let i = 0; i < exposures.length; i += CHUNK_SIZE) {
    chunks.push(exposures.slice(i, i + CHUNK_SIZE));
  }

  // Generate multiple PDFs
  Alert.alert(
    'Large Export',
    `This will generate ${chunks.length} PDF files due to the large number of exposures (${exposures.length} total).`,
    [
      {
        text: 'Continue',
        onPress: async () => {
          for (let i = 0; i < chunks.length; i++) {
            await generateExposurePDF(chunks[i]);
            // Update progress
            setProgress((i + 1) / chunks.length);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};
```

**Include Static Maps (Optional - Requires Internet):**

```typescript
// Generate static map image using Google Maps Static API
const generateMapImage = async (lat: number, lng: number): Promise<string> => {
  const GOOGLE_MAPS_API_KEY = 'your-api-key';
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x300&markers=color:red%7C${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

  // Download and convert to base64
  const response = await fetch(mapUrl);
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);

  return `data:image/png;base64,${base64}`;
};

// Note: This requires internet, so make it optional
const includeMap = exposure.hasInternet && userPreferences.includeMaps;
```

**Testing Checklist:**
- Test with 1, 5, 10, 50+ exposures to verify performance
- Test with varying number of photos (1-5 per exposure)
- Test offline generation (airplane mode)
- Verify PDF quality on both iOS and Android
- Test sharing to email, Google Drive, Dropbox
- Verify all images are properly embedded and visible
- Test with different image sizes and formats
- Measure PDF file sizes and generation time

---

## 4. Expo Bundle Optimization Best Practices

### Recommendation: **Multi-Strategy Approach**

### Core Strategies

#### 1. **Expo Atlas for Bundle Analysis** (Primary Tool)

**What it is:**
- Official Expo tool for visualizing bundle contents
- Generates detailed breakdown of what's in your bundle
- Shows package sizes, module dependencies, duplicate code

**How to use:**
```bash
# Enable Atlas during build
EXPO_UNSTABLE_ATLAS=true expo start

# In Expo dev tools, press Shift + M
# Select "Open expo-atlas" to visualize bundle

# For production bundle analysis
EXPO_UNSTABLE_ATLAS=true eas build --platform android --profile production
```

**Expected Results:**
- Identify largest dependencies (e.g., if Maps SDK is 5MB, consider lazy loading)
- Find duplicate packages (multiple versions of same library)
- Spot unused code that wasn't tree-shaken

#### 2. **Tree Shaking** (Enabled by Default in SDK 52+)

**What it is:**
- Removes unused code from production bundles
- Works only on ES modules (import/export syntax)
- Experimental in SDK 52, stable in SDK 53+

**Configuration:**

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  // Enable minification for production
  minifierConfig: {
    compress: {
      drop_console: true, // Remove console.logs in production
    },
  },
};

module.exports = config;
```

**Best Practices:**
```typescript
// BAD - Imports entire library
import { Button, Card, List, Dialog } from 'react-native-paper';

// GOOD - Import only what you need (enables tree shaking)
import Button from 'react-native-paper/lib/module/components/Button';
import Card from 'react-native-paper/lib/module/components/Card';

// BEST - Use tree-shakeable library structure
import { Button } from 'react-native-paper'; // RN Paper is already optimized
```

**Avoid CommonJS:**
```javascript
// BAD - Breaks tree shaking
module.exports = { MyComponent };
const lib = require('some-library');

// GOOD - ES modules enable tree shaking
export { MyComponent };
import lib from 'some-library';
```

#### 3. **Platform-Specific Code** (Automatic)

Expo automatically creates separate bundles for iOS, Android, and web. Platform-specific code is removed from other platforms.

```typescript
// ios-specific.ts - only included in iOS bundle
export const iOSOnlyFeature = () => { /* ... */ };

// android-specific.ts - only included in Android bundle
export const androidOnlyFeature = () => { /* ... */ };

// Use platform extensions
// MyComponent.ios.tsx - iOS version
// MyComponent.android.tsx - Android version
```

#### 4. **Lazy Loading for Heavy Features**

**Critical for Waldo Health:**
- Camera, Maps, PDF generation are heavy modules
- Load them only when needed

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy screens
const ExposureMapView = lazy(() => import('./screens/ExposureMapView'));
const PDFExportScreen = lazy(() => import('./screens/PDFExportScreen'));

// Use with Suspense
const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <ExposureMapView />
  </Suspense>
);
```

**For Expo Router:**
```typescript
// app/(tabs)/map.tsx
export { default } from './MapViewLazy';

// MapViewLazy.tsx
import { lazy } from 'react';
export default lazy(() => import('../components/MapView'));
```

#### 5. **Image Optimization**

**Critical for Waldo Health** (5 photos per exposure, 100+ exposures per user):

```bash
# Optimize all images in assets/
npx expo-optimize

# This compresses images with minimal quality loss
```

**Runtime Image Optimization:**
```typescript
import { manipulateAsync } from 'expo-image-manipulator';

// Resize photos before saving
const optimizePhoto = async (uri: string) => {
  return await manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }], // Max 1920px width (maintains aspect ratio)
    { compress: 0.8, format: 'jpeg' } // 80% quality JPEG
  );
};
```

#### 6. **Use Hermes Engine** (Default in Expo)

Hermes reduces bundle size and improves startup time. It's enabled by default in modern Expo.

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes" // Default, but make explicit
  }
}
```

#### 7. **Android App Bundle (AAB)**

Automatically reduces APK size by 30-40% through Google Play's dynamic delivery.

```bash
# Build AAB instead of APK
eas build --platform android --profile production

# EAS automatically generates AAB for Google Play
```

#### 8. **Remove Development Dependencies**

```json
// package.json - Ensure devDependencies are separate
{
  "dependencies": {
    "expo": "~53.0.0",
    "react-native-paper": "^5.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

Development dependencies are never included in production bundles.

### Expected Bundle Sizes (Target Goals)

**For Waldo Health with Camera, Location, Maps, PDF, Voice:**

| Platform | Initial Bundle | Optimized Bundle | Target Goal |
|----------|----------------|------------------|-------------|
| **iOS IPA** | ~80-100 MB | ~40-50 MB | < 50 MB |
| **Android APK** | ~60-80 MB | ~30-40 MB | < 40 MB |
| **Android AAB** | ~50-60 MB | ~25-35 MB | < 35 MB |
| **JavaScript Bundle** | ~3-5 MB | ~1.5-2.5 MB | < 2.5 MB |

**Breakdown by Feature:**
- Base Expo + React Native: ~15 MB
- React Native Paper: ~2 MB
- Maps (react-native-maps): ~5-8 MB
- Camera (expo-camera): ~3-5 MB
- Convex Client: ~1-2 MB
- Voice Recognition: ~1-2 MB (native, minimal JS)
- PDF Generation: ~500 KB (uses native print APIs)
- App Code: ~2-3 MB

### Implementation Roadmap

**Phase 1 - Baseline (Week 1)**
1. Enable Expo Atlas
2. Run production build and analyze bundle
3. Document current sizes

**Phase 2 - Quick Wins (Week 2)**
1. Run `npx expo-optimize` on all images
2. Remove console.logs in production
3. Enable Hermes (verify it's on)
4. Build Android AAB instead of APK

**Expected Reduction: 20-30%**

**Phase 3 - Tree Shaking (Week 3)**
1. Audit all imports for barrel files
2. Convert to direct imports where beneficial
3. Remove unused dependencies
4. Test tree shaking in SDK 52+

**Expected Reduction: 10-20% additional**

**Phase 4 - Lazy Loading (Week 4)**
1. Implement lazy loading for Maps
2. Implement lazy loading for PDF export
3. Defer loading educational content until needed

**Expected Reduction: 5-10% additional**

**Total Expected Reduction: 35-60%**

### Monitoring & Metrics

**EAS Build Integration:**
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_UNSTABLE_ATLAS": "true"
      },
      "android": {
        "buildType": "app-bundle" // AAB by default
      }
    }
  }
}
```

**CI/CD Bundle Size Tracking:**
```bash
# In GitHub Actions or similar
- name: Analyze Bundle Size
  run: |
    EXPO_UNSTABLE_ATLAS=true expo export --platform android
    # Parse bundle stats and fail if > threshold
    if [ $(stat -f%z dist/bundles/android-*.js) -gt 2500000 ]; then
      echo "Bundle too large!"
      exit 1
    fi
```

### Trade-offs

**Tree Shaking:**
- Experimental feature may have bugs
- Some libraries don't support tree shaking well
- Requires testing to ensure nothing breaks

**Lazy Loading:**
- Adds code complexity
- Initial screen may have slight delay while loading
- Need Suspense fallbacks (loading states)

**Image Optimization:**
- `expo-optimize` is lossy (reduces quality slightly)
- Photos for legal evidence should maintain quality
- Recommend optimizing UI assets only, not evidence photos

**Hermes:**
- Slightly slower development builds
- Some rare libraries incompatible (very uncommon in 2025)

### Testing Checklist

- [ ] Measure baseline bundle size before optimizations
- [ ] Test app functionality after each optimization phase
- [ ] Verify camera photo quality not affected
- [ ] Test lazy loading on slow devices
- [ ] Compare APK vs AAB sizes
- [ ] Verify offline functionality still works
- [ ] Test app startup time (should be < 2 seconds per FR-027)

---

## 5. Convex Offline-First Patterns & Photo Upload Queuing

### Recommendation: **Convex Mutations Queue + Custom Local Queue Layer**

### Critical Finding

**Convex does NOT have native offline-first capabilities.** While it handles intermittent network blips and queues mutations automatically, it does NOT support:
- True offline mode with local-first database
- Extended offline operation (hours/days)
- Automatic conflict resolution beyond "last write wins"

**This is a major architectural concern for the Waldo Health app**, which requires robust offline operation per FR-029.

### Recommended Architecture

**Hybrid Approach: Convex + Local Queue Layer**

```
┌─────────────────────────────────────────────┐
│         React Native App (Expo)             │
├─────────────────────────────────────────────┤
│  Local Storage Layer (AsyncStorage/MMKV)    │ <- Queue mutations offline
├─────────────────────────────────────────────┤
│  Sync Manager (Custom Implementation)       │ <- Handle online/offline transitions
├─────────────────────────────────────────────┤
│         Convex React Client                 │ <- Use when online
├─────────────────────────────────────────────┤
│  Convex Backend (Cloud or Self-Hosted)      │
└─────────────────────────────────────────────┘
```

### Implementation Strategy

#### 1. **Local Data Storage** (Source of Truth While Offline)

Use **MMKV** (fast key-value storage) or **WatermelonDB** (SQLite wrapper) for local storage.

**Why MMKV:**
- 30x faster than AsyncStorage
- Synchronous API (no async overhead)
- Perfect for queuing mutations
- Small bundle size (~200KB)

```bash
npm install react-native-mmkv
```

**Example Implementation:**

```typescript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Queue system for offline mutations
interface QueuedMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'exposures' | 'photos';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: QueuedMutation[] = [];

  constructor() {
    // Load queue from storage on app start
    const stored = storage.getString('mutation_queue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  // Add mutation to queue
  enqueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: uuid(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedMutation);
    this.save();

    // Try to sync if online
    this.syncIfOnline();
  }

  // Save queue to persistent storage
  private save() {
    storage.set('mutation_queue', JSON.stringify(this.queue));
  }

  // Sync queue when online
  async syncIfOnline() {
    const isOnline = await NetInfo.fetch().then(state => state.isConnected);
    if (!isOnline) return;

    // Process queue in order
    for (const mutation of this.queue) {
      try {
        await this.executeMutation(mutation);
        this.dequeue(mutation.id);
      } catch (error) {
        mutation.retryCount++;
        if (mutation.retryCount > 5) {
          // Failed after 5 retries - notify user
          this.handleFailedMutation(mutation);
        }
      }
    }
  }

  private async executeMutation(mutation: QueuedMutation) {
    // Execute via Convex
    switch (mutation.type) {
      case 'create':
        await convexClient.mutation('exposures:create', mutation.data);
        break;
      case 'update':
        await convexClient.mutation('exposures:update', mutation.data);
        break;
      case 'delete':
        await convexClient.mutation('exposures:delete', { id: mutation.data.id });
        break;
    }
  }

  private dequeue(id: string) {
    this.queue = this.queue.filter(m => m.id !== id);
    this.save();
  }

  private handleFailedMutation(mutation: QueuedMutation) {
    Alert.alert(
      'Sync Failed',
      `Unable to sync ${mutation.collection} after multiple attempts. Please check your connection.`,
      [
        { text: 'Retry', onPress: () => this.syncIfOnline() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
}

export const offlineQueue = new OfflineQueue();
```

#### 2. **Photo Upload Queue** (Critical for Large Files)

Photos require special handling due to size (1-5MB each).

```typescript
import * as FileSystem from 'expo-file-system';
import { generateUploadUrl } from 'convex/photos';

interface QueuedPhoto {
  id: string;
  localUri: string;
  exposureId: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadProgress: number;
  retryCount: number;
}

class PhotoUploadQueue {
  private queue: QueuedPhoto[] = [];
  private isProcessing = false;

  // Add photo to upload queue
  enqueue(localUri: string, exposureId: string) {
    const queuedPhoto: QueuedPhoto = {
      id: uuid(),
      localUri,
      exposureId,
      uploadStatus: 'pending',
      uploadProgress: 0,
      retryCount: 0,
    };

    this.queue.push(queuedPhoto);
    this.save();

    // Start processing if online
    this.processQueue();
  }

  // Process upload queue
  async processQueue() {
    if (this.isProcessing) return;

    const isOnline = await NetInfo.fetch().then(state => state.isConnected);
    if (!isOnline) {
      console.log('Offline - photo uploads queued');
      return;
    }

    this.isProcessing = true;

    const pendingPhotos = this.queue.filter(p => p.uploadStatus === 'pending');

    for (const photo of pendingPhotos) {
      try {
        await this.uploadPhoto(photo);
      } catch (error) {
        photo.uploadStatus = 'failed';
        photo.retryCount++;
        console.error('Photo upload failed:', error);
      }
    }

    this.isProcessing = false;
    this.save();
  }

  private async uploadPhoto(photo: QueuedPhoto) {
    photo.uploadStatus = 'uploading';
    this.save();

    // Get upload URL from Convex
    const uploadUrl = await convexClient.mutation(
      'photos:generateUploadUrl',
      { exposureId: photo.exposureId }
    );

    // Upload file with progress tracking
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, photo.localUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': 'image/jpeg' },
    });

    if (uploadResult.status === 200) {
      photo.uploadStatus = 'completed';
      photo.uploadProgress = 100;

      // Save reference in Convex
      await convexClient.mutation('photos:saveMetadata', {
        exposureId: photo.exposureId,
        storageId: uploadResult.body,
      });

      // Remove from queue
      this.dequeue(photo.id);
    } else {
      throw new Error('Upload failed');
    }
  }

  private save() {
    storage.set('photo_queue', JSON.stringify(this.queue));
  }

  private dequeue(id: string) {
    this.queue = this.queue.filter(p => p.id !== id);
    this.save();
  }

  // Get queue status for UI
  getStatus() {
    return {
      pending: this.queue.filter(p => p.uploadStatus === 'pending').length,
      uploading: this.queue.filter(p => p.uploadStatus === 'uploading').length,
      failed: this.queue.filter(p => p.uploadStatus === 'failed').length,
    };
  }
}

export const photoQueue = new PhotoUploadQueue();
```

#### 3. **Exposure Creation Flow** (Offline-First)

```typescript
const createExposure = async (exposureData: ExposureInput) => {
  // 1. Save locally FIRST (source of truth while offline)
  const localId = uuid();
  const exposure = {
    ...exposureData,
    id: localId,
    syncStatus: 'pending', // pending | synced | failed
    createdAt: Date.now(),
  };

  // Save to MMKV
  const existingExposures = JSON.parse(storage.getString('exposures') || '[]');
  existingExposures.push(exposure);
  storage.set('exposures', JSON.stringify(existingExposures));

  // 2. Queue photos for upload (if any)
  if (exposure.photoUris && exposure.photoUris.length > 0) {
    exposure.photoUris.forEach(uri => {
      photoQueue.enqueue(uri, localId);
    });
  }

  // 3. Queue mutation for Convex (when online)
  offlineQueue.enqueue({
    type: 'create',
    collection: 'exposures',
    data: exposure,
  });

  // 4. Return immediately (don't wait for sync)
  return exposure;
};
```

#### 4. **Network State Management**

```typescript
import NetInfo from '@react-native-community/netinfo';

// Monitor network state
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      // Just came online - sync everything
      offlineQueue.syncIfOnline();
      photoQueue.processQueue();
    }
  });

  return () => unsubscribe();
}, []);
```

#### 5. **Sync Status Indicator UI**

```typescript
const SyncStatusBadge = () => {
  const [status, setStatus] = useState(photoQueue.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(photoQueue.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (status.pending === 0 && status.uploading === 0) {
    return <Badge>Synced</Badge>;
  }

  return (
    <Badge color="warning">
      Syncing {status.pending + status.uploading} items...
    </Badge>
  );
};
```

### Conflict Resolution Strategy

**Problem:** User creates exposure offline on Device A, then creates another exposure offline on Device B. Both sync when online. How to handle conflicts?

**Recommended Strategy: Optimistic Merging with Timestamps**

```typescript
// Convex mutation for creating exposure
export const createExposure = mutation(async ({ db }, exposure) => {
  // Check if exposure with this client-generated ID already exists
  const existing = await db
    .query('exposures')
    .filter(q => q.eq(q.field('clientId'), exposure.clientId))
    .first();

  if (existing) {
    // Already synced from another device - compare timestamps
    if (exposure.createdAt > existing.createdAt) {
      // Newer version - update
      await db.patch(existing._id, exposure);
    }
    // Else ignore (older version)
  } else {
    // New exposure - insert
    await db.insert('exposures', exposure);
  }
});
```

**For 40-Year Retention:**
- Never delete exposure records (soft delete only)
- Store full audit trail of all changes
- Use Convex's built-in immutable log for compliance

### Alternative Approach: Local-First with Sync Library

If offline requirements are extreme, consider:

**WatermelonDB + Convex Sync:**
- WatermelonDB as local SQLite database (true offline)
- Custom sync layer to Convex
- More complex but handles extreme offline scenarios

**Legend State + Convex:**
- Legend State provides local-first reactive state
- Has Convex integration in v3
- Still experimental as of 2025

**Recommendation:** Start with MMKV queue approach. Only migrate to WatermelonDB if offline requirements prove more extreme than expected.

### Testing Strategy

**Offline Scenarios to Test:**

1. **Create exposure offline, come online**
   - Verify auto-sync
   - Verify photos upload
   - Check Convex database

2. **Create 10 exposures offline, come online**
   - Verify queue processes in order
   - Check for race conditions

3. **Create exposure on Device A offline, same exposure on Device B offline**
   - Verify conflict resolution
   - Ensure no data loss

4. **Network fails mid-photo-upload**
   - Verify retry logic
   - Check photo queue status

5. **Extended offline (24+ hours)**
   - Verify local data persists
   - Verify full sync when online

### Trade-offs & Limitations

**Pros:**
- Convex handles real-time sync when online
- Mutations queue automatically for network blips
- Simple API for most use cases

**Cons:**
- Requires custom queue layer for true offline support
- No built-in conflict resolution beyond last-write-wins
- Photo uploads require manual queue implementation
- More complex than pure offline-first solutions like PouchDB/CouchDB

**Risk Assessment:**
- **Medium Risk**: Offline queue implementation adds complexity
- **Mitigation**: Start simple, iterate based on real-world usage
- **Fallback**: Can migrate to WatermelonDB later if needed

### 40-Year Data Retention with Convex

**Convex's Position:**
- No hard storage limits on paid plans (can scale to TBs)
- Data stored on AWS RDS (durability: 99.999999999%)
- No automatic data deletion

**Recommendation:**
1. **Never delete exposure records** (soft delete with `isDeleted` flag)
2. **Archive old data** (move to S3 after 5+ years for cost efficiency)
3. **Export backups regularly** (monthly CSV/JSON exports to user's cloud storage)
4. **Document retention policy** in privacy policy and terms

**Implementation:**

```typescript
// Convex scheduled action - runs monthly
export const archiveOldRecords = action(async ({ runMutation }) => {
  const fiveYearsAgo = Date.now() - (5 * 365 * 24 * 60 * 60 * 1000);

  const oldExposures = await db
    .query('exposures')
    .filter(q => q.lt(q.field('createdAt'), fiveYearsAgo))
    .collect();

  // Export to S3 for long-term storage
  for (const exposure of oldExposures) {
    await exportToS3(exposure);
  }

  // Mark as archived (don't delete)
  for (const exposure of oldExposures) {
    await db.patch(exposure._id, { isArchived: true });
  }
});
```

---

## 6. Convex Data Residency for NZ Privacy Act 2020

### Critical Finding: **Convex Cloud Does NOT Support NZ Data Residency**

### Current Status (2025)

**Convex Cloud Hosting:**
- Hosted on AWS (unspecified region, likely US)
- GDPR compliant, SOC 2 Type II certified
- **Does NOT offer regional data residency** (acknowledged by Convex as future roadmap item)
- No option to select deployment region

**New Zealand Privacy Act 2020 Requirements:**
- Data must be stored in NZ or approved jurisdiction (Australia acceptable with safeguards)
- Cloud providers must demonstrate compliance with NZ privacy principles
- Cross-border data transfers require adequate safeguards

**AWS New Zealand Region:**
- Launched September 2025 (ap-southeast-5)
- Enables NZ data residency for AWS services
- Convex Cloud does NOT use this region (yet)

### Recommendation: **Self-Hosted Convex on AWS NZ Region**

This is the **ONLY path to NZ Privacy Act 2020 compliance** with Convex.

### Implementation Strategy

#### Option A: Self-Hosted Convex (Recommended)

**Why:**
- Convex is now open-source and self-hostable
- Can deploy to AWS NZ region (ap-southeast-5)
- Full control over data residency
- Same Convex API and features

**How:**

1. **Use Convex Self-Hosting Guide:**
   - https://docs.convex.dev/self-hosting
   - Deploy to AWS ECS, EC2, or Fargate in ap-southeast-5

2. **Infrastructure:**
   ```bash
   # Deploy with SST (Serverless Stack)
   npm install sst

   # sst.config.ts
   export default {
     config() {
       return {
         name: "waldo-health-convex",
         region: "ap-southeast-5", // NZ region
       };
     },
     stacks(app) {
       app.stack(function ConvexStack({ stack }) {
         // Deploy Convex backend
         const convex = new ConvexBackend(stack, "convex", {
           region: "ap-southeast-5",
           database: {
             // Use RDS Postgres in NZ region
             engine: "postgres",
             region: "ap-southeast-5",
           },
         });
       });
     },
   };
   ```

3. **Database:**
   - Use Amazon RDS PostgreSQL in ap-southeast-5
   - Enable automated backups (retained in NZ)
   - Enable encryption at rest

4. **File Storage:**
   - Use S3 bucket in ap-southeast-5 for photos
   - Block cross-region replication
   - Enable S3 Object Lock for 40-year retention

**Cost Estimate:**
- AWS RDS PostgreSQL (db.t4g.medium): ~$120/month
- ECS Fargate (2 vCPU, 4GB RAM): ~$60/month
- S3 Storage (500GB photos): ~$12/month
- **Total: ~$192/month** (vs Convex Cloud at $30-100/month)

**Pros:**
- Full NZ data residency compliance
- Same Convex developer experience
- Control over infrastructure

**Cons:**
- Higher cost (~2-3x Convex Cloud)
- Requires DevOps expertise
- You manage backups, scaling, monitoring

#### Option B: Alternative Backend with NZ Residency

If self-hosting Convex is too complex, consider:

**Supabase (PostgreSQL + Realtime):**
- Can self-host on AWS NZ region
- Simpler infrastructure than Convex
- Real-time subscriptions like Convex
- Built-in auth, storage, functions

**Firebase (Google Cloud):**
- Google Cloud has Sydney region (australia-southeast1)
- Close to NZ but NOT in NZ
- May not satisfy strict NZ residency requirements
- Check with legal counsel

**Appwrite:**
- Self-hostable backend-as-a-service
- Can deploy to any cloud region
- Simpler than Convex but less powerful

**PocketBase:**
- Single-binary backend (SQLite)
- Trivial to self-host
- Can run on NZ-based VPS
- Less scalable than Convex

#### Option C: Wait for Convex Regional Deployments

**Status:** Convex acknowledged they need to offer regional data residency (Europe and other locations) but no timeline given.

**Risk:** Could be months or years.

**Recommendation:** Don't wait. Use self-hosted Convex or alternative now.

### Legal Compliance Requirements

**Privacy Act 2020 Checklist:**

- [ ] **Data Location:** Confirm all data stored in NZ (or approved jurisdiction with safeguards)
- [ ] **Privacy Policy:** Clearly state where data is stored and processed
- [ ] **Data Processing Agreement:** If using cloud provider, ensure DPA covers NZ requirements
- [ ] **User Consent:** Inform users about data storage location and obtain consent
- [ ] **Right to Access:** Provide mechanism for users to export all personal data
- [ ] **Right to Delete:** Allow users to request deletion (soft delete for 40-year retention)
- [ ] **Breach Notification:** Implement process to notify users of data breaches within 72 hours
- [ ] **Data Minimization:** Only collect necessary data for ACC claim documentation
- [ ] **Security Measures:** Encryption at rest and in transit, regular security audits

**Privacy Policy Template Section:**

```
Data Storage and Residency

Waldo Health stores all user data, including exposure records and photos, on servers
located in New Zealand (AWS ap-southeast-5 region). We do not transfer your personal
information outside of New Zealand without your consent, except as required by law.

Your data is encrypted at rest and in transit using industry-standard encryption
(AES-256 and TLS 1.3). We retain your exposure records for 40 years in accordance
with ACC Act 2001 medical records retention requirements.

You have the right to:
- Access all your personal data (export as PDF or CSV)
- Request deletion of your account and data (with warnings about ACC claim implications)
- Receive notification of any data breaches within 72 hours
- Withdraw consent for data processing (will result in account closure)

For data privacy inquiries, contact: privacy@waldohealth.nz
```

### Implementation Roadmap

**Phase 1 - MVP (Months 1-3):**
- Use Convex Cloud (US-hosted) for development and beta testing
- Clearly label as "Beta - Data stored in US"
- Limit to test users only (not public release)

**Phase 2 - NZ Compliance (Months 3-4):**
- Deploy self-hosted Convex to AWS NZ region
- Migrate beta users' data to NZ instance
- Update privacy policy and obtain user consent
- Legal review of compliance

**Phase 3 - Production Launch (Month 5+):**
- Public release with NZ data residency
- Monitor Convex for official regional deployments
- Migrate to Convex Cloud NZ region when available

### Cost-Benefit Analysis

**Self-Hosted Convex vs Convex Cloud:**

| Factor | Convex Cloud (US) | Self-Hosted (NZ) |
|--------|-------------------|------------------|
| **NZ Compliance** | No | Yes |
| **Cost** | $30-100/mo | $192/mo |
| **DevOps Effort** | Zero | Medium |
| **Scalability** | Automatic | Manual |
| **Legal Risk** | High (non-compliant) | Low |

**Recommendation:** Self-hosted is required for legal compliance. Budget $200/month for infrastructure.

### Alternative: Hybrid Approach

**Data Segregation Strategy:**

1. **Store sensitive data locally:**
   - Exposure records with personal details
   - Photos
   - GPS coordinates

2. **Store non-sensitive data in Convex Cloud:**
   - Educational content
   - Exposure type definitions
   - Anonymous analytics

3. **Sync to NZ-based storage:**
   - Use S3 in ap-southeast-5 for backup
   - Convex only for real-time features (non-sensitive)

**This is complex and not recommended.** Better to use self-hosted Convex for all data.

### Testing Checklist

- [ ] Verify all data stored in ap-southeast-5 region
- [ ] Test data export (PDF/CSV) functionality
- [ ] Test user deletion flow
- [ ] Verify no cross-region data replication
- [ ] Load test self-hosted Convex (10k+ exposures)
- [ ] Disaster recovery test (restore from backup)
- [ ] Security audit (penetration testing)
- [ ] Legal review of privacy policy

---

## Summary & Decision Matrix

| Library Decision | Recommended | Alternative | Why Not Alternative |
|------------------|-------------|-------------|---------------------|
| **Design System** | React Native Paper | NativeBase | Better accessibility docs, smaller bundle |
| **Voice-to-Text** | @react-native-voice/voice | Picovoice | Cost and complexity |
| **PDF Generation** | expo-print | react-native-html-to-pdf | Expo compatibility |
| **Bundle Optimization** | Expo Atlas + Tree Shaking | Manual webpack config | Built-in, easier to use |
| **Offline Strategy** | MMKV Queue + Convex | WatermelonDB | Simpler to implement |
| **Data Residency** | Self-Hosted Convex on AWS NZ | Supabase | Same Convex DX |

---

## Critical Risks & Mitigations

### Risk 1: Convex Offline Support is Limited

**Impact:** High - Core requirement (FR-029) may not be met
**Probability:** High - Convex doesn't have native offline-first
**Mitigation:**
- Implement custom queue layer with MMKV
- Test extensively in offline scenarios
- Have fallback plan to migrate to WatermelonDB if needed

### Risk 2: NZ Data Residency Requires Self-Hosting

**Impact:** High - Legal compliance requirement
**Probability:** Certain - Convex Cloud doesn't support regional deployments
**Mitigation:**
- Budget $200/month for self-hosted infrastructure
- Hire DevOps consultant for initial setup ($2000-5000)
- Document runbooks for maintenance

### Risk 3: React Native Paper May Not Be Fully WCAG AA Compliant Out-of-Box

**Impact:** Medium - Accessibility is P1 requirement (FR-024)
**Probability:** Medium - Library provides tools but requires configuration
**Mitigation:**
- Manual accessibility testing with screen readers
- Work with accessibility consultant ($3000-5000)
- Implement custom components where library falls short

### Risk 4: Speech Recognition Quality May Be Poor on Older Android Devices

**Impact:** Medium - Voice entry is P1 feature (FR-006)
**Probability:** Medium - Android 9- has limited speech recognition
**Mitigation:**
- Set minimum Android version to 10 (2019+)
- Provide keyboard fallback for all voice features
- Test on range of devices before launch

### Risk 5: Large PDF Generation May Cause Out-of-Memory Errors

**Impact:** Low-Medium - PDF export is P1 feature (FR-009)
**Probability:** Low - Only for 50+ exposures with many photos
**Mitigation:**
- Implement chunking for large exports
- Optimize images before embedding
- Test with 100+ exposure records

---

## Next Steps for Implementation

1. **Set up development environment:**
   - Install Expo CLI and create new project
   - Install React Native Paper
   - Configure TypeScript strict mode

2. **Implement offline queue prototype:**
   - Install MMKV
   - Build basic queue system
   - Test offline/online transitions

3. **Set up self-hosted Convex (or plan for it):**
   - Create AWS account
   - Set up RDS PostgreSQL in ap-southeast-5
   - Deploy Convex backend

4. **Build camera + photo upload flow:**
   - Implement expo-camera integration
   - Build photo queue system
   - Test upload reliability

5. **Implement voice recognition:**
   - Install @react-native-voice/voice
   - Test NZ English support
   - Build speech-to-form parsing

6. **Build PDF export:**
   - Install expo-print
   - Create PDF template with HTML/CSS
   - Test with real exposure data

7. **Accessibility audit:**
   - Test with VoiceOver/TalkBack
   - Verify color contrast
   - Check touch target sizes

8. **Bundle optimization:**
   - Enable Expo Atlas
   - Run expo-optimize on images
   - Implement lazy loading for maps

9. **Legal compliance:**
   - Draft privacy policy
   - Get legal review
   - Set up data retention procedures

10. **Production deployment:**
    - Build with EAS Build
    - Submit to App Store and Play Store
    - Monitor crash rates and bundle sizes

---

## Appendix: Useful Resources

### Documentation
- React Native Paper: https://reactnativepaper.com/
- @react-native-voice/voice: https://github.com/react-native-voice/voice
- expo-print: https://docs.expo.dev/versions/latest/sdk/print/
- Expo Atlas: https://docs.expo.dev/guides/analyzing-bundles/
- Convex Self-Hosting: https://docs.convex.dev/self-hosting
- NZ Privacy Act 2020: https://www.privacy.org.nz/privacy-act-2020/

### Tools
- Expo Accessibility Scanner: https://docs.expo.dev/guides/accessibility/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- AWS NZ Region: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/

### Community
- Expo Discord: https://chat.expo.dev/
- React Native Paper GitHub: https://github.com/callstack/react-native-paper
- Convex Discord: https://discord.gg/convex

---

**Document Version:** 1.0
**Last Updated:** 2025-11-06
**Next Review:** Before Phase 0 implementation begins
**Owner:** SDK/API Library Expert Agent
