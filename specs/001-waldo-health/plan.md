# Implementation Plan: Waldo Health

**Branch**: `001-waldo-health` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-waldo-health/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Waldo Health is a mobile application for iOS and Android that enables construction workers in New Zealand to quickly document workplace health exposures (silica dust, asbestos, chemicals, etc.) with comprehensive evidence including photos, GPS location, timestamps, and voice notes. The app solves the critical problem of incomplete exposure records needed for ACC claims by making documentation as easy as taking a photo (target: <60 seconds per entry).

**Technical Approach**: Cross-platform mobile app built with Expo SDK and React Native for iOS 15+ and Android 10+. Convex provides real-time serverless backend with offline-first data sync. Clerk handles authentication. The app uses device camera API for photo capture with EXIF preservation, native geolocation for GPS tracking, and device speech-to-text for voice entry. Export functionality generates PDFs and CSVs from exposure records.

## Technical Context

**Language/Version**: TypeScript 5.x with React Native via Expo SDK (latest stable)
**Primary Dependencies**:
- **Mobile Framework**: Expo SDK (latest) with React Native
- **Backend**: Convex (serverless real-time database and functions)
- **Authentication**: Clerk (mobile SDK for React Native)
- **UI Components**: React Native Paper (best WCAG 2.1 AA accessibility support)
- **Camera**: expo-camera for photo capture with EXIF preservation
- **Location**: expo-location for GPS coordinates and reverse geocoding
- **Speech**: @react-native-voice/voice for offline voice-to-text with NZ English support
- **PDF Generation**: expo-print for offline PDF generation (Expo native, no ejection)
- **Offline Storage**: MMKV for local queue + Convex for cloud sync + expo-file-system for photos
- **Maps**: react-native-maps for location visualization

**Storage**:
- **Backend Database**: Convex (NoSQL document store with real-time sync)
- **Local Cache**: Convex offline cache + AsyncStorage for app state
- **File Storage**: expo-file-system for photos (local), Convex file storage (cloud sync)

**Testing**:
- **Unit Tests**: Jest with React Native Testing Library
- **Integration Tests**: Detox for E2E mobile testing
- **Contract Tests**: Convex schema validation + function contract tests
- **Type Safety**: TypeScript strict mode

**Target Platform**: iOS 15+ and Android 10+ (Expo Go for development, standalone builds for production)

**Project Type**: Mobile (cross-platform with API backend via Convex serverless functions)

**Performance Goals**:
- App launch: < 2 seconds cold start
- Exposure entry completion: < 60 seconds (P1 requirement)
- Photo capture to save: < 3 seconds
- Offline data sync: background sync within 30 seconds of connectivity
- PDF generation: < 5 seconds for 10 exposures with 5 photos each

**Constraints**:
- Must work fully offline (offline-first architecture)
- Photo EXIF metadata must be preserved for legal evidence
- GPS coordinates accurate to within 10 meters
- 40-year data retention (Convex long-term storage strategy needed)
- WCAG 2.1 AA accessibility compliance
- NZ Privacy Act 2020 compliance (self-hosted Convex on AWS NZ region ap-southeast-5 required)

**Scale/Scope**:
- Phase 1 (MVP): 10,000+ users, ~20 screens, 5 core features (P1 user stories)
- Year 1: 10,000+ active users per spec success criteria
- Data volume: ~100 exposures per user per year, 1-5 photos each (500 photos/user/year avg)
- Storage: ~5MB per user per year (photos), ~1KB per exposure record

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality First ✅
- **Type Safety**: TypeScript 5.x strict mode enabled - all code will be strongly typed
- **Linting**: ESLint + Prettier configured for React Native/Expo
- **Code Review**: All PRs require peer review before merge
- **Documentation**: JSDoc for public APIs, inline comments for complex logic
- **Single Responsibility**: Component-based architecture enforces SRP
- **DRY Principle**: Shared utilities for common patterns (camera, location, PDF generation)

