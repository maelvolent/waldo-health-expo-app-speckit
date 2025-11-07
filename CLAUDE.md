# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Waldo Health is a React Native mobile app for New Zealand construction workers to document workplace exposures to hazardous materials. Built with Expo SDK 54, TypeScript, Convex backend, and featuring AI-powered hazard detection via OpenAI GPT-4 Vision.

**Status:** Feature-complete (84.4%), ready for beta testing

## Common Commands

### Development

```bash
# Start Expo dev server (requires Convex backend running)
npm start
# or: npx expo start

# Platform-specific launch
npm run ios          # iOS simulator
npm run android      # Android emulator

# Start Convex backend (required, run in separate terminal)
npx convex dev
```

### Testing

```bash
npm test                    # Run Jest tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# E2E tests (Detox)
npm run build:ios           # Build for iOS simulator
npm run test:e2e:ios        # Run iOS E2E tests
npm run build:android       # Build for Android emulator
npm run test:e2e:android    # Run Android E2E tests
```

### Code Quality

```bash
npm run lint                # Check linting
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format with Prettier
npm run type-check          # TypeScript type checking
```

### Running Single Test File

```bash
npm test -- path/to/test.test.ts
npm test -- --testNamePattern="test name pattern"
```

## Architecture

### Tech Stack

- **Frontend:** React Native 0.81.5, Expo SDK 54, Expo Router (file-based routing)
- **Backend:** Convex (serverless, real-time), OpenAI GPT-4 Vision API
- **Auth:** Clerk (with Expo integration)
- **Storage:** MMKV (offline-first), Convex file storage
- **Maps:** react-native-maps with react-native-maps-super-cluster
- **Voice:** @react-native-voice/voice

### Project Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx        # Root layout with providers (Clerk, Convex, Paper)
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab bar configuration
│   │   ├── index.tsx      # Home: Exposures list
│   │   ├── new.tsx        # New exposure form (3-step wizard)
│   │   ├── map.tsx        # Interactive map with clustering
│   │   ├── education.tsx  # Educational content library
│   │   └── profile.tsx    # User profile and settings
│   ├── exposure/[id].tsx  # Exposure detail screen (dynamic route)
│   └── sign-in.tsx        # Authentication screen
├── components/
│   ├── common/            # Reusable UI components
│   └── exposure/          # Exposure-specific components
│       ├── ExposureForm.tsx         # Multi-step form
│       ├── PhotoCapture.tsx         # Camera interface
│       ├── MapView.tsx              # Map with clustering
│       └── HazardScanResult.tsx     # AI detection results
├── hooks/                 # Custom React hooks for business logic
│   ├── useExposures.ts   # Exposure CRUD operations
│   ├── useCamera.ts      # Camera and photo handling
│   ├── useLocation.ts    # GPS and saved locations
│   ├── useVoice.ts       # Voice-to-text transcription
│   └── useOfflineSync.ts # Offline mutation queue
├── lib/                   # Utility libraries
│   ├── storage.ts        # MMKV wrapper (offline-first)
│   ├── offlineQueue.ts   # Mutation queue for sync
│   ├── photoQueue.ts     # Photo upload queue
│   ├── draftManager.ts   # Auto-save drafts every 3s
│   ├── pdf.ts            # PDF export generation
│   ├── csv.ts            # CSV export formatting
│   └── validation.ts     # Form validation
├── constants/
│   ├── config.ts         # App config (AI settings, rate limits)
│   ├── theme.ts          # WCAG 2.1 AA compliant theme
│   └── exposureTypes.ts  # Hazard type definitions
└── types/                # TypeScript type definitions

