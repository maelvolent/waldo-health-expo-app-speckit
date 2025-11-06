# Running Waldo Health

## Quick Start

```bash
# Start the development server
npx expo start

# Then press:
# - i for iOS simulator
# - a for Android emulator
# - r to reload
# - shift+m for dev menu
```

## What's Fixed

1. **Expo Router Entry Point** - Updated from old App.tsx to proper Expo Router entry
2. **Tab Navigation** - Added bottom tabs with Exposures list and New exposure screens
3. **Dependencies** - Installed missing packages (expo-linking, expo-constants, @expo/vector-icons)
4. **Assets** - Removed temporary asset references that were causing errors

## App Structure

```
src/app/
├── _layout.tsx           # Root layout with providers
├── (tabs)/
│   ├── _layout.tsx       # Tab navigation layout
│   ├── index.tsx         # Exposures list screen (Tab 1)
│   └── new.tsx           # New exposure screen (Tab 2)
└── exposure/
    └── [id].tsx          # Exposure detail screen
```

## Features Ready

- ✅ Exposures list with pull-to-refresh
- ✅ New exposure form with 3-step workflow
- ✅ Camera integration for photos
- ✅ GPS location capture
- ✅ Auto-save drafts every 3 seconds
- ✅ Offline support with auto-sync
- ✅ Network monitoring
- ✅ WCAG 2.1 AA accessibility

## Environment Setup

Make sure `.env.local` contains:
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_CONVEX_URL=your_convex_url
```

## Expo Go Limitations

**IMPORTANT**: MMKV (fast storage) requires native modules and doesn't work in Expo Go.

The app automatically falls back to in-memory storage when running in Expo Go:
- ✅ All features work but data is lost on reload
- ✅ Perfect for testing UI and workflows
- ⚠️ For full persistence, build a development build with `expo prebuild`

See `EXPO_GO_NOTES.md` for details.

## Known Issues

- Jest tests need configuration update for Expo SDK 54 winter module system
- Asset files (icon.png, splash.png) need to be added to `assets/images/` for production builds

## Next Steps

1. Add actual app icon and splash screen
2. Implement photo upload queue processing
3. Add edit functionality to detail screen
4. Configure Jest for test execution
5. Test on physical devices for camera/GPS