### Test-Driven Development ✅
- **TDD Workflow**: Write failing tests → implement → refactor
- **Coverage Target**: 80% minimum, 95% for critical paths (auth, data sync, exposure creation)
- **Test Types**:
  - Unit: Jest + React Native Testing Library for components and utilities
  - Integration: Detox for E2E mobile flows (P1 user stories)
  - Contract: Convex function validation (schema enforcement)
- **CI/CD**: Tests must pass before merge
- **Test Naming**: `should [behavior] when [condition]` pattern

### User Experience Consistency ✅
- **Design System**: React Native Paper (superior accessibility documentation, WCAG 2.1 AA compliance)
- **Accessibility**: WCAG 2.1 AA compliance required (FR-030)
  - Screen reader support (React Native Accessibility API)
  - Keyboard navigation for Android physical keyboards
  - Color contrast 4.5:1 minimum
  - Touch targets 44x44 minimum
- **Responsive Design**: Support for phones (375px+) and tablets (768px+)
- **Loading States**: All async operations show loading indicators
- **Error Handling**: User-friendly error messages with recovery steps
- **Consistency**: Shared navigation patterns, form validation patterns

### Performance Standards ✅
- **App Launch**: < 2 seconds cold start (measured via Expo performance monitoring)
- **Time to Interactive**: < 3 seconds to first interaction
- **Backend Response**: Convex queries P95 < 200ms, mutations P95 < 500ms
- **Bundle Size**: Target < 50MB iOS, < 35MB Android AAB (via Expo Atlas + tree shaking + lazy loading)
- **Offline Performance**: No degradation when offline (offline-first architecture)
- **Memory Usage**: < 150MB typical usage for mobile
- **Performance Monitoring**: Sentry for React Native + Convex observability

### Observability & Monitoring ✅
- **Structured Logging**: Sentry for React Native with context (userId, exposureId, screen)
- **Error Tracking**: Sentry captures all exceptions with stack traces
- **Metrics & Alerting**:
  - Error rates (alert if > 1% crashes)
  - Offline sync failures (alert if > 5%)
  - Photo upload failures
- **Request Tracing**: Convex built-in tracing for backend functions
- **Audit Logging**: All exposure record mutations logged immutably in Convex
- **Health Checks**: Convex provides built-in health monitoring

### Quality Gates (Pre-Phase 0)

| Gate | Status | Notes |
|------|--------|-------|
| **Gate 1 - Design Review** | ✅ PASS | Feature spec approved (spec.md with 5 user stories, 39 requirements) |
| **Gate 2 - Code Review** | ⏸️ N/A | Not applicable until implementation phase |
| **Gate 3 - Automated Tests** | ⏸️ N/A | Tests will be written during tasks.md execution |
| **Gate 4 - Performance Audit** | ⏸️ PENDING | Will validate during implementation (< 60 sec exposure entry) |
| **Gate 5 - Security Scan** | ⏸️ PENDING | Clerk handles auth security, Convex provides data security |
| **Gate 6 - Accessibility Audit** | ⏸️ PENDING | WCAG 2.1 AA validation required (FR-030) |
| **Gate 7 - Staging Validation** | ⏸️ N/A | Not applicable until deployment phase |

**Pre-Phase 0 Assessment**: ✅ CLEARED to proceed with research phase

All gates appropriate for planning phase are satisfied. Implementation gates (2, 3, 4, 6, 7) will be validated during `/speckit.implement` execution.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Expo React Native Mobile App with Convex Backend

# Root configuration
app.json                 # Expo configuration
package.json            # Dependencies and scripts
tsconfig.json           # TypeScript configuration
.eslintrc.js            # ESLint configuration
.prettierrc             # Prettier configuration