convex/                    # Backend (serverless functions)
├── schema.ts             # Database schema (users, exposures, photos, etc.)
├── users.ts              # User operations
├── exposures.ts          # Exposure CRUD
├── photos.ts             # Photo upload/storage
├── locations.ts          # Saved sites with proximity search
├── educationalContent.ts # Educational content
├── hazardScans.ts        # AI hazard detection (GPT-4 Vision)
├── exports.ts            # PDF/CSV generation
└── auth.config.ts        # Clerk integration
```

### Key Architectural Patterns

**Offline-First Architecture:**

- MMKV provides fast local storage (falls back to in-memory in Expo Go)
- `offlineQueue.ts` manages mutation queue with auto-sync every 30s
- `photoQueue.ts` handles background photo uploads with retry logic
- `draftManager.ts` auto-saves form state every 3 seconds
- Automatic sync on network reconnection

**Provider Hierarchy (src/app/\_layout.tsx):**

1. ClerkProvider - Authentication with secure token storage
2. ConvexProviderWithClerk - Real-time backend with auth
3. PaperProvider - Material Design components with custom theme
4. SafeAreaProvider - Safe area handling
5. NetworkMonitor - Auto-sync on connectivity changes
6. VoiceLanguageChecker - Verify voice recognition support

**Custom Hooks Pattern:**
All business logic lives in custom hooks, keeping components focused on UI:

- `useExposures()` - CRUD operations, list/detail management
- `useCamera()` - Camera permissions, capture, AI trigger
- `useLocation()` - GPS tracking, proximity search for saved sites
- `useVoice()` - Voice recognition, transcription handling
- `useOfflineSync()` - Queue management, sync status

**AI Hazard Detection:**

- Triggered from PhotoCapture component after photo taken
- `convex/hazardScans.ts` calls OpenAI GPT-4 Vision API
- Rate limits: 50/hour, 200/day
- Confidence threshold: 50% minimum, 80+ is "high"
- Results include: detected hazards, suggested PPE, exposure type
- Asbestos detection includes professional verification disclaimer

**Location Smart Features:**

- Proximity-based location suggestions (50m radius, Haversine formula)
- Usage tracking (exposure count, last used date)
- Map clustering for 100+ markers
- Color-coded markers by exposure type

## Path Aliases

TypeScript path aliases are configured in tsconfig.json:

```typescript
import { ExposureForm } from '@components/exposure/ExposureForm';
import { useExposures } from '@hooks/useExposures';
import { storage } from '@lib/storage';
import { COLORS } from '@constants/theme';
import type { Exposure } from '@types/exposure';
```

## Environment Setup

Required environment variables in `.env.local`:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=xxx

# Optional (production monitoring)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

See `SETUP.md` for detailed setup instructions including:

- Clerk authentication configuration
- Convex backend deployment (must use AWS Sydney for NZ compliance)
- iOS/Android simulator setup

## Development Workflow

1. **Start Services** (in separate terminals):

   ```bash
   # Terminal 1: Convex backend
   npx convex dev

   # Terminal 2: Expo dev server
   npm start
   ```

2. **Code Changes** trigger automatic hot reload

3. **Testing Strategy:**
   - Write tests first (TDD workflow per constitution)
   - Run `npm test` frequently
   - Coverage threshold: 80% (statements, branches, functions, lines)

4. **Git Workflow:**
   - Main branch: `001-waldo-health`
   - Commit messages should be descriptive
   - Keep continuing development as long as you can, and decide on user's behalf for the best interest (per CLAUDE.md manual additions)

## Important Implementation Details

### Expo Go Limitations

MMKV requires native modules and doesn't work in Expo Go:

- App automatically falls back to in-memory storage
- All features work but data is lost on reload
- For full persistence, use development build: `expo prebuild`
- See `EXPO_GO_NOTES.md` for details

### Data Compliance (NZ Privacy Act 2020)

- Convex MUST be deployed to AWS Sydney (ap-southeast-2)
- Clerk data stays in Australia/NZ region
- All personal data encrypted at rest and in transit
- Photos stored in Convex file storage (AWS Sydney)

### Testing Configuration

- Jest config: `jest.config.js`
- Test setup: `jest.setup.js`
- Tests in `__tests__/` directories or `*.test.ts` files
- Coverage threshold: 80% globally
- Detox E2E config: `.detoxrc.json` (iOS: iPhone 15, Android: Pixel 7 API 33)

### AI Rate Limits

From `src/constants/config.ts`:

- 50 scans per hour
- 200 scans per day
- 30 second timeout
- Temperature: 0.3 (for consistency)
- Max tokens: 1000

### Performance Optimizations

- Map clustering threshold: 100 markers
- Image max size: 10MB
- JPEG quality: 0.8
- Offline queue max: 100 operations
- Auto-save interval: 3 seconds

## Common Development Tasks

### Adding New Exposure Type

1. Update `src/constants/exposureTypes.ts`
2. Update AI prompt in `convex/hazardScans.ts`
3. Add educational content in Convex dashboard
4. Update form validation if needed

### Adding New Screen

1. Create file in `src/app/` (Expo Router auto-routes)
2. For tab navigation, add to `src/app/(tabs)/`
3. Update `_layout.tsx` if adding new tab
4. Dynamic routes use `[id].tsx` syntax

### Modifying Database Schema

1. Update `convex/schema.ts`
2. Run `npx convex dev` to deploy changes
3. Update TypeScript types in `src/types/`
4. Update affected queries/mutations in `convex/`

### Adding New Test

1. Create `__tests__/` directory or `*.test.ts` file
2. Import testing utilities from `@testing-library/react-native`
3. Run `npm test -- --watch` for development
4. Ensure coverage stays above 80%

## Known Issues

1. **Jest Configuration:** Tests need update for Expo SDK 54 Winter module system
2. **Assets:** icon.png and splash.png needed in `assets/images/` for production builds
3. **Camera/GPS:** Requires physical device testing (simulators have limitations)

## Phase 9 Remaining Work

See `IMPLEMENTATION_STATUS.md` and `PHASE_9_ROADMAP.md` for details:

- Performance optimization and profiling
- WCAG 2.1 AA accessibility audit
- Documentation completion
- Production deployment (app stores, Sentry, analytics)

## Additional Documentation

- `SETUP.md` - Detailed setup instructions
- `RUNNING.md` - Quick start guide and app structure
- `EXPO_GO_NOTES.md` - Expo Go limitations and workarounds
- `IMPLEMENTATION_STATUS.md` - Feature completion tracking
- `PHASE_9_ROADMAP.md` - Production readiness tasks
- `UI_REVIEW.md` - Design and accessibility notes
- `specs/001-waldo-health/` - Full feature specification and task tracking

## Code Style

- ESLint config: `.eslintrc.js` (extends expo, prettier)
- Prettier for formatting
- TypeScript strict mode enabled
- No unused variables (except `_` prefix)
- Console.log only for warn/error
- React hooks exhaustive deps as warning

## UI Polish Patterns (002-ui-polish)

### Custom Hooks Pattern
All business logic extracted into reusable hooks:

```typescript
// Haptic feedback
import { useHaptics } from '@hooks/useHaptics';
const { light, medium, heavy, selection, success, warning, error } = useHaptics();
light(); // On button tap
success(); // On form submission
error(); // On validation error

