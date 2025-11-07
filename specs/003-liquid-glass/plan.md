# Implementation Plan: Liquid Glass Visual Design

**Branch**: `003-liquid-glass` | **Date**: 2025-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-liquid-glass/spec.md`

## Summary

Transform the Waldo Health app with iOS Liquid Glass design patterns by implementing translucent glass-like surfaces with dynamic blur effects across navigation bars, cards, buttons, and modals. Primary technical approach uses `expo-blur` for immediate cross-platform implementation with planned migration to `expo-glass-effect` when iOS 26 adoption reaches 30%+ (estimated Q3 2026).

**Primary Technical Approach**: Create reusable `<GlassEffect>` wrapper component using `expo-blur` library, with platform-aware fallbacks for Android (opaque backgrounds) and iOS accessibility modes (Reduce Transparency). Glass effects integrated via preset configurations for common UI patterns (navigation, cards, modals) while maintaining WCAG 2.1 AA accessibility compliance and 60fps performance.

## Technical Context

**Language/Version**: TypeScript 5.x with React Native 0.81.5 via Expo SDK 54
**Primary Dependencies**:
- `expo-blur@15.0.7` (primary glass effect library)
- `@expo/vector-icons` (existing - icon support)
- `react-native@0.81.5` (existing - platform APIs)
- Existing theme system from 002-ui-polish feature

**Storage**: N/A (no data persistence - configuration only)
**Testing**: Jest + React Native Testing Library + Detox (E2E)
**Target Platform**: iOS 13+ (primary), Android 10+ (fallback)
**Project Type**: Mobile (React Native/Expo) - existing codebase enhancement
**Performance Goals**:
- Maintain 60fps during scroll with glass effects active
- <16ms render time per glass component
- Maximum 5 simultaneous glass views per screen

**Constraints**:
- WCAG 2.1 AA accessibility compliance (4.5:1 contrast minimum)
- iOS "Reduce Transparency" accessibility setting support required
- No Xcode 26 requirement (using expo-blur, not iOS 26 API)
- Android fallback must maintain functional parity without blur

**Scale/Scope**:
- ~8 main screens to enhance
- ~5 new components (GlassEffect, GlassCard, GlassModal, GlassNavBar, GlassButton)
- ~28 functional requirements across visual, technical, accessibility, and performance categories
- Single release deployment (no phased rollout)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality First** | ✅ PASS | TypeScript strict mode enforced, all components strongly typed, follows existing code patterns |
| **II. Test-Driven Development** | ✅ PASS | Unit tests for components, integration tests for accessibility, E2E tests for visual regression |
| **III. UX Consistency** | ✅ PASS | Primary goal of feature - enhances visual consistency, maintains WCAG 2.1 AA accessibility |
| **IV. Performance Standards** | ✅ PASS | 60fps target, <16ms render time, profiled on iPhone 12 minimum, GPU acceleration utilized |
| **V. Observability** | ✅ PASS | Performance monitoring for frame rate, error tracking for accessibility violations |

**Quality Gates Applicable**:
- Gate 2: Code Review (peer review for UI changes, accessibility validation)
- Gate 3: Automated Tests (unit + integration + visual regression)
- Gate 4: Performance Audit (frame rate validation, GPU usage monitoring)
- Gate 6: Accessibility Audit (VoiceOver testing, contrast validation, Reduce Transparency support)
- Gate 7: Staging Validation (manual QA on real devices, iOS + Android testing)

**Decision**: ✅ **ALL GATES PASSED** - Proceed to Phase 0 research

### Post-Design Check

After Phase 1 design artifacts created, re-validated against constitution:

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality First** | ✅ PASS | Component contracts defined, TypeScript interfaces documented, prop validation specified |
| **II. Test-Driven Development** | ✅ PASS | Test requirements defined in contracts, coverage targets set (80% minimum) |
| **III. UX Consistency** | ✅ PASS | Preset configurations ensure consistent glass styling across app |
| **IV. Performance Standards** | ✅ PASS | Performance constraints documented (5 instance limit, no nesting, rasterization for static) |
| **V. Observability** | ✅ PASS | Debug logging for capability detection, performance profiling in development mode |

**Decision**: ✅ **ALL GATES PASSED** - Ready for Phase 2 (/speckit.tasks)

## Project Structure

### Documentation (this feature)

```text
specs/003-liquid-glass/
├── plan.md              # This file - Implementation plan
├── research.md          # Phase 0 - Library evaluation and best practices
├── data-model.md        # Phase 1 - Glass configuration models and prop interfaces
├── quickstart.md        # Phase 1 - Developer guide with usage examples
├── contracts/           # Phase 1 - Component behavior contracts
│   └── GlassEffect.contract.ts
└── tasks.md             # Phase 2 - Generated by /speckit.tasks (NOT yet created)
```

### Source Code (repository root)

This is a mobile enhancement to existing React Native/Expo codebase:

```text
src/
├── components/
│   ├── common/
│   │   ├── GlassEffect.tsx       # [NEW] Core wrapper component
│   │   ├── GlassCard.tsx         # [NEW] Card with glass styling
│   │   ├── GlassModal.tsx        # [NEW] Modal with layered glass
│   │   ├── GlassNavBar.tsx       # [NEW] Navigation bar with blur
│   │   ├── GlassButton.tsx       # [NEW] Button with glass surface
│   │   ├── Button.tsx            # [ENHANCE] Add glass variant
│   │   ├── Card.tsx              # [ENHANCE] Add glass variant
│   │   └── EmptyState.tsx        # [ENHANCE] Glass icon containers
│   │
│   ├── exposure/
│   │   ├── ExposureCard.tsx      # [ENHANCE] Apply glass effect
│   │   ├── FilterBar.tsx         # [ENHANCE] Glass modal overlay
│   │   └── SearchBar.tsx         # [ENHANCE] Glass styling option
│   │
│   └── forms/
│       ├── FormProgress.tsx      # [ENHANCE] Glass background option
│       └── InlineError.tsx       # No changes (text-only)
│
├── hooks/
│   ├── useBlurSupport.ts         # [NEW] Detect blur capability
│   ├── useGlassTheme.ts          # [NEW] Glass preset management
│   └── useHaptics.ts             # [EXISTING] Used with glass interactions
│
├── constants/
│   ├── theme.ts                  # [ENHANCE] Add glassColors section
│   ├── glassConfig.ts            # [NEW] Glass presets and intensity settings
│   └── icons.ts                  # [EXISTING] Icon support
│
├── utils/
│   └── accessibility.ts          # [NEW] Contrast validation utilities
│
└── app/(tabs)/
    ├── _layout.tsx               # [ENHANCE] Glass tab bar
    ├── index.tsx                 # [ENHANCE] Glass stat cards
    ├── list.tsx                  # [ENHANCE] Glass exposure cards
    ├── new.tsx                   # [ENHANCE] Glass form containers
    ├── map.tsx                   # [ENHANCE] Glass filter overlay
    ├── export.tsx                # [ENHANCE] Glass modal
    ├── education.tsx             # [ENHANCE] Glass content cards
    └── profile.tsx               # [ENHANCE] Glass settings cards