# Mobile app source (React Native + Expo)
src/
├── app/                # Expo Router app directory (file-based routing)
│   ├── (tabs)/         # Tab navigation screens
│   │   ├── index.tsx   # Home/Exposures list screen
│   │   ├── new.tsx     # New exposure entry screen (camera-first)
│   │   ├── history.tsx # Exposure history screen
│   │   └── profile.tsx # User profile/settings screen
│   ├── exposure/
│   │   └── [id].tsx    # Exposure detail screen (dynamic route)
│   ├── _layout.tsx     # Root layout with Clerk auth provider
│   └── +not-found.tsx  # 404 screen
├── components/         # Reusable UI components
│   ├── exposure/
│   │   ├── ExposureCard.tsx
│   │   ├── ExposureForm.tsx
│   │   ├── ExposureTypeSelector.tsx
│   │   └── PhotoCapture.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Header.tsx
│       └── TabBar.tsx
├── convex/             # Convex backend functions
│   ├── schema.ts       # Convex schema (Exposure, Photo, User, etc.)
│   ├── exposures.ts    # CRUD functions for exposures
│   ├── photos.ts       # Photo upload and management
│   ├── users.ts        # User profile functions
│   ├── auth.ts         # Clerk authentication integration
│   └── exports.ts      # PDF/CSV export generation functions
├── hooks/              # Custom React hooks
│   ├── useExposures.ts # Convex query hooks for exposures
│   ├── useCamera.ts    # Camera permission and capture logic
│   ├── useLocation.ts  # GPS and reverse geocoding
│   ├── useVoice.ts     # Speech-to-text hook
│   └── useOfflineSync.ts # Offline sync status monitoring
├── lib/                # Utility libraries
│   ├── camera.ts       # Camera utils (EXIF preservation)
│   ├── location.ts     # GPS and geocoding utils
│   ├── pdf.ts          # PDF generation logic
│   ├── csv.ts          # CSV export logic
│   ├── voice.ts        # Speech-to-text configuration
│   └── validation.ts   # Form validation utilities
├── constants/          # App-wide constants
│   ├── exposureTypes.ts # 12 exposure categories
│   ├── colors.ts       # Design system colors (WCAG compliant)
│   └── config.ts       # App configuration
└── types/              # TypeScript type definitions
    ├── exposure.ts
    ├── photo.ts
    ├── user.ts
    └── api.ts

# Testing
__tests__/
├── unit/               # Unit tests (Jest + React Native Testing Library)
│   ├── components/
│   ├── hooks/
│   └── lib/
├── integration/        # Integration tests (Detox E2E)
│   ├── exposure-creation.e2e.ts
│   ├── offline-sync.e2e.ts
│   └── export.e2e.ts
└── contract/           # Convex function contract tests
    ├── exposures.test.ts
    └── photos.test.ts

# Assets
assets/
├── images/             # App icons, splash screens
├── fonts/              # Custom fonts (if needed)
└── exposure-icons/     # Icons for 12 exposure types

# Documentation (outside src/)
specs/001-waldo-health/ # This planning directory
```

**Structure Decision**: Mobile-first Expo architecture with Convex serverless backend

- **Expo Router**: File-based routing for navigation (src/app/)
- **Convex Backend**: Serverless functions co-located in src/convex/ (deployed separately to Convex cloud)
- **Component Library**: Organized by feature (exposure/, common/, layout/)
- **Hooks Pattern**: Custom hooks encapsulate complex logic (camera, location, voice, offline sync)
- **Type Safety**: Shared types/ directory ensures consistency between frontend and Convex backend
- **Testing Structure**: Separated by test type (unit, integration, contract) for parallel execution

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected. All quality gates pass for the current design:
- Type safety: TypeScript strict mode
- Testing: TDD with Jest, Detox, and Convex contract tests
- UX consistency: Design system with WCAG 2.1 AA compliance
- Performance: Offline-first architecture meets <60 second exposure entry target
- Observability: Sentry + Convex built-in monitoring

All architectural decisions (Expo, React Native, Convex, Clerk) align with constitution principles.
