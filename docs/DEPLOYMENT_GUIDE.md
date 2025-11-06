# Deployment Guide

**Waldo Health - Production Deployment**
**Platform:** iOS & Android via Expo Application Services (EAS)
**Date:** November 7, 2025
**Version:** 1.0

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Backend Deployment (Convex)](#backend-deployment-convex)
- [iOS Deployment](#ios-deployment)
- [Android Deployment](#android-deployment)
- [Post-Deployment](#post-deployment)
- [Continuous Deployment (CI/CD)](#continuous-deployment-cicd)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring & Alerts](#monitoring--alerts)
- [Troubleshooting](#troubleshooting)

---

## Overview

Waldo Health uses a modern deployment stack:

- **Frontend:** React Native via Expo SDK 54
- **Backend:** Convex serverless functions
- **Authentication:** Clerk
- **AI Services:** OpenAI GPT-4 Vision
- **Mobile Distribution:** Apple App Store & Google Play Store
- **Build System:** Expo Application Services (EAS)

### Deployment Flow

```
Local Development
       ↓
  Git Commit
       ↓
   EAS Build
       ↓
  Store Review
       ↓
  Production Release
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log statements in production code
- [ ] All TODOs resolved or documented

### Performance

- [ ] Performance benchmarks met (see `PERFORMANCE_BASELINE.md`)
- [ ] Low-end device testing complete (T120)
- [ ] Memory usage < 200MB
- [ ] App startup time < 3 seconds
- [ ] Bundle size < 20MB

### Accessibility

- [ ] WCAG 2.1 AA compliance verified (see `ACCESSIBILITY_AUDIT.md`)
- [ ] VoiceOver tested (iOS)
- [ ] TalkBack tested (Android)
- [ ] Color contrast ratios verified
- [ ] Touch targets >= 44x44

### Security

- [ ] No sensitive data in code or config
- [ ] API keys stored in environment variables
- [ ] HTTPS for all API calls
- [ ] Clerk authentication configured
- [ ] Data encryption at rest enabled

### Legal & Compliance

- [ ] Privacy policy finalized
- [ ] Terms of service finalized
- [ ] GDPR compliance verified
- [ ] ACC claim compatibility verified (NZ)
- [ ] WorkSafe NZ guidelines followed

### App Store Assets

- [ ] App icon (1024x1024 PNG)
- [ ] Screenshots (all required sizes)
- [ ] App preview video (optional)
- [ ] App description written
- [ ] Keywords optimized
- [ ] Support URL configured
- [ ] Marketing URL configured

---

## Environment Setup

### Required Accounts

1. **Expo Account**
   - Sign up at [expo.dev](https://expo.dev/)
   - Create organization (optional for teams)
   - Install EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

2. **Apple Developer Account**
   - Cost: $99 USD/year
   - Sign up at [developer.apple.com](https://developer.apple.com/)
   - Enroll in Apple Developer Program
   - Create App ID: `com.waldohealth.app`

3. **Google Play Console**
   - Cost: $25 USD one-time
   - Sign up at [play.google.com/console](https://play.google.com/console)
   - Create application
   - Configure app details

4. **Convex Account**
   - Sign up at [convex.dev](https://www.convex.dev/)
   - Create production deployment
   - Configure environment variables

5. **Clerk Account**
   - Sign up at [clerk.com](https://clerk.com/)
   - Create production instance
   - Configure authentication methods

6. **OpenAI Account**
   - Sign up at [platform.openai.com](https://platform.openai.com/)
   - Create API key with GPT-4 Vision access
   - Set up billing

7. **Firebase Account (Optional)**
   - Sign up at [firebase.google.com](https://firebase.google.com/)
   - Create project for performance monitoring

8. **Sentry Account (Optional)**
   - Sign up at [sentry.io](https://sentry.io/)
   - Create project for error tracking

### Environment Variables

Create `.env.production` file (NEVER commit this):

```env
# Convex Backend
EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# OpenAI API (for AI hazard detection)
OPENAI_API_KEY=sk-...

# Sentry (Error Monitoring)
SENTRY_DSN=https://...@sentry.io/...

# Firebase (Performance Monitoring)
# Add GoogleService-Info.plist (iOS)
# Add google-services.json (Android)

# App Configuration
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_TIMEOUT=10000
```

---

## Backend Deployment (Convex)

### 1. Deploy Convex Functions

```bash
# Navigate to project root
cd /path/to/waldo-health

# Install Convex CLI
npm install -g convex

# Login to Convex
npx convex login

# Deploy to production
npx convex deploy --prod

# Verify deployment
npx convex dashboard
```

### 2. Configure Convex Environment Variables

In Convex dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add production variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `CLERK_WEBHOOK_SECRET` - Webhook secret from Clerk
   - `NODE_ENV` - Set to `production`

### 3. Set Up Clerk Webhooks

1. In Clerk dashboard, go to **Webhooks**
2. Create webhook endpoint:
   - URL: `https://your-project.convex.site/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`
3. Copy webhook signing secret to Convex environment

### 4. Initialize Database

```bash
# Seed initial data (if needed)
npx convex run educationalContent:seedEducationalContent

# Verify schema
npx convex dashboard
# Check "Schema" tab to ensure all tables exist
```

---

## iOS Deployment

### 1. Configure EAS Build

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
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
      "ios": {
        "bundleIdentifier": "com.waldohealth.app"
      },
      "android": {
        "buildType": "apk"
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
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 2. Configure iOS App

Update `app.json`:

```json
{
  "expo": {
    "name": "Waldo Health",
    "slug": "waldo-health",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.waldohealth.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Waldo Health needs access to your camera to capture exposure site photos.",
        "NSPhotoLibraryUsageDescription": "Waldo Health needs access to your photo library to select exposure photos.",
        "NSLocationWhenInUseUsageDescription": "Waldo Health needs your location to record where exposures occurred.",
        "NSMicrophoneUsageDescription": "Waldo Health needs access to your microphone for voice note entry."
      },
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Create Provisioning Profile

```bash
# EAS will handle this automatically
# Or manually in Apple Developer Portal:
# 1. Go to Certificates, Identifiers & Profiles
# 2. Create App ID: com.waldohealth.app
# 3. Create Distribution Certificate
# 4. Create Provisioning Profile (App Store)
# 5. Download and install
```

### 4. Build for iOS

```bash
# Build production iOS app
eas build --platform ios --profile production

# Wait for build to complete (~10-20 minutes)
# Build URL will be provided

# Download IPA file (optional)
eas build:download --platform ios --latest
```

### 5. Submit to App Store

**Option A: Via EAS Submit (Recommended)**

```bash
# Submit to App Store Connect
eas submit --platform ios --latest

# Enter App Store Connect credentials
# EAS will handle upload
```

**Option B: Manual Upload**

1. Download IPA from EAS build
2. Open **Transporter** app (macOS)
3. Sign in with Apple ID
4. Drag IPA file to Transporter
5. Click "Deliver"

### 6. App Store Connect Configuration

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)
2. Select your app
3. Click **+ Version or Platform** → **iOS**
4. Fill in app information:
   - **App Name:** Waldo Health
   - **Subtitle:** Workplace Exposure Documentation
   - **Category:** Health & Fitness, Productivity
   - **Privacy Policy URL:** https://waldohealth.com/privacy
   - **Description:** (See marketing copy below)
   - **Keywords:** exposure tracking, workplace safety, ACC, construction
   - **Support URL:** https://waldohealth.com/support
   - **Marketing URL:** https://waldohealth.com

5. Upload screenshots:
   - 6.5" iPhone (1242 x 2688)
   - 5.5" iPhone (1242 x 2208)
   - 12.9" iPad Pro (2048 x 2732)

6. Configure pricing:
   - **Price:** Free
   - **Availability:** New Zealand initially

7. Add app privacy details:
   - Location (for exposure tracking)
   - Photos (for exposure documentation)
   - Health data (exposure records)

8. Submit for review
9. Wait for Apple review (1-3 days typically)
10. Once approved, release to App Store

---

## Android Deployment

### 1. Configure Android App

Update `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.waldohealth.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### 2. Create Keystore

```bash
# Generate Android keystore (DO THIS ONCE, KEEP SECURE!)
keytool -genkey -v -keystore waldo-health.jks \
  -alias waldo-health -keyalg RSA -keysize 2048 -validity 10000

# Enter keystore password (SAVE THIS!)
# Enter alias password (SAVE THIS!)
# Fill in organization details

# Store keystore securely (NOT in git!)
# Add to EAS secrets
eas secret:create --scope project --name ANDROID_KEYSTORE --type file \
  --value ./waldo-health.jks

eas secret:create --scope project --name ANDROID_KEYSTORE_PASSWORD \
  --value "your-keystore-password"

eas secret:create --scope project --name ANDROID_KEY_PASSWORD \
  --value "your-key-password"
```

### 3. Build for Android

```bash
# Build production Android app bundle
eas build --platform android --profile production

# Wait for build to complete (~10-20 minutes)
# Build URL will be provided

# Download AAB file (optional)
eas build:download --platform android --latest
```

### 4. Submit to Google Play

**Option A: Via EAS Submit (Recommended)**

```bash
# Create service account JSON from Google Play Console
# https://docs.expo.dev/submit/android/

# Submit to Google Play
eas submit --platform android --latest

# Select track (internal/alpha/beta/production)
```

**Option B: Manual Upload**

1. Download AAB from EAS build
2. Go to [play.google.com/console](https://play.google.com/console)
3. Select your app
4. Go to **Release** → **Production**
5. Click **Create new release**
6. Upload AAB file
7. Fill in release notes
8. Click **Review release**
9. Click **Start rollout to Production**

### 5. Google Play Console Configuration

1. **Store Listing:**
   - **App name:** Waldo Health
   - **Short description:** Track workplace exposures for ACC claims
   - **Full description:** (See marketing copy below)
   - **App icon:** 512x512 PNG
   - **Feature graphic:** 1024x500 PNG
   - **Screenshots:**
     - Phone: 1080 x 1920 (minimum 2)
     - Tablet: 1536 x 2048 (minimum 2)
   - **Category:** Health & Fitness, Productivity
   - **Content rating:** Everyone
   - **Privacy Policy:** https://waldohealth.com/privacy

2. **Content Rating:**
   - Complete questionnaire
   - Should receive "Everyone" rating

3. **App Content:**
   - Target audience: Adults
   - Privacy policy: Required
   - Ads: No ads
   - In-app purchases: None

4. **Pricing & Distribution:**
   - **Price:** Free
   - **Countries:** New Zealand initially
   - **Content guidelines:** Comply with all policies

5. **Submit for review:**
   - Review typically takes 1-3 days
   - May require additional information

---

## Post-Deployment

### 1. Verify Deployment

**iOS:**
```bash
# Check if app is live
open "https://apps.apple.com/nz/app/waldo-health/idYOUR_APP_ID"

# Test on real device
# Install from TestFlight first, then App Store
```

**Android:**
```bash
# Check if app is live
open "https://play.google.com/store/apps/details?id=com.waldohealth.app"

# Test on real device
```

### 2. Configure Monitoring

**Firebase Performance:**
```bash
# Download config files from Firebase Console
# iOS: GoogleService-Info.plist → ios/
# Android: google-services.json → android/app/

# Rebuild app with Firebase SDK
npm install @react-native-firebase/app @react-native-firebase/perf
```

**Sentry:**
```bash
# Configure Sentry DSN in .env.production
SENTRY_DSN=https://...@sentry.io/...

# Sentry will auto-capture errors
# View in Sentry dashboard
```

### 3. Set Up Analytics

```typescript
// Already implemented in app
// View analytics in:
// - Convex dashboard (database metrics)
// - Firebase Performance (app metrics)
// - Sentry (error rates)
// - App Store Connect (downloads, reviews)
// - Google Play Console (installs, ratings)
```

### 4. Create Support Channels

- **Email:** support@waldohealth.com
- **Website:** https://waldohealth.com/support
- **In-app feedback:** Implemented in Profile tab
- **Phone:** +64 (optional)

### 5. Marketing Launch

- [ ] Press release
- [ ] Social media announcement
- [ ] Email existing beta users
- [ ] Construction industry forums
- [ ] WorkSafe NZ partnership (if applicable)
- [ ] ACC outreach

---

## Continuous Deployment (CI/CD)

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EAS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        run: eas build --platform ios --non-interactive --profile production

      - name: Build Android
        run: eas build --platform android --non-interactive --profile production

      - name: Submit to stores (manual approval required)
        # Only run on git tags
        if: startsWith(github.ref, 'refs/tags/v')
        run: |
          eas submit --platform ios --latest
          eas submit --platform android --latest
```

### Secrets Configuration

Add to GitHub repository secrets:

```
EXPO_TOKEN - From `eas login` then `eas whoami --json`
```

---

## Rollback Procedures

### Immediate Rollback (App Stores)

**iOS:**
1. Go to App Store Connect
2. Select your app
3. Click **App Store** tab
4. Remove current version from sale (stops new downloads)
5. Users on bad version will need manual update

**Android:**
1. Go to Google Play Console
2. Select your app
3. Go to **Release** → **Production**
4. Click **Halt rollout**
5. Rollback to previous version if needed

### Backend Rollback (Convex)

```bash
# View deployment history
npx convex dashboard
# Go to "Deployments" tab

# Rollback to previous deployment
npx convex rollback --deployment-id <previous-deployment-id>

# Verify rollback
npx convex logs
```

### Hotfix Release

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug main

# Make fixes
# ... edit files ...

# Test thoroughly
npm test && npm run lint

# Commit and push
git commit -am "fix: critical bug fix"
git push origin hotfix/critical-bug

# Merge to main
git checkout main
git merge hotfix/critical-bug

# Tag and deploy
git tag v1.0.1
git push origin main --tags

# Build and submit hotfix
eas build --platform all --profile production
eas submit --platform all --latest
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **App Crashes**
   - Target: < 0.1% crash rate
   - Alert: > 0.5% crash rate
   - Tool: Sentry

2. **API Errors**
   - Target: < 1% error rate
   - Alert: > 5% error rate
   - Tool: Convex logs, Sentry

3. **Performance**
   - Target: < 3s app startup
   - Alert: > 5s average startup
   - Tool: Firebase Performance

4. **User Growth**
   - Monitor: Daily active users (DAU)
   - Monitor: Monthly active users (MAU)
   - Tool: App Store Connect, Google Play Console

5. **Store Ratings**
   - Target: > 4.0 stars
   - Alert: < 3.5 stars
   - Tool: App Store Connect, Google Play Console

### Alert Configuration

**Sentry Alerts:**
```yaml
# .sentryclirc
[alerts]
crash_rate_threshold: 0.5  # Alert if > 0.5% crashes
error_rate_threshold: 5    # Alert if > 5% errors
response_time_threshold: 5000  # Alert if > 5s response
```

**Firebase Alerts:**
- Go to Firebase Console → Performance
- Set up alerts for:
  - App start time > 5s
  - Screen render time > 1s
  - Network request time > 3s

---

## Troubleshooting

### Common Issues

#### Build Fails on EAS

**Error:** `Unable to resolve module`

**Solution:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Try build again
eas build --platform ios --profile production --clear-cache
```

#### iOS Provisioning Error

**Error:** `No matching provisioning profiles found`

**Solution:**
```bash
# Revoke and recreate certificates
eas credentials --platform ios

# Select "Revoke credentials"
# EAS will generate new ones
```

#### Android Keystore Error

**Error:** `Keystore not found`

**Solution:**
```bash
# Re-upload keystore to EAS secrets
eas secret:create --scope project --name ANDROID_KEYSTORE \
  --type file --value ./waldo-health.jks
```

#### App Rejected by Apple

**Common reasons:**
1. Missing privacy policy
2. Location/camera permissions not explained
3. Crashes during review
4. Metadata issues

**Solution:**
- Address Apple's feedback
- Update app metadata
- Resubmit for review

#### App Crashes in Production

**Steps:**
1. Check Sentry for stack traces
2. Check Convex logs for backend errors
3. Test on affected device/OS version
4. Prepare hotfix
5. Submit expedited review (if critical)

---

## Best Practices

### 1. Versioning

Use Semantic Versioning (semver):
- **Major:** Breaking changes (v2.0.0)
- **Minor:** New features (v1.1.0)
- **Patch:** Bug fixes (v1.0.1)

### 2. Release Notes

Always include:
- New features
- Bug fixes
- Performance improvements
- Known issues

### 3. Staged Rollout

Android supports phased rollouts:
- Start with 5% of users
- Monitor for issues
- Gradually increase to 100%

### 4. Beta Testing

Use TestFlight (iOS) and Internal Testing (Android):
- Recruit 10-50 beta testers
- Get feedback before public release
- Fix critical bugs

### 5. Backup Strategy

- Keep all keystores and certificates secure
- Back up `.env.production` (encrypted)
- Document all API keys and secrets
- Store in password manager (1Password, LastPass)

---

## Checklist: First Production Release

### Week Before Launch

- [ ] All code merged to `main` branch
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit complete
- [ ] Legal docs finalized (privacy, terms)
- [ ] Support channels ready
- [ ] Marketing materials prepared

### Day of Launch

- [ ] Deploy Convex backend
- [ ] Build iOS app with EAS
- [ ] Build Android app with EAS
- [ ] Submit to App Store Connect
- [ ] Submit to Google Play Console
- [ ] Configure monitoring alerts
- [ ] Test production environment
- [ ] Notify beta users

### Post-Launch (First Week)

- [ ] Monitor crash rates daily
- [ ] Respond to user reviews
- [ ] Check performance metrics
- [ ] Address critical bugs immediately
- [ ] Gather user feedback
- [ ] Plan first update

---

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Convex Deployment Docs](https://docs.convex.dev/production/deployment)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)

---

**Questions?**

Contact: devops@waldohealth.com

---

**Last Updated:** November 7, 2025
**Version:** 1.0
**Phase:** 9 (T128)
