# Waldo Health - Setup Guide

This guide will help you complete the manual setup steps required before running the app.

## Prerequisites

- Node.js 18+ and npm installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator
- Git installed

## Automated Setup Complete ✅

The following have already been configured:

- ✅ Expo project with TypeScript
- ✅ All dependencies installed
- ✅ ESLint and Prettier configured
- ✅ Jest and Detox testing frameworks
- ✅ Project directory structure
- ✅ Convex schema defined
- ✅ Theme and constants configured
- ✅ Offline queue infrastructure
- ✅ Type definitions
- ✅ Validation utilities

## Manual Setup Required

### 1. Clerk Authentication Setup

Clerk provides authentication for the app. You need to create an account and get API keys.

#### Steps:

1. **Create Clerk Account**
   - Go to https://dashboard.clerk.com/
   - Sign up for a free account
   - Create a new application named "Waldo Health"

2. **Configure Application**
   - In the Clerk dashboard, go to **API Keys**
   - Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Get your **Frontend API URL** from the same page

3. **Update Environment Variables**
   - Open `.env.local` in the project root
   - Replace `YOUR_KEY_HERE` with your actual Clerk Publishable Key:
     ```
     EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
     ```

4. **Update Convex Auth Config**
   - Open `convex/auth.config.ts`
   - Replace the domain URL with your Clerk Frontend API URL:
     ```typescript
     domain: 'https://your-actual-clerk-domain.clerk.accounts.dev'
     ```

5. **Enable Social Providers (Optional)**
   - In Clerk dashboard, go to **User & Authentication > Social Connections**
   - Enable Google and/or Apple sign-in if desired
   - Configure OAuth redirect URLs for Expo

#### Clerk Documentation:
- React Native Setup: https://clerk.com/docs/quickstarts/react-native/expo
- Authentication Flows: https://clerk.com/docs/authentication/overview

---

### 2. Convex Backend Setup

Convex is the real-time backend database. You need to initialize it and deploy your schema.

#### Steps:

1. **Create Convex Account**
   - Go to https://dashboard.convex.dev/
   - Sign up for a free account (includes 500k function calls/month)

2. **Initialize Convex Project**
   Run this command in your project directory:
   ```bash
   npx convex dev
   ```

   This will:
   - Prompt you to log in to Convex
   - Create a new project (or link to existing one)
   - Deploy your schema from `convex/schema.ts`
   - Generate authentication files
   - Start the development server

3. **Important: Select AWS Sydney Region**
   When creating your Convex project:
   - Choose **AWS Sydney (ap-southeast-2)** region
   - This ensures NZ Privacy Act 2020 compliance (data stays in NZ/Australia)

4. **Update Environment Variables**
   After `npx convex dev` completes:
   - It will display your deployment URL
   - Open `.env.local` and update:
     ```
     CONVEX_DEPLOYMENT=your-deployment-name
     EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
     ```

5. **Configure Clerk Integration**
   In Convex dashboard:
   - Go to **Settings > Authentication**
   - Click **Add Authentication Provider**
   - Select **Clerk**
   - Paste your Clerk JWT Issuer URL
   - Save configuration

#### Convex Documentation:
- Getting Started: https://docs.convex.dev/get-started
- React Native Setup: https://docs.convex.dev/client/react-native
- Clerk Integration: https://docs.convex.dev/auth/clerk

---

### 3. Sentry Error Tracking (Optional, for Production)

Sentry provides error monitoring and crash reporting.

#### Steps:

1. **Create Sentry Account**
   - Go to https://sentry.io/signup/
   - Sign up for free account (5k errors/month free)

2. **Create New Project**
   - Select **React Native** as platform
   - Name it "waldo-health"
   - Copy the DSN provided

3. **Update Environment Variables**
   - Open `.env.local`
   - Update Sentry configuration:
     ```
     SENTRY_DSN=https://YOUR_SENTRY_DSN_HERE@o123456.ingest.sentry.io/123456
     SENTRY_ORG=your-org-name
     SENTRY_PROJECT=waldo-health
     ```

4. **Skip for Development**
   - Sentry is optional during development
   - You can leave the default values and it will simply log warnings

#### Sentry Documentation:
- React Native Setup: https://docs.sentry.io/platforms/react-native/

---

### 4. iOS Simulator Setup (Mac Only)

#### Steps:

1. **Install Xcode**
   - Download from Mac App Store (large download, ~10GB)
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Install iOS Dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Verify Simulator**
   ```bash
   open -a Simulator
   ```

---

