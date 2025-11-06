# Waldo Health - Quick Start Guide

**Last Updated**: 2025-11-06
**Stack**: Expo SDK + React Native + Convex + Clerk
**Target**: iOS 15+, Android 10+

---

## Prerequisites

- **Node.js**: 18.x or later (LTS recommended)
- **npm**: 9.x or later (or yarn/pnpm)
- **Expo CLI**: Latest version
- **iOS Development** (Mac only):
  - Xcode 15+ with iOS 15+ simulator
  - CocoaPods installed
- **Android Development**:
  - Android Studio with SDK 33 (Android 13)
  - Android Emulator or physical device
- **Git**: For version control

**Optional but Recommended**:
- **VS Code**: With Expo Tools extension
- **Expo Go app**: For quick testing (iOS/Android)

---

## Project Setup

### 1. Create Expo Project

```bash
# Create new Expo project with latest SDK
npx create-expo-app@latest waldo-health --template blank-typescript

cd waldo-health
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install convex @clerk/clerk-expo react-native-paper react-native-mmkv

# Expo SDK modules
npx expo install expo-camera expo-location expo-print expo-image-manipulator expo-file-system expo-sharing expo-av expo-font react-native-maps

# Voice recognition
npm install @react-native-voice/voice

# Utilities
npm install react-native-uuid @react-native-community/netinfo date-fns

# Development dependencies
npm install --save-dev @types/react @types/react-native eslint prettier jest @testing-library/react-native @testing-library/jest-native detox
```

### 3. Project Structure

```bash
# Create directory structure
mkdir -p src/{app,components,convex,hooks,lib,constants,types}
mkdir -p src/components/{exposure,common,layout}
mkdir -p src/app/{tabs,exposure}
mkdir -p __tests__/{unit,integration,contract}
mkdir -p assets/{images,fonts,exposure-icons}
```

### 4. Configure TypeScript

**tsconfig.json**:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lib/*": ["src/lib/*"],
      "@constants/*": ["src/constants/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. Configure ESLint & Prettier

**.eslintrc.js**:
```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

**.prettierrc**:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}
```

---

## Backend Setup

### 1. Initialize Convex

```bash
# Install Convex CLI globally
npm install -g convex

# Initialize Convex project
npx convex dev

# This will:
# - Create convex/ directory
# - Generate convex.json config
# - Prompt for project name and deployment
```

### 2. Configure Convex Schema

**src/convex/schema.ts**: (See data-model.md for complete schema)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    // ... see data-model.md for full schema
  }).index("by_clerkId", ["clerkId"]),

  exposures: defineTable({
    userId: v.id("users"),
    clientId: v.string(),
    timestamp: v.number(),
    exposureType: v.string(),
    // ... see data-model.md for full schema
  })
    .index("by_userId", ["userId"])
    .index("by_clientId", ["clientId"]),

  photos: defineTable({
    // ... see data-model.md for full schema
  }),

  // ... other tables
});
```

### 3. Deploy Convex Functions

```bash
# Push schema to Convex
npx convex dev

# This starts dev server and watches for changes
# Keep this running during development
```

**For Production (NZ Data Residency)**:

See research.md for self-hosting Convex on AWS NZ region. For MVP development, use Convex Cloud (US-hosted).

---

## Authentication Setup

### 1. Create Clerk Account

1. Go to https://clerk.com
2. Create new application
3. Enable Email/Password and Google OAuth providers
4. Note your **Publishable Key** and **Secret Key**

### 2. Configure Clerk in Expo

**app.json**:
```json
{
  "expo": {
    "name": "Waldo Health",
    "slug": "waldo-health",
    "version": "1.0.0",
    "scheme": "waldohealth",
    "extra": {
      "clerkPublishableKey": "pk_test_..."
    },
    "plugins": [
      "@clerk/clerk-expo"
    ]
  }
}
```

**.env** (create at project root):
```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOYMENT=...
```

### 3. Configure Clerk in Convex

**src/convex/auth.config.ts**:
```typescript
export default {
  providers: [
    {
      domain: "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

### 4. Wrap App with Clerk Provider

**src/app/_layout.tsx**:
```typescript
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Your app screens */}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

---

## App Configuration

### 1. Configure Expo App

**app.json** (complete):
```json
{
  "expo": {
    "name": "Waldo Health",
    "slug": "waldo-health",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "waldohealth",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1976D2"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.waldohealth.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Waldo Health needs camera access to capture photos of workplace exposures for ACC documentation.",
        "NSPhotoLibraryUsageDescription": "Waldo Health needs photo library access to attach existing photos to exposure records.",
        "NSLocationWhenInUseUsageDescription": "Waldo Health needs your location to automatically record where exposures occurred.",
        "NSMicrophoneUsageDescription": "Waldo Health needs microphone access for hands-free voice entry when documenting exposures.",
        "NSSpeechRecognitionUsageDescription": "Waldo Health uses speech recognition to convert your voice descriptions into exposure records."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1976D2"
      },
      "package": "com.waldohealth.app",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Waldo Health to access your camera to document workplace exposures."
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Allow Waldo Health to use your location to record where exposures occurred."
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Allow Waldo Health to use your microphone for voice entry."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### 2. Configure React Native Paper Theme

**src/constants/theme.ts**:
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',      // WCAG AA compliant on white
    secondary: '#FFA726',
    error: '#D32F2F',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',         // 16:1 contrast on white
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64B5F6',
    secondary: '#FFB74D',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
  },
};
```

