# Waldo Health

**Workplace Exposure Documentation for New Zealand Construction Workers**

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg)](https://expo.dev/)

---

## 📱 Overview

Waldo Health is a mobile application that enables construction workers to document workplace exposures to hazardous materials and conditions. Built for the New Zealand construction industry, it helps workers track exposure data for ACC claims, health monitoring, and workplace safety compliance.

### Key Features

- **📸 Quick Documentation** - Capture exposures in 60 seconds with photos and voice entry
- **🤖 AI Hazard Detection** - GPT-4 Vision analyzes photos for workplace hazards
- **🗺️ Interactive Mapping** - Visualize exposure locations with automatic clustering
- **📍 Smart Location Management** - Proximity-based site suggestions
- **📄 Professional Export** - Generate PDF/CSV reports for ACC claims
- **📚 Educational Content** - Safety information and best practices
- **☁️ Offline-First** - Works without internet, syncs when connected
- **♿ WCAG 2.1 AA Compliant** - Accessible to users with disabilities

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/waldo-health.git
cd waldo-health

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

```bash
# iOS (requires macOS)
npm run ios

# Android
npm run android

# Web (preview only)
npm run web
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Convex Backend
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# OpenAI API (for AI hazard detection)
OPENAI_API_KEY=sk-...

# Sentry (Error Monitoring)
SENTRY_DSN=https://...@sentry.io/...

# Firebase (Performance Monitoring)
# Add GoogleService-Info.plist (iOS) and google-services.json (Android)
```

### Required Services

1. **Convex** - Backend database and real-time sync
   - Sign up at [convex.dev](https://www.convex.dev/)
   - Create new project
   - Deploy schema: `npx convex dev`

2. **Clerk** - User authentication
   - Sign up at [clerk.com](https://clerk.com/)
   - Create application
   - Configure email/password authentication

3. **OpenAI** - AI hazard detection (optional)
   - Get API key from [platform.openai.com](https://platform.openai.com/)
   - Requires GPT-4 Vision access

---

## 📂 Project Structure

```
waldo-health/
├── convex/                  # Backend functions and schema
│   ├── schema.ts           # Database schema
│   ├── exposures.ts        # Exposure CRUD operations
│   ├── photos.ts           # Photo management
│   ├── locations.ts        # Saved site management
│   ├── hazardScans.ts      # AI detection
│   └── __tests__/          # Backend tests
│
├── src/
│   ├── app/                # Expo Router screens
│   │   ├── (tabs)/         # Tab navigation screens
│   │   │   ├── index.tsx   # Home
│   │   │   ├── new.tsx     # New exposure form
│   │   │   ├── map.tsx     # Map view
│   │   │   ├── education.tsx # Educational content
│   │   │   └── profile.tsx  # User profile
│   │   └── _layout.tsx     # Root layout
│   │
│   ├── components/         # Reusable components
│   │   ├── common/         # Generic UI components
│   │   ├── exposure/       # Exposure-specific components
│   │   └── lazy/           # Lazy-loaded components
│   │
│   ├── constants/          # Configuration and constants
│   │   ├── config.ts       # App configuration
│   │   ├── theme.ts        # Colors and typography
│   │   └── exposureTypes.ts # Hazard definitions
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useCamera.ts    # Camera functionality
│   │   ├── useLocation.ts  # GPS tracking
│   │   └── useVoice.ts     # Voice recognition
│   │
│   └── utils/              # Utility functions
│       ├── performance.ts  # Performance monitoring
│       ├── accessibility.ts # A11y helpers
│       └── lazyLoad.tsx    # Code splitting
│
├── docs/                   # Documentation
│   ├── ACCESSIBILITY_AUDIT.md
│   ├── PERFORMANCE_BASELINE.md
│   ├── CODE_SPLITTING_GUIDE.md
│   └── PRODUCTION_MONITORING_SETUP.md
│
└── specs/                  # Feature specifications
    └── 001-waldo-health/
        ├── spec.md         # Feature spec
        ├── plan.md         # Implementation plan
        └── tasks.md        # Task tracking
```

---

## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (iOS)
npm run test:e2e:ios

# E2E tests (Android)
npm run test:e2e:android
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Performance Profiling

Development-only performance dashboard available in Profile tab:

- Screen load times
- Component render times
- Memory warnings
- Generate performance reports

See [PERFORMANCE_BASELINE.md](docs/PERFORMANCE_BASELINE.md) for details.

---

## 📱 Building for Production

### iOS

```bash
# Using Expo Application Services (EAS)
eas build --platform ios --profile production

# Or local build
npm run build:ios
```

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect access
- Provisioning profiles configured

### Android

```bash
# Using EAS
eas build --platform android --profile production

# Or local build
npm run build:android
```

**Requirements:**
- Google Play Console account ($25 one-time)
- Signing keys generated
- App bundle configured

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete instructions.

---

## 🔒 Security

### Data Protection

- User data encrypted at rest (MMKV)
- All API calls over HTTPS
- Clerk authentication with secure tokens
- Environment variables for secrets
- No sensitive data in logs

### Privacy

- GDPR compliant
- User consent for data collection
- Right to data deletion
- Privacy policy required before launch

### Reporting Security Issues

Please report security vulnerabilities to: security@waldohealth.com

---

## 🌐 Supported Platforms

### iOS
- Minimum: iOS 13.0
- Recommended: iOS 15.0+
- Devices: iPhone SE (2016) and newer

### Android
- Minimum: Android 6.0 (API 23)
- Recommended: Android 10+
- Devices: 2GB RAM minimum

### Tablet Support
- iPad 6th generation and newer
- Android tablets 7"+ screen

---

## ♿ Accessibility

Waldo Health is WCAG 2.1 Level AA compliant:

- Screen reader support (VoiceOver, TalkBack)
- 4.5:1 color contrast ratios
- 48x48 touch targets
- Keyboard navigation (iPad)
- Text scaling support
- Focus indicators

See [ACCESSIBILITY_AUDIT.md](docs/ACCESSIBILITY_AUDIT.md) for audit results.

---

## 📊 Performance

### Targets

- App start time: < 3 seconds
- Screen load time: < 300ms
- Map rendering: 500+ markers smoothly
- Memory usage: < 200MB
- Bundle size: < 20MB

### Monitoring

- Firebase Performance Monitoring (production)
- Sentry error tracking (production)
- Development performance dashboard

See [PERFORMANCE_BASELINE.md](docs/PERFORMANCE_BASELINE.md) for benchmarks.

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Run linter and tests: `npm run lint && npm test`
4. Commit with descriptive message
5. Push and create pull request

### Coding Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- Meaningful variable names
- Comprehensive comments for complex logic
- Unit tests for utilities and hooks
- Component tests for UI

### Commit Messages

```
feat: Add AI hazard detection
fix: Resolve map clustering issue
docs: Update README with setup instructions
test: Add tests for exposure CRUD
perf: Optimize MapView rendering
```

---

## 📚 Additional Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Backend functions reference
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Build and deploy instructions
- [User Manual](docs/USER_MANUAL.md) - End-user guide
- [Developer Onboarding](docs/DEVELOPER_ONBOARDING.md) - New developer setup
- [Accessibility Audit](docs/ACCESSIBILITY_AUDIT.md) - WCAG compliance
- [Performance Baseline](docs/PERFORMANCE_BASELINE.md) - Performance standards

---

## 🐛 Known Issues

### Current Limitations

1. **AI Detection**
   - Requires internet connection
   - Limited to 50 scans/hour
   - Professional verification required for asbestos

2. **Offline Mode**
   - Photos stored locally until sync
   - Map requires initial data load
   - AI detection unavailable offline

3. **Platform-Specific**
   - Camera permissions required
   - Location services must be enabled
   - Push notifications require configuration

See [GitHub Issues](https://github.com/your-org/waldo-health/issues) for full list.

---

## 📝 License

Copyright © 2025 Waldo Health

This software is proprietary. All rights reserved.

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Convex](https://www.convex.dev/)
- Authentication by [Clerk](https://clerk.com/)
- AI detection using [OpenAI GPT-4 Vision](https://openai.com/)
- Maps by [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- Developed with [Claude Code](https://claude.com/claude-code)

---

## 📧 Contact

- **Website:** [waldohealth.com](https://waldohealth.com)
- **Email:** support@waldohealth.com
- **Issues:** [GitHub Issues](https://github.com/your-org/waldo-health/issues)

---

## 🗺️ Roadmap

### v1.0 (Current)
- ✅ Core exposure tracking
- ✅ AI hazard detection
- ✅ Map visualization
- ✅ Offline support
- ✅ PDF/CSV export

### v1.1 (Planned)
- Push notifications for reminders
- Team features (share exposures)
- Advanced filtering and search
- Health system integration
- Dark mode

### v2.0 (Future)
- Wearable device support
- Real-time exposure alerts
- Analytics dashboard
- Multi-language support
- Enterprise features

---

**Made with ❤️ for New Zealand construction workers**