__tests__/
├── unit/
│   ├── components/
│   │   ├── GlassEffect.test.tsx         # [NEW] Component unit tests
│   │   ├── GlassCard.test.tsx           # [NEW] Card component tests
│   │   └── GlassModal.test.tsx          # [NEW] Modal component tests
│   │
│   └── hooks/
│       ├── useBlurSupport.test.ts       # [NEW] Capability detection tests
│       └── useGlassTheme.test.ts        # [NEW] Preset management tests
│
├── integration/
│   ├── glass-accessibility.test.ts      # [NEW] VoiceOver + Reduce Transparency
│   ├── glass-performance.test.ts        # [NEW] Frame rate validation
│   └── glass-theme.test.ts              # [NEW] Theme integration tests
│
└── e2e/
    ├── glass-visual-regression.e2e.ts   # [NEW] Screenshot comparison tests
    └── glass-interactions.e2e.ts        # [NEW] User interaction flows
```

**Structure Decision**: Mobile React Native/Expo project structure (Option 3 equivalent). All code in `src/` following existing conventions. New components in `components/common/`, new hooks in `hooks/`, existing screens enhanced in `app/(tabs)/`. Tests mirror source structure with unit, integration, and E2E separation.

## Complexity Tracking

> **No constitution violations** - This section not applicable.

All constitution principles are satisfied:
- ✅ Code Quality: TypeScript strict mode, strong typing, component contracts
- ✅ TDD: Unit/integration/E2E tests planned with 80%+ coverage target
- ✅ UX Consistency: Enhances visual consistency while maintaining accessibility
- ✅ Performance: 60fps target with profiling and optimization strategies
- ✅ Observability: Performance monitoring and error tracking included

## Notes & Context

- This feature enhances visual design only; no functional changes to app behavior
- Glass effects are purely aesthetic - core functionality works identically with or without blur
- Primary target is iOS users; Android users receive graceful degradation to opaque backgrounds
- Performance is critical - visual polish must not compromise app responsiveness
- Accessibility is non-negotiable - all glass effects have accessible fallbacks
- Two-phase approach: expo-blur now, expo-glass-effect when iOS 26 adoption grows
- All Phase 0 and Phase 1 artifacts complete - ready for /speckit.tasks command