### 5. Android Emulator Setup

#### Steps:

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install with default settings

2. **Install Android SDK**
   - Open Android Studio
   - Go to **Settings > Appearance & Behavior > System Settings > Android SDK**
   - Install SDK Platform 33 (Android 13)

3. **Create AVD (Android Virtual Device)**
   - In Android Studio, go to **Tools > Device Manager**
   - Click **Create Device**
   - Select **Pixel 7**
   - Select system image: **API 33 (Android 13)**
   - Name it: `Pixel_7_API_33`
   - Click Finish

4. **Set Environment Variables**
   Add to your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

5. **Verify Emulator**
   ```bash
   emulator -list-avds  # Should show Pixel_7_API_33
   ```

---

## Verify Setup

After completing the manual steps above, verify everything works:

### 1. Check Environment Variables

```bash
cat .env.local
```

Ensure all keys are filled in (except Sentry if skipping).

### 2. Start Convex Dev Server

```bash
npx convex dev
```

Should show "Convex functions ready" with no errors.

### 3. Run Tests

```bash
npm test
```

All tests should pass (may have 0 tests initially, which is fine).

### 4. Start Expo Dev Server

```bash
npx expo start
```

You should see a QR code and options to open on iOS/Android.

### 5. Run on iOS Simulator (Mac)

Press `i` in the Expo terminal, or:

```bash
npx expo start --ios
```

### 6. Run on Android Emulator

Press `a` in the Expo terminal, or:

```bash
npx expo start --android
```

---

## Troubleshooting

### "Cannot connect to Convex"
- Ensure `npx convex dev` is running in a separate terminal
- Check `.env.local` has correct `EXPO_PUBLIC_CONVEX_URL`
- Verify network connection

### "Clerk authentication failed"
- Check `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`
- Verify key starts with `pk_test_` or `pk_live_`
- Ensure Clerk app is active in dashboard

### "Metro bundler errors"
- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`

### "iOS build fails"
- Clean build: `cd ios && rm -rf build && pod install && cd ..`
- Restart Xcode and Simulator

### "Android build fails"
- Clean Gradle cache: `cd android && ./gradlew clean && cd ..`
- Restart Android Studio and Emulator

### "Tests failing"
- Ensure you're using Node 18+: `node -v`
- Clear Jest cache: `npm test -- --clearCache`

---

## Next Steps

Once setup is complete, you can:

1. **Explore the app structure** in `src/`
2. **Run the test suite** with `npm test`
3. **Start implementing features** from `specs/001-waldo-health/tasks.md`
4. **Review the constitution** in `.specify/memory/constitution.md`

---

## Data Residency Compliance

**Important for NZ Privacy Act 2020:**

- ✅ Convex must be deployed to **AWS Sydney (ap-southeast-2)**
- ✅ Clerk data stays in Australia/NZ region (configured in dashboard)
- ✅ Photos stored in Convex file storage (AWS Sydney)
- ✅ All personal data encrypted at rest and in transit

Verify in dashboards:
- Convex: Settings > Deployment Info > Region should show "ap-southeast-2"
- Clerk: Settings > Regional Settings > should show "Australia"

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in the Expo terminal
3. Check Convex logs at https://dashboard.convex.dev/
4. Check Clerk logs at https://dashboard.clerk.com/

For framework-specific issues:
- Expo: https://docs.expo.dev/
- Convex: https://docs.convex.dev/
- Clerk: https://clerk.com/docs/

---

## Development Workflow

Once setup is complete, typical development workflow:

1. **Start services** (in separate terminals):
   ```bash
   # Terminal 1: Convex backend
   npx convex dev

   # Terminal 2: Expo dev server
   npx expo start
   ```

2. **Make code changes** in `src/`

3. **See live reload** on simulator/emulator

4. **Run tests** frequently:
   ```bash
   npm test
   ```

5. **Commit changes** with descriptive messages

6. **Follow TDD workflow** per constitution:
   - Write test first
   - Implement feature
   - Refactor if needed

---

## Production Deployment

Not required yet, but when ready:

1. **Build for Production**
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android
   ```

2. **Deploy Convex to Production**
   ```bash
   npx convex deploy --prod
   ```

3. **Switch to Production Clerk Keys**
   - Use `pk_live_` keys instead of `pk_test_`
   - Update `.env.local` with production keys

4. **Enable Sentry in Production**
   - Set `NODE_ENV=production`
   - Configure Sentry DSN for production project

---

**Setup Complete!** 🎉

You're now ready to start developing the Waldo Health app.