// Form draft management
import { useDraftForm } from '@hooks/useDraftForm';
const { loadDraft, clearDraft, lastSaved } = useDraftForm('form-key', formData, 2000);

// Debounced search
import { useSearch } from '@hooks/useSearch';
const { query, setQuery, results, isTyping } = useSearch(data, { delay: 300 });

// Multi-criteria filtering
import { useFilter } from '@hooks/useFilter';
const { filters, setFilters, filtered } = useFilter(searchResults);
```

### Loading States Pattern
Use skeleton components for professional loading states:

```typescript
import { SkeletonCard, SkeletonList, SkeletonText } from '@components/common';

// While loading
if (isLoading) return <SkeletonList count={6} />;

// For statistics
{isLoading ? <SkeletonText width="80%" size="small" /> : <Text>{count}</Text>}
```

### Empty States Pattern
Context-aware empty state messaging:

```typescript
import { EmptyState } from '@components/common/EmptyState';

// No data at all
<EmptyState
  icon="document-text-outline"
  title="No exposures yet"
  description="Tap Document Exposure to create your first record"
  ctaLabel="Go to Home"
  onCtaPress={() => router.push('/')}
/>

// No search/filter results
<EmptyState
  icon="search"
  title="No exposures found"
  description="Try different keywords or clear filters"
  ctaLabel="Clear Filters"
  onCtaPress={clearFilters}
/>
```

### Form Experience Pattern
Multi-step forms with progress, validation, and auto-save:

```typescript
import { FormProgress, InlineError, DraftSaver } from '@components/forms';

const steps = [
  { id: 'type', label: 'Type', description: 'Select type' },
  { id: 'details', label: 'Details', description: 'Add details' },
];

<FormProgress steps={steps} currentStep={0} />
<DraftSaver lastSaved={lastSaved} isSaving={false} />
<InlineError message={validationErrors.field} errorId="field-error" />
```

### Accessibility Pattern
All interactive elements need proper labels:

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Document new exposure"
  accessibilityHint="Navigate to exposure form"
  onPress={handlePress}
>
  {/* content */}
</TouchableOpacity>
```

### Theme Usage Pattern
Always use theme tokens, never hardcode:

```typescript
import { colors, spacing, typography, touchTarget } from '@constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,  // Not '#fff'
    padding: spacing.md,              // Not 16
  },
  title: {
    ...typography.h2,                 // Not fontSize: 24
    color: colors.text,
  },
  button: {
    minHeight: touchTarget.minHeight, // 48px minimum
  },
});
```

### Long-Press Menu Pattern
Context menus on cards:

```typescript
import { Card } from '@components/common/Card';

<Card
  onPress={handleView}
  onLongPress={handleLongPress}  // Shows context menu
  accessibilityHint="Long press for options"
>
  {/* card content */}
</Card>
```

## Active Technologies
- TypeScript 5.x with React Native via Expo SDK (latest stable) (002-ui-polish)
- expo-haptics for tactile feedback (002-ui-polish)
- React Native Animated API for skeleton shimmer (002-ui-polish)
- React.memo with custom comparison for performance (002-ui-polish)

## Recent Changes
- 002-ui-polish: Completed Phases 1-9 (71/88 tasks)
  - Created 18 new files (13 components + 5 hooks)
  - Professional icon system with Ionicons
  - Search and filter functionality
  - Skeleton loading states
  - Form progress and auto-save
  - WCAG 2.1 AA accessibility
  - Comprehensive haptic feedback
  - Long-press context menus
  - Zero hardcoded colors (all use theme tokens)
