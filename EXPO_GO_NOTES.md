# Expo Go Testing Notes

## Storage Fallback

The app now uses an in-memory storage fallback for Expo Go since MMKV requires native modules.

### What Works in Expo Go:
- ✅ All UI components and navigation
- ✅ Convex backend integration
- ✅ Clerk authentication
- ✅ Camera and location (with permissions)
- ✅ Form validation
- ✅ Network monitoring

### What Uses In-Memory Storage in Expo Go:
- ⚠️ Draft auto-save (lost on app reload in Expo Go)
- ⚠️ Offline queue (lost on app reload in Expo Go)
- ⚠️ User preferences (lost on app reload in Expo Go)

### For Production (Native Build):
The app will automatically use MMKV when built as a native app:
```bash
# Create development build
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

## Current Status

All dependencies installed:
- ✅ Expo Router + navigation deps
- ✅ Clerk authentication + all OAuth deps
- ✅ MMKV (with Expo Go fallback)
- ✅ Camera, Location, Maps
- ✅ Convex backend client

## Testing in Expo Go

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Scan QR code with Expo Go app

3. Test features:
   - Navigate between tabs
   - Create new exposure (photos optional in simulator)
   - View exposure list
   - Test offline mode (airplane mode)

**Note**: Data persistence will not work in Expo Go but all features are testable.

## Build for Production

When ready for production testing:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Create development build for testing
eas build --profile development --platform ios
eas build --profile development --platform android

# Or create production build
eas build --profile production --platform all
```

This will create a native build with full MMKV support and data persistence.
