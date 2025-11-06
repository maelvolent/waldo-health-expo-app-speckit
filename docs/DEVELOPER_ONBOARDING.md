# Developer Onboarding Guide

**Waldo Health - Getting Started as a Developer**
**Date:** November 7, 2025
**Version:** 1.0

---

## Welcome to the Waldo Health Team!

This guide will help you set up your development environment and understand the codebase. By the end, you'll be ready to contribute to Waldo Health.

**Estimated Time:** 2-4 hours for complete setup

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Tech Stack Overview](#tech-stack-overview)
- [Running the App](#running-the-app)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [Debugging](#debugging)
- [Contributing](#contributing)
- [Resources](#resources)
- [Getting Help](#getting-help)

---

## Prerequisites

### Required Knowledge

- **JavaScript/TypeScript** - Strong proficiency
- **React Native** - Basic understanding
- **React Hooks** - useState, useEffect, custom hooks
- **Git** - Version control basics
- **Mobile Development** - iOS or Android basics

### Helpful (But Not Required)

- Expo framework
- Convex serverless backend
- Clerk authentication
- OpenAI API integration
- React Native Paper UI library

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.x or 20.x | JavaScript runtime |
| **npm** | 9.x+ | Package manager |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Code editor (recommended) |
| **Expo CLI** | Latest | Development server |
| **iOS Simulator** | Latest | iOS testing (macOS only) |
| **Android Studio** | Latest | Android testing |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "expo.vscode-expo-tools",
    "bradlc.vscode-tailwindcss",
    "gruntfuggly.todo-tree",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## Development Environment Setup

### Step 1: Clone the Repository

```bash
# Clone via SSH (recommended)
git clone git@github.com:your-org/waldo-health.git
cd waldo-health

# Or via HTTPS
git clone https://github.com/your-org/waldo-health.git
cd waldo-health
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Expo CLI globally
npm install -g expo-cli

# Install Convex CLI globally
npm install -g convex
```

### Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
# (Ask team lead for development API keys)
```

Required environment variables:

```env
# Convex Backend (Development)
EXPO_PUBLIC_CONVEX_URL=https://your-dev-project.convex.cloud

# Clerk Authentication (Development)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# OpenAI API (Shared Development Key)
OPENAI_API_KEY=sk-...

# App Environment
EXPO_PUBLIC_APP_ENV=development
```

### Step 4: Set Up Convex Backend

```bash
# Login to Convex
npx convex login

# Initialize Convex project
npx convex dev

# This will:
# - Create development deployment
# - Watch for backend changes
# - Generate TypeScript types
# - Keep running in separate terminal
```

### Step 5: Set Up iOS Simulator (macOS only)

```bash
# Install Xcode from App Store
# Then install command line tools
xcode-select --install

# Open iOS Simulator
open -a Simulator
```

### Step 6: Set Up Android Emulator

1. Download **Android Studio** from [developer.android.com](https://developer.android.com/studio)
2. Open Android Studio
3. Go to **Tools** → **AVD Manager**
4. Click **Create Virtual Device**
5. Select **Pixel 5** (or similar)
6. Choose **API 33** (Android 13)
7. Click **Finish**
8. Start emulator

### Step 7: Verify Setup

```bash
# Run all checks
npm run type-check  # TypeScript compilation
npm run lint        # ESLint checks
npm test            # Jest tests

# All should pass ✅
```

---

## Project Structure

```
waldo-health/
├── convex/                     # Backend (Convex serverless)
│   ├── schema.ts              # Database schema
│   ├── exposures.ts           # Exposure CRUD
│   ├── photos.ts              # Photo management
│   ├── locations.ts           # Saved sites
│   ├── hazardScans.ts         # AI detection
│   ├── educationalContent.ts  # Educational content
│   ├── users.ts               # User management
│   ├── exports.ts             # PDF/CSV export
│   └── __tests__/             # Backend tests
│
├── src/
│   ├── app/                   # Expo Router screens
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Home screen
│   │   │   ├── new.tsx        # New exposure form
│   │   │   ├── map.tsx        # Map view
│   │   │   ├── education.tsx  # Educational content
│   │   │   └── profile.tsx    # User profile
│   │   └── _layout.tsx        # Root layout with auth
│   │
│   ├── components/            # Reusable components
│   │   ├── common/            # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── exposure/          # Exposure-specific
│   │   │   ├── ExposureCard.tsx
│   │   │   ├── ExposureForm.tsx
│   │   │   ├── PhotoCapture.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── HazardScanResult.tsx
│   │   └── lazy/              # Lazy-loaded components
│   │       └── index.ts
│   │
│   ├── constants/             # Configuration
│   │   ├── config.ts          # App config
│   │   ├── theme.ts           # Colors and typography
│   │   └── exposureTypes.ts   # Hazard definitions
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useConvex.ts       # Convex data hooks
│   │   ├── useCamera.ts       # Camera functionality
│   │   ├── useLocation.ts     # GPS tracking
│   │   ├── useVoice.ts        # Voice recognition
│   │   └── useExport.ts       # Export functionality
│   │
│   └── utils/                 # Utility functions
│       ├── performance.ts     # Performance monitoring
│       ├── accessibility.ts   # A11y helpers
│       ├── lazyLoad.tsx       # Code splitting
│       └── productionMonitoring.ts  # Production tracking
│
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── USER_MANUAL.md
│   ├── DEVELOPER_ONBOARDING.md (this file)
│   ├── ACCESSIBILITY_AUDIT.md
│   ├── PERFORMANCE_BASELINE.md
│   └── CODE_SPLITTING_GUIDE.md
│
├── __tests__/                 # Frontend tests
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── assets/                    # Static assets
│   ├── icon.png              # App icon
│   ├── splash.png            # Splash screen
│   └── adaptive-icon.png     # Android adaptive icon
│
├── .env.local                # Environment variables (git-ignored)
├── .env.example              # Example env file
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── jest.config.js            # Jest test config
├── .eslintrc.js              # ESLint rules
├── .prettierrc               # Prettier config
└── README.md                 # Project overview
```

---

## Tech Stack Overview

### Frontend

**React Native + Expo SDK 54**
- Cross-platform mobile framework
- Hot reloading for fast development
- Native API access (camera, location, etc.)
- Managed workflow (no native code needed)

**TypeScript 5.x**
- Type safety
- Better IDE support
- Catch errors at compile time

**React Native Paper**
- Material Design UI components
- Pre-built, accessible components
- Theme support

**Expo Router**
- File-based routing
- Type-safe navigation
- Automatic deep linking

### Backend

**Convex**
- Serverless backend
- Real-time data synchronization
- TypeScript-first
- Automatic caching
- Built-in authentication integration

### Authentication

**Clerk**
- User authentication
- Email/password login
- Social logins (future)
- User management dashboard

### AI/ML

**OpenAI GPT-4 Vision API**
- Hazard detection from photos
- Natural language processing
- Image analysis

### Maps

**react-native-maps**
- Native map components
- Marker clustering
- Custom styling

### Storage

**Convex File Storage**
- Photo storage
- Automatic CDN distribution
- Secure URLs

**AsyncStorage**
- Local app data
- Offline support

---

## Running the App

### Start Development Server

```bash
# Start Expo dev server
npm start

# Or specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser (preview only)
```

### Development Server Commands

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### Run on Physical Device

**iOS:**
1. Install **Expo Go** from App Store
2. Scan QR code from terminal
3. App loads on your device

**Android:**
1. Install **Expo Go** from Play Store
2. Scan QR code from terminal
3. App loads on your device

### Troubleshooting Common Issues

**Port already in use:**
```bash
# Kill process on port 8081
npx kill-port 8081

# Or use different port
npx expo start --port 8082
```

**Metro bundler cache issues:**
```bash
# Clear cache and restart
npx expo start --clear
```

**iOS build fails:**
```bash
# Clean iOS build
cd ios && pod install && cd ..
npx expo start
```

---

## Development Workflow

### 1. Pick a Task

Check project management board for:
- **Good First Issues** - For new developers
- **Bug Fixes** - Squash bugs
- **Features** - New functionality
- **Refactoring** - Code improvements

### 2. Create Feature Branch

```bash
# Always branch from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bugs
git checkout -b fix/bug-description
```

### 3. Make Changes

```typescript
// 1. Update backend schema if needed (convex/schema.ts)
// 2. Add/update Convex functions (convex/*.ts)
// 3. Create/modify frontend components (src/components/)
// 4. Add hooks if needed (src/hooks/)
// 5. Update screens (src/app/)
```

### 4. Test Your Changes

```bash
# Run tests
npm test

# Run specific test file
npm test ExposureCard

# Run with coverage
npm test -- --coverage

# Type check
npm run type-check

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add AI hazard detection to photos"

# Or for bugs
git commit -m "fix: resolve camera permission issue on Android"
```

**Commit Message Format:**
```
<type>: <description>

[optional body]
[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### 6. Push and Create Pull Request

```bash
# Push branch
git push origin feature/your-feature-name

# Create PR on GitHub
# - Fill in PR template
# - Request review from team
# - Link related issue
```

### 7. Code Review

- Address reviewer feedback
- Make requested changes
- Push updates to same branch
- PR automatically updates

### 8. Merge

Once approved:
- Squash and merge (preferred)
- Or merge commit
- Delete feature branch after merge

---

## Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types
interface ExposureFormProps {
  onSubmit: (data: ExposureData) => void;
  initialData?: ExposureData;
}

// ❌ Bad: Implicit any
function handleSubmit(data: any) {
  // ...
}

// ✅ Good: Use const for immutable
const MAX_PHOTOS = 5;

// ❌ Bad: Use let for constants
let MAX_PHOTOS = 5;

// ✅ Good: Destructure props
function ExposureCard({ exposure, onPress }: ExposureCardProps) {
  // ...
}

// ❌ Bad: Use props object
function ExposureCard(props: ExposureCardProps) {
  const exposure = props.exposure;
  // ...
}
```

### React Components

```typescript
// ✅ Good: Functional components with hooks
import React, { useState, useEffect } from 'react';

export function ExposureForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<ExposureData>({});

  useEffect(() => {
    // Side effects here
  }, []);

  return (
    <View>
      {/* JSX here */}
    </View>
  );
}

// ❌ Bad: Class components (avoid for new code)
class ExposureForm extends React.Component {
  // ...
}

// ✅ Good: Memoize expensive components
export const ExposureCard = React.memo(function ExposureCard(props) {
  // ...
}, (prev, next) => {
  return prev.exposure._id === next.exposure._id;
});
```

### Naming Conventions

```typescript
// Components: PascalCase
export function ExposureCard() {}

// Functions: camelCase
function calculateDuration() {}

// Constants: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

// Hooks: camelCase with 'use' prefix
function useExposureData() {}

// Types/Interfaces: PascalCase
interface ExposureData {}
type ExposureType = 'silica_dust' | 'asbestos_a';

// Files: camelCase for utils, PascalCase for components
// utils/formatDate.ts
// components/ExposureCard.tsx
```

### Code Organization

```typescript
// ✅ Good: Organize imports
// 1. React
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party
import { useQuery, useMutation } from 'convex/react';
import { Button } from 'react-native-paper';

// 3. Local
import { ExposureCard } from '@components/exposure/ExposureCard';
import { formatDate } from '@utils/formatDate';
import { api } from '@/convex/_generated/api';

// ❌ Bad: Mixed order
import { formatDate } from '@utils/formatDate';
import React from 'react';
import { Button } from 'react-native-paper';
```

### Comments

```typescript
// ✅ Good: Explain "why", not "what"
// Use Haversine formula for accurate distance on sphere
const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);

// ❌ Bad: State the obvious
// Get exposure by ID
const exposure = await ctx.db.get(id);

// ✅ Good: Document complex logic
/**
 * Calculates exposure duration score for risk assessment.
 * Score = (hours * 60 + minutes) * severity_multiplier
 *
 * Severity multipliers:
 * - low: 1.0
 * - medium: 1.5
 * - high: 2.0
 */
function calculateRiskScore(exposure: Exposure): number {
  // ...
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test ExposureCard.test
```

### Writing Tests

**Component Tests:**

```typescript
// __tests__/components/ExposureCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExposureCard } from '@components/exposure/ExposureCard';

describe('ExposureCard', () => {
  const mockExposure = {
    _id: '123',
    exposureType: 'silica_dust',
    timestamp: Date.now(),
    // ... other required fields
  };

  it('renders exposure type correctly', () => {
    const { getByText } = render(
      <ExposureCard exposure={mockExposure} />
    );

    expect(getByText('Silica Dust')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ExposureCard exposure={mockExposure} onPress={onPress} />
    );

    fireEvent.press(getByTestId('exposure-card'));
    expect(onPress).toHaveBeenCalledWith(mockExposure._id);
  });
});
```

**Hook Tests:**

```typescript
// __tests__/hooks/useExposureData.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useExposureData } from '@hooks/useExposureData';

describe('useExposureData', () => {
  it('fetches exposure data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useExposureData('exposure-id')
    );

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
```

**Backend Tests:**

```typescript
// convex/__tests__/exposures.test.ts
import { convexTest } from 'convex-test';
import { api } from '../_generated/api';
import schema from '../schema';

describe('exposures', () => {
  it('creates new exposure', async () => {
    const t = convexTest(schema);

    // Create test user
    const userId = await t.mutation(api.users.create, {
      email: 'test@example.com',
      name: 'Test User',
    });

    // Create exposure
    const exposureId = await t.mutation(api.exposures.create, {
      userId,
      exposureType: 'silica_dust',
      // ... other required fields
    });

    expect(exposureId).toBeDefined();

    // Verify exposure was created
    const exposure = await t.query(api.exposures.get, { id: exposureId });
    expect(exposure.exposureType).toBe('silica_dust');
  });
});
```

---

## Common Tasks

### Adding a New Exposure Type

1. **Update Schema** (`convex/schema.ts`)
   - Add new type to validation

2. **Update Constants** (`src/constants/exposureTypes.ts`)
   ```typescript
   export const EXPOSURE_TYPES = {
     // ... existing types
     NEW_TYPE: {
       label: 'New Hazard',
       icon: '⚠️',
       color: '#FF5722',
       description: 'Description of new hazard',
     },
   };
   ```

3. **Update Validation** (`convex/exposures.ts`)
   ```typescript
   const validTypes = [
     // ... existing types
     'new_type',
   ];
   ```

4. **Update AI Prompts** (`convex/hazardScans.ts`)
   - Add new type to AI detection system prompt

5. **Test** - Create exposure with new type

### Adding a New Screen

1. **Create Screen File** (`src/app/newScreen.tsx`)
   ```typescript
   import React from 'react';
   import { View, Text } from 'react-native';

   export default function NewScreen() {
     return (
       <View>
         <Text>New Screen</Text>
       </View>
     );
   }
   ```

2. **Add Navigation** (if tab)
   - Update `src/app/(tabs)/_layout.tsx`
   - Add tab icon and label

3. **Test Navigation** - Verify screen loads

### Adding a New Component

1. **Create Component File** (`src/components/common/NewComponent.tsx`)
   ```typescript
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   interface NewComponentProps {
     title: string;
   }

   export function NewComponent({ title }: NewComponentProps) {
     return (
       <View style={styles.container}>
         <Text>{title}</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       padding: 16,
     },
   });
   ```

2. **Write Tests** (`__tests__/components/NewComponent.test.tsx`)

3. **Use in Screen**
   ```typescript
   import { NewComponent } from '@components/common/NewComponent';
   ```

### Adding a Backend Function

1. **Define Function** (`convex/yourModule.ts`)
   ```typescript
   import { v } from 'convex/values';
   import { query, mutation } from './_generated/server';

   export const yourFunction = mutation({
     args: {
       param: v.string(),
     },
     handler: async (ctx, args) => {
       // Your logic here
       return result;
     },
   });
   ```

2. **Use in Frontend**
   ```typescript
   import { useMutation } from 'convex/react';
   import { api } from '@/convex/_generated/api';

   const yourFunction = useMutation(api.yourModule.yourFunction);
   const result = await yourFunction({ param: 'value' });
   ```

---

## Debugging

### React Native Debugger

```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# In app, shake device and select "Debug"
```

### Console Logs

```typescript
// ✅ Development only
if (__DEV__) {
  console.log('Debug info:', data);
}

// ❌ Never in production
console.log('User data:', sensitiveData);
```

### Convex Dashboard

```bash
# Open Convex dashboard
npx convex dashboard

# View:
# - Database tables
# - Function logs
# - Performance metrics
# - Recent queries
```

### Performance Profiling

```typescript
// Use built-in performance monitor
import { performanceMonitor } from '@utils/performance';

// Track screen load
performanceMonitor.trackScreenLoad('HomeScreen');

// Track custom operation
performanceMonitor.startMeasure('fetchExposures');
// ... do work
performanceMonitor.endMeasure('fetchExposures');
```

### Common Debug Scenarios

**App crashes on startup:**
1. Check console for errors
2. Verify environment variables
3. Clear Metro cache: `npx expo start --clear`
4. Reinstall dependencies: `rm -rf node_modules && npm install`

**Data not syncing:**
1. Check Convex dashboard logs
2. Verify authentication state
3. Check network requests in debugger
4. Ensure Convex dev server is running

**UI not updating:**
1. Check React state updates
2. Verify props passing correctly
3. Use React DevTools
4. Check memoization dependencies

---

## Contributing

### Before Submitting PR

- [ ] Code follows style guide
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Tested on iOS and Android
- [ ] Checked accessibility
- [ ] Verified performance impact

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested offline mode

## Screenshots
(if UI changes)

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console warnings
```

### Code Review Process

1. **Automated Checks** run first (CI/CD)
2. **Peer Review** by 1-2 developers
3. **Address Feedback** and push updates
4. **Approval** from reviewer
5. **Merge** to main branch

---

## Resources

### Documentation

- [Project README](../README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [User Manual](USER_MANUAL.md)

### Tech Stack Docs

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Convex](https://docs.convex.dev/)
- [Clerk](https://clerk.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

### Learning Resources

- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [Convex Quickstart](https://docs.convex.dev/quickstart)

---

## Getting Help

### Internal Team

- **Slack:** #waldo-health-dev
- **Daily Standup:** 9:00 AM NZST
- **Code Reviews:** GitHub Pull Requests
- **Questions:** Tag @team in Slack

### External Resources

- **Stack Overflow:** Tag `react-native`, `expo`, `convex`
- **Expo Forums:** [forums.expo.dev](https://forums.expo.dev/)
- **Convex Discord:** [discord.gg/convex](https://discord.gg/convex)

### Reporting Issues

```markdown
**Bug Report Template:**

## Description
Clear description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: iOS 17.0 / Android 13
- Device: iPhone 14 / Pixel 5
- App Version: 1.0.0

## Screenshots
(if applicable)

## Logs
```
(paste relevant logs)
```
```

---

## Onboarding Checklist

### Week 1: Setup

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Run app on iOS simulator
- [ ] Run app on Android emulator
- [ ] Explore codebase structure
- [ ] Read all documentation
- [ ] Set up VS Code extensions
- [ ] Join team Slack channels
- [ ] Attend team standup

### Week 2: First Tasks

- [ ] Fix a "good first issue"
- [ ] Create your first pull request
- [ ] Get PR reviewed and merged
- [ ] Add a test for existing feature
- [ ] Review another developer's PR
- [ ] Pair program with team member

### Week 3: Deeper Dive

- [ ] Add a new component
- [ ] Write Convex backend function
- [ ] Integrate frontend with backend
- [ ] Debug a production issue
- [ ] Optimize a slow component
- [ ] Write comprehensive tests

### Week 4: Independence

- [ ] Pick and complete a feature task
- [ ] Lead code review for junior dev
- [ ] Identify and fix a bug
- [ ] Contribute to documentation
- [ ] Help onboard next new developer

---

## Tips for Success

### 1. Read the Code

Best way to learn the codebase is to read it. Start with:
- `src/app/(tabs)/index.tsx` - Home screen
- `convex/exposures.ts` - Core backend logic
- `src/components/exposure/ExposureCard.tsx` - Common component

### 2. Ask Questions

No question is too small. Better to ask than guess wrong.

### 3. Use the Debugger

Don't rely on console.log. Learn to use breakpoints and step through code.

### 4. Test Everything

Before pushing, test on both iOS and Android. Test offline mode.

### 5. Keep Learning

- Follow React Native blog
- Watch Expo YouTube channel
- Read Convex examples
- Study team's past PRs

### 6. Pair Program

Best way to learn team patterns and get unstuck quickly.

### 7. Document as You Go

If something confused you, improve the docs for the next person.

### 8. Focus on Quality

Better to ship one well-tested feature than five buggy ones.

---

**Welcome to the team!**

We're excited to have you contributing to Waldo Health. Remember, everyone was new once. Don't hesitate to ask questions and lean on your teammates.

Let's build something great together! 🚀

---

**Questions?** Ask in #waldo-health-dev on Slack

---

**Last Updated:** November 7, 2025
**Version:** 1.0
**Phase:** 9 (T130)