**src/app/_layout.tsx** (add theme provider):
```typescript
import { PaperProvider } from 'react-native-paper';
import { lightTheme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={lightTheme}>
      {/* Clerk and Convex providers */}
    </PaperProvider>
  );
}
```

### 3. Configure Exposure Types Constants

**src/constants/exposureTypes.ts**:
```typescript
export const EXPOSURE_TYPES = [
  { id: 'silica_dust', label: 'Silica Dust', icon: 'cloud', color: '#8D6E63' },
  { id: 'asbestos_a', label: 'Asbestos A (Friable)', icon: 'alert', color: '#D32F2F' },
  { id: 'asbestos_b', label: 'Asbestos B (Non-Friable)', icon: 'alert-outline', color: '#F57C00' },
  { id: 'hazardous_chemicals', label: 'Hazardous Chemicals', icon: 'flask', color: '#7B1FA2' },
  { id: 'noise', label: 'Noise Exposure', icon: 'volume-high', color: '#0288D1' },
  { id: 'meth', label: 'Meth Contamination', icon: 'biohazard', color: '#C62828' },
  { id: 'mould', label: 'Mould & Fungal', icon: 'bacteria', color: '#388E3C' },
  { id: 'contaminated_soils', label: 'Contaminated Soils', icon: 'terrain', color: '#5D4037' },
  { id: 'heat_stress', label: 'Heat Stress', icon: 'fire', color: '#E64A19' },
  { id: 'welding_fumes', label: 'Welding Fumes', icon: 'weather-lightning', color: '#455A64' },
  { id: 'biological_hazards', label: 'Biological Hazards', icon: 'bug', color: '#689F38' },
  { id: 'radiation', label: 'Radiation & UV', icon: 'radioactive', color: '#FBC02D' },
] as const;

export const PPE_TYPES = [
  { id: 'respirator', label: 'Respirator/Mask' },
  { id: 'gloves', label: 'Protective Gloves' },
  { id: 'safety_glasses', label: 'Safety Glasses' },
  { id: 'hearing_protection', label: 'Hearing Protection' },
  { id: 'coveralls', label: 'Coveralls' },
  { id: 'hard_hat', label: 'Hard Hat' },
  { id: 'safety_boots', label: 'Safety Boots' },
  { id: 'none', label: 'No PPE Used' },
] as const;
```

---

## Running the App

### Development Mode

```bash
# Start Convex dev server (in separate terminal)
npx convex dev

# Start Expo dev server
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app for physical device
```

### iOS (Mac only)

```bash
# Install pods
cd ios && pod install && cd ..

# Run on simulator
npx expo run:ios

# Run on specific device
npx expo run:ios --device
```

### Android

```bash
# Run on emulator
npx expo run:android

# Run on physical device
npx expo run:android --device
```

---

## Testing Setup

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

**jest.config.js**:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

### E2E Tests (Detox)

```bash
# Build app for testing
detox build --configuration ios.sim.debug

# Run E2E tests
detox test --configuration ios.sim.debug
```

**.detoxrc.json**:
```json
{
  "testRunner": "jest",
  "runnerConfig": "__tests__/integration/config.json",
  "apps": {
    "ios.debug": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/WaldoHealth.app"
    },
    "android.debug": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk"
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 15"
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_7_API_33"
      }
    }
  },
  "configurations": {
    "ios.sim.debug": {
      "device": "simulator",
      "app": "ios.debug"
    },
    "android.emu.debug": {
      "device": "emulator",
      "app": "android.debug"
    }
  }
}
```

---

## Building for Production

### EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure
```

**eas.json**:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_live_...",
        "EXPO_PUBLIC_CONVEX_URL": "https://your-production-convex.convex.cloud"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Build Commands

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

---

## Environment Variables

Create `.env.local` (gitignored):

```bash
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Sentry (optional)
SENTRY_DSN=https://...@sentry.io/...

# Google Maps (for static maps in PDFs)
GOOGLE_MAPS_API_KEY=AIza...
```

---

## Common Issues & Solutions

### Issue: "Expo Go app doesn't support expo-camera"

**Solution**: Use development build or EAS Build:
```bash
npx expo install expo-dev-client
eas build --profile development --platform ios
```

### Issue: "Cannot find module 'react-native-paper'"

**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

### Issue: "Convex connection failed"

**Solution**: Ensure Convex dev server is running and URL is correct in `.env`:
```bash
npx convex dev
```

### Issue: "Speech recognition not working on Android"

**Solution**: Ensure NZ English language pack installed, or use fallback:
```typescript
Voice.start('en-AU'); // Fallback to Australian English
```

---

## Next Steps

1. **Implement P1 Features** (MVP):
   - Exposure documentation (camera + form)
   - GPS location capture
   - Photo storage and sync
   - PDF export

2. **Add Authentication**:
   - Sign up/login screens
   - User profile
   - Clerk integration

3. **Implement Offline Queue**:
   - MMKV storage setup
   - Mutation queue
   - Photo upload queue

4. **Testing**:
   - Unit tests for components
   - Integration tests for user flows
   - E2E tests with Detox

5. **Deploy**:
   - Self-host Convex on AWS NZ
   - Build with EAS
   - Submit to app stores

---

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **Convex Docs**: https://docs.convex.dev/
- **Clerk Docs**: https://clerk.com/docs/quickstarts/expo
- **React Native Paper**: https://reactnativepaper.com/
- **Project Architecture**: See plan.md
- **Data Model**: See data-model.md
- **API Contracts**: See contracts/

---

**Guide Version**: 1.0
**Last Updated**: 2025-11-06
**Ready to Code**: ✅
