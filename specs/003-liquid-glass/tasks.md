# Implementation Tasks: Liquid Glass Visual Design

**Feature**: 003-liquid-glass
**Branch**: `003-liquid-glass`
**Generated**: 2025-01-07
**Total Tasks**: 55

## Task Overview

This document breaks down the Liquid Glass visual design implementation into actionable tasks organized by phases and mapped to user scenarios. Tasks follow dependency order and identify opportunities for parallel execution.

### Progress Summary

- **Phase 0 - Setup**: 0/3 tasks complete (0%)
- **Phase 1 - Foundation**: 0/12 tasks complete (0%)
- **Phase 2 - Navigation**: 0/8 tasks complete (0%)
- **Phase 3 - Cards**: 0/6 tasks complete (0%)
- **Phase 4 - Forms**: 0/8 tasks complete (0%)
- **Phase 5 - Modals**: 0/6 tasks complete (0%)
- **Phase 6 - Accessibility**: 0/6 tasks complete (0%)
- **Phase 7 - Testing**: 0/6 tasks complete (0%)

**Overall Progress**: 0/55 tasks complete (0%)

### User Scenario Mapping

- **US1**: Home Screen Glass Navigation → Tasks T004-T011 (Phase 2)
- **US2**: Exposure Card List with Glass Effects → Tasks T012-T017 (Phase 3)
- **US3**: Form Inputs with Glass Styling → Tasks T018-T025 (Phase 4)
- **US4**: Modal Overlays with Layered Glass → Tasks T026-T031 (Phase 5)
- **US5**: Accessibility with Glass Effects → Tasks T032-T037 (Phase 6)

### Functional Requirement Coverage

- **Visual Design** (FR-001 to FR-010): Tasks T004-T031
- **Technical** (FR-011 to FR-015): Tasks T001-T003, T012-T017
- **Accessibility** (FR-016 to FR-020): Tasks T032-T037
- **Performance** (FR-021 to FR-024): Tasks T038-T043
- **Interaction** (FR-025 to FR-028): Tasks T044-T049

---

## Phase 0: Setup & Dependencies

**Goal**: Install libraries and configure project infrastructure

**Dependencies**: None (can start immediately)

**Parallel Execution**: All tasks in this phase can run in parallel

### T001 [P0] Install expo-blur library

**Description**: Install `expo-blur@15.0.7` as primary glass effect library

**Files**: `package.json`, `package-lock.json`

**Steps**:
1. Run `npx expo install expo-blur@15.0.7`
2. Verify installation in package.json
3. Test import: `import { BlurView } from 'expo-blur'`
4. Run `npm start` to confirm no errors

**Acceptance Criteria**:
- expo-blur@15.0.7 added to dependencies
- No build errors after installation
- BlurView imports successfully in test file

**Estimated Effort**: 15 minutes

**Related Requirements**: FR-011 (platform-native glass materials)

---

### T002 [P0] Create glass configuration constants

**Description**: Define glass effect presets and intensity settings in new config file

**Files**: `src/constants/glassConfig.ts` [NEW]

**Steps**:
1. Create `src/constants/glassConfig.ts`
2. Import colors from theme: `import { colors } from './theme'`
3. Define GlassPreset type and preset configurations
4. Export presets object and utility functions
5. Add JSDoc comments for each preset

**Acceptance Criteria**:
- All 5 presets defined (navigation, card, modal, button, input)
- Each preset includes intensity, tint, fallbackColor, cornerRadius
- Fallback colors reference theme tokens
- TypeScript interfaces exported

**Estimated Effort**: 30 minutes

**Related Requirements**: FR-013 (configurable blur intensity)

**Code Template**:
```typescript
import { colors } from './theme';

export type GlassTint = 'light' | 'dark' | 'default';
export type GlassPresetName = 'navigation' | 'card' | 'modal' | 'button' | 'input';

export interface GlassEffectConfig {
  intensity: number;  // 0-100
  tint: GlassTint;
  fallbackColor: string;
  cornerRadius: number;
}

export const glassPresets: Record<GlassPresetName, GlassEffectConfig> = {
  navigation: {
    intensity: 85,
    tint: 'light',
    fallbackColor: colors.surface,
    cornerRadius: 0,
  },
  // ... other presets
};
```

---

### T003 [P0] Extend theme with glass color tokens

**Description**: Add glassColors section to existing theme for glass-specific tints

**Files**: `src/constants/theme.ts` [ENHANCE]

**Steps**:
1. Open `src/constants/theme.ts`
2. Add new `glassColors` export after existing colors
3. Define glassLight, glassDark, glassPrimary configurations
4. Document contrast ratios in comments
5. Export glassColors alongside existing theme exports

**Acceptance Criteria**:
- glassColors object added to theme
- Each glass color includes tint, fallback, textColor
- Contrast ratios documented (must be >= 4.5:1)
- No breaking changes to existing theme usage

**Estimated Effort**: 20 minutes

**Related Requirements**: FR-010 (light/dark scheme support), FR-016 (contrast ratio)

---

## Phase 1: Foundation Components

**Goal**: Create core glass effect components and utility hooks

**Dependencies**: Phase 0 must be complete

**Parallel Execution**: T005-T007 can run in parallel after T004 completes

### T004 [P1] [US1] Create GlassEffect wrapper component

**Description**: Build core `<GlassEffect>` component using expo-blur with platform detection

**Files**: `src/components/common/GlassEffect.tsx` [NEW]

**Steps**:
1. Create `src/components/common/GlassEffect.tsx`
2. Import BlurView from expo-blur
3. Implement GlassEffectProps interface from contract
4. Add platform detection (iOS vs Android)
5. Implement preset loading from glassConfig
6. Add reducedTransparencyFallbackColor support
7. Handle enabled={false} for testing
8. Memoize component with React.memo
9. Add comprehensive JSDoc comments

**Acceptance Criteria**:
- Component renders BlurView on iOS
- Component renders View with fallback on Android
- All props from GlassEffectProps interface supported
- Preset prop overrides manual intensity/tint/fallback
- Fallback color required (throws error if missing)
- Intensity clamped to 0-100 range
- testID prop supported for automation

**Estimated Effort**: 2 hours

**Related Requirements**: FR-011 (platform-native materials), FR-012 (graceful degradation)

**Code Template**:
```typescript
import React, { useMemo } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassPresets, GlassPresetName, GlassTint } from '@constants/glassConfig';
import { colors } from '@constants/theme';

export interface GlassEffectProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: GlassTint;
  fallbackColor?: string;
  style?: ViewStyle;
  enabled?: boolean;
  preset?: GlassPresetName;
  testID?: string;
}

export const GlassEffect = React.memo<GlassEffectProps>(({
  children,
  intensity,
  tint,
  fallbackColor,
  style,
  enabled = true,
  preset,
  testID,
}) => {
  // Implementation
});
```

---

### T005 [P1] Create useBlurSupport capability detection hook

**Description**: Hook to detect device blur capability and accessibility settings

**Files**: `src/hooks/useBlurSupport.ts` [NEW]

**Steps**:
1. Create `src/hooks/useBlurSupport.ts`
2. Import Platform, AccessibilityInfo from react-native
3. Check iOS version and platform
4. Detect "Reduce Transparency" setting
5. Return BlurCapability object
6. Add effect hook for accessibility change listener
7. Cleanup listener on unmount

**Acceptance Criteria**:
- Hook returns BlurCapability with all fields
- liquidGlass detection checks for iOS 26+
- standardBlur true for iOS 13+
- fallbackOnly true for Android
- reduceTransparencyEnabled updates on setting change
- Hook rerenders when accessibility setting changes

**Estimated Effort**: 45 minutes

**Related Requirements**: FR-012 (graceful degradation), FR-017 (Reduce Transparency)

---

### T006 [P1] Create useGlassTheme preset management hook

**Description**: Hook for loading and managing glass presets with theme integration

**Files**: `src/hooks/useGlassTheme.ts` [NEW]

**Steps**:
1. Create `src/hooks/useGlassTheme.ts`
2. Import glassPresets from constants
3. Create getPreset function with validation
4. Add mergeWithCustom function for prop overrides
5. Memoize preset results
6. Add error handling for invalid preset names

**Acceptance Criteria**:
- Hook accepts preset name and returns GlassEffectConfig
- Manual props override preset values
- Invalid preset name throws descriptive error
- Hook memoizes results to prevent rerenders
- TypeScript types enforce valid preset names

**Estimated Effort**: 30 minutes

**Related Requirements**: FR-013 (configurable intensity)

---

### T007 [P1] Create accessibility contrast validation utility

**Description**: Utility functions to validate contrast ratios for glass surfaces

**Files**: `src/utils/accessibility.ts` [NEW]

**Steps**:
1. Create `src/utils/accessibility.ts`
2. Implement parseColor function (hex, rgba, named colors)
3. Implement calculateLuminance function
4. Implement calculateContrastRatio function
5. Create validateGlassContrast function
6. Add WCAG level checking (AA = 4.5:1, AAA = 7:1)
7. Export validation utilities

**Acceptance Criteria**:
- Parses hex, rgba, and named CSS colors
- Calculates correct luminance per WCAG formula
- Calculates contrast ratio accurately
- validateGlassContrast returns isAccessible boolean and ratio number
- Minimum 4.5:1 ratio required for AA compliance

**Estimated Effort**: 1 hour

**Related Requirements**: FR-016 (4.5:1 contrast minimum)

---

### T008 [P1] Add GlassCard component

**Description**: Card component with glass surface styling

**Files**: `src/components/common/GlassCard.tsx` [NEW]

**Steps**:
1. Create `src/components/common/GlassCard.tsx`
2. Wrap GlassEffect with TouchableOpacity
3. Implement GlassCardProps interface
4. Add preset='card' as default
5. Support onPress and onLongPress
6. Add disabled state with opacity reduction
7. Include accessibility labels
8. Use haptics from useHaptics on press

**Acceptance Criteria**:
- Renders GlassEffect with card preset
- Supports touch interactions
- Disabled state prevents touches
- Haptic feedback on press
- Accessibility props passed through

**Estimated Effort**: 1 hour

**Related Requirements**: FR-002 (card glass effects), FR-025 (visual feedback)

---

### T009 [P1] Add GlassButton component

**Description**: Button component with glass styling for primary/secondary actions

**Files**: `src/components/common/GlassButton.tsx` [NEW]

**Steps**:
1. Create `src/components/common/GlassButton.tsx`
2. Wrap GlassEffect in TouchableOpacity
3. Support variant prop (primary, secondary, destructive)
4. Map variants to intensity and tint
5. Add loading state with ActivityIndicator
6. Include icon support (left/right)
7. Use haptics from useHaptics
8. Add accessibility role="button"

**Acceptance Criteria**:
- Three variants: primary (intense), secondary (subtle), destructive (red tint)
- Loading state disables interaction
- Icons positioned correctly
- Haptic feedback on press
- Minimum 48pt touch target

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-003 (primary buttons), FR-004 (secondary buttons)

---

### T010 [P1] Add GlassModal component

**Description**: Modal component with layered glass effects

**Files**: `src/components/common/GlassModal.tsx` [NEW]

**Steps**:
1. Create `src/components/common/GlassModal.tsx`
2. Use React Native Modal component
3. Add GlassEffect backdrop with modal preset
4. Add GlassEffect content with card preset
5. Support title prop with header
6. Add close button with X icon
7. Implement animationType (slide, fade)
8. Add onClose callback

**Acceptance Criteria**:
- Backdrop uses dark glass blur (modal preset)
- Content uses light glass (card preset)
- Smooth enter/exit animations
- Tapping backdrop dismisses modal
- Title header optional

**Estimated Effort**: 2 hours

**Related Requirements**: FR-006 (modal overlays), US4 (layered glass)

---

### T011 [P1] Add GlassNavBar component

**Description**: Navigation bar component with translucent glass

**Files**: `src/components/common/GlassNavBar.tsx` [NEW]

**Steps**:
1. Create `src/components/common/GlassNavBar.tsx`
2. Use GlassEffect with navigation preset
3. Position absolutely at top of screen
4. Support title, leftAction, rightAction props
5. Handle safe area insets
6. Add blur intensifying on scroll (optional)
7. Include back button support

**Acceptance Criteria**:
- Fixed at top with safe area padding
- Blurs content scrolling beneath
- Actions render in correct positions
- Respects safe area on notched devices

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-001 (navigation glass), US1 (glass navigation)

---

### T012 [P1] Update Button component with glass variant

**Description**: Add glass variant to existing Button component

**Files**: `src/components/common/Button.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/common/Button.tsx`
2. Add 'glass' to variant type union
3. Import GlassEffect component
4. Conditionally wrap with GlassEffect when variant='glass'
5. Maintain existing button functionality
6. Update Button tests

**Acceptance Criteria**:
- variant='glass' prop supported
- Glass variant uses GlassButton internally
- No breaking changes to existing variants
- Tests pass for all variants

**Estimated Effort**: 45 minutes

**Related Requirements**: FR-003 (button glass)

---

### T013 [P1] Update Card component with glass variant

**Description**: Add glass variant to existing Card component

**Files**: `src/components/common/Card.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/common/Card.tsx`
2. Add 'glass' to variant type
3. Import GlassEffect
4. Wrap content with GlassEffect when variant='glass'
5. Maintain shadow/elevation for non-glass variants
6. Update Card tests

**Acceptance Criteria**:
- variant='glass' prop supported
- Glass variant uses GlassCard internally
- Existing functionality preserved
- Tests updated and passing

**Estimated Effort**: 45 minutes

**Related Requirements**: FR-002 (card glass)

---

### T014 [P1] Update EmptyState with glass icon containers

**Description**: Add glass effect to icon containers in empty states

**Files**: `src/components/common/EmptyState.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/common/EmptyState.tsx`
2. Import GlassEffect
3. Wrap icon container with GlassEffect
4. Use card preset with subtle intensity
5. Keep text and CTA button unchanged
6. Update EmptyState tests

**Acceptance Criteria**:
- Icon container has glass background
- Text remains fully readable
- CTA button styling unchanged
- Tests passing

**Estimated Effort**: 30 minutes

**Related Requirements**: FR-008 (empty state glass)

---

### T015 [P1] Document component usage in CLAUDE.md

**Description**: Add Liquid Glass component patterns to project documentation

**Files**: `CLAUDE.md` [ENHANCE]

**Steps**:
1. Open `CLAUDE.md`
2. Add new "Liquid Glass Patterns (003-liquid-glass)" section after UI Polish
3. Document GlassEffect usage pattern
4. Show preset examples
5. Document accessibility requirements
6. Add performance best practices
7. Link to quickstart.md

**Acceptance Criteria**:
- New section added to CLAUDE.md
- All glass components documented
- Code examples included
- Links to spec docs provided

**Estimated Effort**: 30 minutes

**Related Requirements**: Documentation

---

## Phase 2: Navigation Glass Effects

**Goal**: Apply glass effects to navigation bars and tab bar

**Dependencies**: Phase 1 complete (T004-T015)

**Parallel Execution**: T016-T019 can run in parallel

### T016 [P2] [US1] Apply glass to bottom tab bar

**Description**: Update tab bar layout to use glass navigation effect

**Files**: `src/app/(tabs)/_layout.tsx` [ENHANCE]

**Steps**:
1. Open `src/app/(tabs)/_layout.tsx`
2. Import GlassEffect component
3. Wrap TabBar with GlassEffect using navigation preset
4. Position absolutely at bottom
5. Ensure tab icons remain readable
6. Test on iOS and Android
7. Verify accessibility with VoiceOver

**Acceptance Criteria**:
- Tab bar uses translucent glass on iOS
- Content scrolls visibly behind tab bar
- Tab icons have 4.5:1 contrast minimum
- Android shows opaque fallback
- VoiceOver announces tabs correctly

**Estimated Effort**: 1 hour

**Related Requirements**: FR-007 (tab bar glass), US1 (navigation)

---

### T017 [P2] [US1] Apply glass to home screen header

**Description**: Add glass effect to home screen header/title area

**Files**: `src/app/(tabs)/index.tsx` [ENHANCE]

**Steps**:
1. Open `src/app/(tabs)/index.tsx`
2. Import GlassNavBar component
3. Replace existing header with GlassNavBar
4. Pass title="Home" prop
5. Add rightAction for potential settings icon
6. Handle scroll to show blur effect
7. Test readability on light and dark backgrounds

**Acceptance Criteria**:
- Header uses glass effect
- Title remains readable (4.5:1 contrast)
- Blur adapts as content scrolls beneath
- Safe area insets respected

**Estimated Effort**: 1 hour

**Related Requirements**: FR-001 (navigation glass), US1

---

### T018 [P2] [US1] Test navigation glass across all tabs

**Description**: Verify glass navigation works on all 5 tab screens

**Files**: `src/app/(tabs)/*.tsx` (all tab screens) [ENHANCE]

**Steps**:
1. Open each tab screen (index, new, map, education, profile)
2. Import GlassNavBar where headers exist
3. Apply consistent glass styling
4. Test scroll behavior on each screen
5. Verify text contrast on all backgrounds
6. Check safe area handling on iPhone notch

**Acceptance Criteria**:
- All tab screens have consistent glass navigation
- Blur effect works during scroll on all screens
- No layout issues on notched devices
- VoiceOver navigation works correctly

**Estimated Effort**: 2 hours

**Related Requirements**: FR-001, US1

---

### T019 [P2] [US1] Add glass to exposure detail header

**Description**: Apply glass effect to exposure detail screen header

**Files**: `src/app/exposure/[id].tsx` [ENHANCE]

**Steps**:
1. Open `src/app/exposure/[id].tsx`
2. Import GlassNavBar component
3. Add navigation bar with back button
4. Include exposure type in title
5. Add rightAction for edit/delete menu
6. Handle scroll parallax effect
7. Test with long exposure titles

**Acceptance Criteria**:
- Header uses glass navigation preset
- Back button navigates correctly
- Title truncates gracefully if too long
- Edit/delete actions work

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-001 (navigation glass)

---

### T020 [P2] [US1] Optimize navigation glass performance

**Description**: Apply performance optimizations to navigation glass instances

**Files**: `src/components/common/GlassNavBar.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/common/GlassNavBar.tsx`
2. Add shouldRasterizeIOS={true} to BlurView
3. Set rasterizationScale={PixelRatio.get()}
4. Memoize component with React.memo
5. Add custom comparison function for props
6. Profile frame rate with React DevTools
7. Test on iPhone 12 (baseline device)

**Acceptance Criteria**:
- Navigation glass renders at 60fps
- Rasterization improves performance
- No unnecessary rerenders
- Frame rate stable during scroll

**Estimated Effort**: 1 hour

**Related Requirements**: FR-021 (smooth performance), FR-023 (hardware acceleration)

---

### T021 [P2] [US1] Add navigation glass unit tests

**Description**: Write unit tests for navigation glass components

**Files**: `__tests__/unit/components/GlassNavBar.test.tsx` [NEW]

**Steps**:
1. Create test file for GlassNavBar
2. Test rendering with different props
3. Test back button callback
4. Test action button rendering
5. Mock BlurView for iOS platform
6. Test fallback for Android platform
7. Test accessibility props

**Acceptance Criteria**:
- Tests cover all GlassNavBar props
- Platform-specific behavior tested
- Accessibility assertions included
- Tests pass on CI

**Estimated Effort**: 1.5 hours

**Related Requirements**: Testing

---

### T022 [P2] [US1] Add navigation glass integration tests

**Description**: Integration tests for navigation glass with theme system

**Files**: `__tests__/integration/glass-navigation.test.ts` [NEW]

**Steps**:
1. Create integration test file
2. Test glass navigation with light theme
3. Test glass navigation with dark theme
4. Test theme switching updates glass tint
5. Test preset loading from config
6. Verify contrast ratios programmatically

**Acceptance Criteria**:
- Tests verify theme integration
- Light/dark mode tested
- Contrast validation automated
- Tests pass on CI

**Estimated Effort**: 1 hour

**Related Requirements**: FR-010 (light/dark support)

---

### T023 [P2] [US1] Add navigation glass visual regression tests

**Description**: E2E screenshot tests for navigation glass appearance

**Files**: `__tests__/e2e/glass-navigation.e2e.ts` [NEW]

**Steps**:
1. Create Detox E2E test file
2. Capture home screen with glass tab bar
3. Capture header blur during scroll
4. Capture navigation on light background
5. Capture navigation on dark background
6. Compare against baseline screenshots
7. Update baselines if intentional changes

**Acceptance Criteria**:
- Baseline screenshots captured for iOS
- Tests detect visual regressions
- Scroll blur effect captured
- Tests run in CI/CD

**Estimated Effort**: 1.5 hours

**Related Requirements**: Testing

---

## Phase 3: Card Glass Effects

**Goal**: Apply glass styling to exposure cards and list items

**Dependencies**: Phase 1 complete

**Parallel Execution**: T024-T026 can run in parallel

### T024 [P2] [US2] Apply glass to exposure cards in list

**Description**: Update ExposureCard component with glass surface

**Files**: `src/components/exposure/ExposureCard.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/exposure/ExposureCard.tsx`
2. Import GlassEffect component
3. Wrap card content with GlassEffect using card preset
4. Maintain existing layout and spacing
5. Ensure text contrast on glass (4.5:1 minimum)
6. Test long press menu still works
7. Add haptic feedback on tap

**Acceptance Criteria**:
- Cards display with glass effect
- All text remains readable
- Long press menu works
- Haptic feedback on interactions
- Android shows opaque fallback

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-002 (card glass), US2 (card list)

---

### T025 [P2] [US2] Apply glass to statistics cards on home

**Description**: Add glass effect to stat cards on home screen

**Files**: `src/app/(tabs)/index.tsx` [ENHANCE]

**Steps**:
1. Open `src/app/(tabs)/index.tsx`
2. Find statistics card rendering
3. Wrap with GlassEffect using card preset
4. Adjust text colors if needed for contrast
5. Ensure icon visibility on glass
6. Test with 0, 1, and many exposures

**Acceptance Criteria**:
- Stat cards use glass effect
- Numbers and labels readable
- Icons visible on glass surface
- Layout responsive

**Estimated Effort**: 1 hour

**Related Requirements**: FR-002 (card glass), US1

---

### T026 [P2] [US2] Optimize card glass performance

**Description**: Limit card glass instances to prevent performance issues

**Files**: `src/app/(tabs)/index.tsx`, `src/components/exposure/ExposureCard.tsx` [ENHANCE]

**Steps**:
1. Add virtualization to exposure list (FlatList)
2. Limit visible glass cards to 5 maximum
3. Use shouldRasterizeIOS for static cards
4. Memoize ExposureCard component
5. Add custom comparison for props
6. Profile with many exposures (50+)
7. Ensure 60fps maintained during scroll

**Acceptance Criteria**:
- Maximum 5 glass cards rendered simultaneously
- FlatList virtualization working
- Frame rate stable during scroll
- No memory leaks with many items

**Estimated Effort**: 2 hours

**Related Requirements**: FR-022 (simultaneous view limit), FR-021 (smooth performance)

---

### T027 [P2] [US2] Add card glass transition animations

**Description**: Smooth glass morph effect when tapping cards

**Files**: `src/components/exposure/ExposureCard.tsx` [ENHANCE]

**Steps**:
1. Import Animated from react-native
2. Create animated value for opacity/scale
3. Animate on press (scale down + opacity)
4. Animate on press out (scale up + opacity)
5. Use haptics during transition
6. Keep animation under 200ms duration
7. Test feels responsive

**Acceptance Criteria**:
- Card scales down slightly on press
- Opacity reduces during press
- Animation smooth (no jank)
- Haptic feedback synchronized
- Transition under 200ms

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-025 (visual feedback), US2

---

### T028 [P2] [US2] Apply glass to empty state card

**Description**: Update empty state component with glass styling

**Files**: `src/components/common/EmptyState.tsx` [ENHANCE]

**Steps**:
1. Already partially done in T014
2. Add glass to main container
3. Use card preset
4. Ensure CTA button stands out
5. Test with different empty state messages

**Acceptance Criteria**:
- Empty state uses glass effect
- Icon container and main container have glass
- CTA button prominent and readable
- Works in light and dark mode

**Estimated Effort**: 30 minutes

**Related Requirements**: FR-008 (empty state glass)

---

### T029 [P2] [US2] Add card glass unit tests

**Description**: Unit tests for card glass components

**Files**: `__tests__/unit/components/GlassCard.test.tsx` [NEW]

**Steps**:
1. Create GlassCard test file
2. Test rendering with different presets
3. Test onPress callback
4. Test onLongPress callback
5. Test disabled state
6. Mock BlurView for iOS
7. Test Android fallback

**Acceptance Criteria**:
- All GlassCard props tested
- Touch interactions tested
- Platform behavior tested
- Tests pass on CI

**Estimated Effort**: 1 hour

**Related Requirements**: Testing

---

## Phase 4: Form Glass Effects

**Goal**: Apply glass styling to form inputs and buttons

**Dependencies**: Phase 1 complete

**Parallel Execution**: T030-T032 can run in parallel

### T030 [P2] [US3] Apply glass to form input fields

**Description**: Add glass borders and backgrounds to text inputs

**Files**: `src/components/forms/FormInput.tsx` (create if needed) [NEW/ENHANCE]

**Steps**:
1. Create or open FormInput component
2. Wrap input with GlassEffect using input preset
3. Support focus state with intensity increase
4. Support error state with red tint
5. Maintain placeholder visibility
6. Ensure cursor visible on glass
7. Test keyboard interactions

**Acceptance Criteria**:
- Inputs have glass background
- Focus state increases blur intensity
- Error state adds red tint
- Text readable in all states (4.5:1 contrast)
- Keyboard appearance works correctly

**Estimated Effort**: 2 hours

**Related Requirements**: FR-005 (form input glass), US3

---

### T031 [P2] [US3] Apply glass to form container

**Description**: Wrap entire form with glass effect container

**Files**: `src/components/exposure/ExposureForm.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/exposure/ExposureForm.tsx`
2. Import GlassEffect
3. Wrap form sections with GlassEffect using card preset
4. Maintain form progress indicator visibility
5. Ensure all form elements readable
6. Test with auto-save indicator
7. Verify scroll behavior

**Acceptance Criteria**:
- Form sections have glass background
- Progress indicator visible
- All inputs and labels readable
- Auto-save indicator works
- Scroll smooth with glass

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-002 (card glass for forms), US3

---

### T032 [P2] [US3] Apply glass to primary action buttons

**Description**: Use glass buttons for submit actions

**Files**: `src/components/exposure/ExposureForm.tsx`, `src/app/(tabs)/new.tsx` [ENHANCE]

**Steps**:
1. Open form files
2. Replace Button components with variant='glass'
3. Map button types: primary (intense), secondary (subtle)
4. Add appropriate tint colors (blue for primary)
5. Test loading state with glass
6. Verify haptic feedback
7. Check minimum touch target (48pt)

**Acceptance Criteria**:
- Primary buttons use glass with vibrant tint
- Secondary buttons use subtle glass
- Loading state displays correctly
- Touch targets meet 48pt minimum
- Haptics work on all buttons

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-003 (primary button glass), FR-004 (secondary button glass), US3

---

### T033 [P2] [US3] Apply glass to filter chips

**Description**: Add glass capsule styling to filter chips

**Files**: `src/components/exposure/FilterBar.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/exposure/FilterBar.tsx`
2. Import GlassEffect
3. Wrap filter chips with GlassEffect
4. Use button preset with subtle intensity
5. Add selected state with increased intensity
6. Include haptic feedback on toggle
7. Test with many filters

**Acceptance Criteria**:
- Filter chips use glass capsule style
- Selected state visually distinct
- Haptic feedback on tap
- Readable text on glass (4.5:1 contrast)
- Works in light and dark mode

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-009 (filter chip glass), US3

---

### T034 [P2] [US3] Add form glass unit tests

**Description**: Unit tests for form glass components

**Files**: `__tests__/unit/components/form-glass.test.tsx` [NEW]

**Steps**:
1. Create form glass test file
2. Test input field glass rendering
3. Test focus state changes
4. Test error state styling
5. Test button glass variants
6. Test filter chip interactions
7. Mock BlurView

**Acceptance Criteria**:
- All form states tested
- Focus and error states covered
- Button variants tested
- Platform behavior tested
- Tests pass on CI

**Estimated Effort**: 1.5 hours

**Related Requirements**: Testing

---

### T035 [P2] [US3] Optimize form glass performance

**Description**: Ensure form glass doesn't impact input responsiveness

**Files**: `src/components/forms/FormInput.tsx`, `src/components/exposure/ExposureForm.tsx` [ENHANCE]

**Steps**:
1. Memoize form glass components
2. Use shouldRasterizeIOS for static glass
3. Debounce glass intensity changes on focus
4. Profile keyboard appearance time
5. Test with many form fields (20+)
6. Ensure no input lag
7. Verify 60fps during scroll

**Acceptance Criteria**:
- Keyboard appears instantly (no lag)
- Typing feels responsive
- Form scroll maintains 60fps
- No memory leaks
- Static glass rasterized

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-021 (smooth performance)

---

### T036 [P2] [US3] Add form glass visual regression tests

**Description**: E2E screenshot tests for form glass appearance

**Files**: `__tests__/e2e/glass-forms.e2e.ts` [NEW]

**Steps**:
1. Create Detox E2E test file
2. Navigate to new exposure form
3. Capture default state screenshot
4. Tap input to focus (capture focus state)
5. Enter invalid data (capture error state)
6. Capture filter chips in different states
7. Compare against baselines

**Acceptance Criteria**:
- Baseline screenshots for all form states
- Focus state captured
- Error state captured
- Filter chips captured
- Tests detect visual regressions

**Estimated Effort**: 1.5 hours

**Related Requirements**: Testing

---

### T037 [P2] [US3] Add form accessibility tests

**Description**: Accessibility tests for form glass with VoiceOver

**Files**: `__tests__/integration/glass-forms-a11y.test.ts` [NEW]

**Steps**:
1. Create accessibility test file
2. Test form inputs with VoiceOver
3. Verify labels announced correctly
4. Test focus navigation with keyboard
5. Verify error messages announced
6. Test button accessibility labels
7. Validate contrast ratios programmatically

**Acceptance Criteria**:
- VoiceOver announces all inputs
- Error messages read correctly
- Keyboard navigation works
- Contrast validation passes
- Tests pass on CI

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-018 (VoiceOver), FR-019 (screen reader navigation)

---

## Phase 5: Modal Glass Effects

**Goal**: Apply layered glass to modals and overlays

**Dependencies**: Phase 1 complete

**Parallel Execution**: T038-T040 can run in parallel

### T038 [P2] [US4] Apply glass to filter modal

**Description**: Update filter modal with layered glass effects

**Files**: `src/components/exposure/FilterBar.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/exposure/FilterBar.tsx`
2. Import GlassModal component
3. Replace existing modal with GlassModal
4. Set backdropIntensity to 50 (dark blur)
5. Use card preset for modal content
6. Test backdrop tap to dismiss
7. Verify smooth enter/exit animations

**Acceptance Criteria**:
- Modal backdrop uses dark glass blur
- Content uses light glass
- Backdrop tap dismisses modal
- Animations smooth (no jank)
- Underlying content blurred

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-006 (modal glass), US4 (layered glass)

---

### T039 [P2] [US4] Apply glass to confirmation dialogs

**Description**: Update confirmation dialogs with glass styling

**Files**: Create reusable GlassConfirmDialog component [NEW]

**Steps**:
1. Create `src/components/common/GlassConfirmDialog.tsx`
2. Use GlassModal as base
3. Add title, message, confirmText, cancelText props
4. Style buttons with glass (confirm=primary, cancel=secondary)
5. Include icon support (warning, error, info)
6. Add haptic feedback on button press
7. Test with long messages

**Acceptance Criteria**:
- Dialog uses layered glass
- Buttons styled with glass
- Icon displays correctly
- Text wraps properly
- Haptic feedback works

**Estimated Effort**: 2 hours

**Related Requirements**: FR-006 (modal glass), US4

---

### T040 [P2] [US4] Apply glass to photo picker overlay

**Description**: Add glass effect to photo capture interface

**Files**: `src/components/exposure/PhotoCapture.tsx` [ENHANCE]

**Steps**:
1. Open `src/components/exposure/PhotoCapture.tsx`
2. Import GlassEffect
3. Add glass overlay for camera controls
4. Use navigation preset for control bar
5. Ensure camera preview not covered by glass
6. Add glass to capture button container
7. Test in various lighting conditions

**Acceptance Criteria**:
- Camera controls have glass background
- Camera preview unobstructed
- Capture button visible and accessible
- Works in bright and dark environments

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-006 (modal glass)

---

### T041 [P2] [US4] Optimize modal glass performance

**Description**: Ensure modal glass animations are smooth

**Files**: `src/components/common/GlassModal.tsx` [ENHANCE]

**Steps**:
1. Open GlassModal component
2. Use useNativeDriver for animations
3. Preload blur views before animation
4. Test modal appear/dismiss performance
5. Profile frame rate during animations
6. Ensure under 16ms render time
7. Test on iPhone 12

**Acceptance Criteria**:
- Modal animations use native driver
- Frame rate 60fps during transitions
- No layout shift during appear
- Backdrop blur smooth

**Estimated Effort**: 1 hour

**Related Requirements**: FR-021 (smooth performance)

---

### T042 [P2] [US4] Add modal glass unit tests

**Description**: Unit tests for modal glass components

**Files**: `__tests__/unit/components/GlassModal.test.tsx` [NEW]

**Steps**:
1. Create GlassModal test file
2. Test visible/hidden states
3. Test backdrop dismiss
4. Test close button callback
5. Test animation types
6. Mock BlurView
7. Test accessibility

**Acceptance Criteria**:
- Modal visibility tested
- Dismiss interactions tested
- Animations tested
- Platform behavior tested
- Tests pass on CI

**Estimated Effort**: 1 hour

**Related Requirements**: Testing

---

### T043 [P2] [US4] Add modal glass visual regression tests

**Description**: E2E screenshot tests for modal glass

**Files**: `__tests__/e2e/glass-modals.e2e.ts` [NEW]

**Steps**:
1. Create Detox E2E test file
2. Open filter modal (capture glass layers)
3. Open confirmation dialog (capture)
4. Test backdrop blur visibility
5. Capture modal on light background
6. Capture modal on dark background
7. Compare against baselines

**Acceptance Criteria**:
- Baseline screenshots for all modals
- Layered glass visible in screenshots
- Backdrop blur captured
- Tests detect visual regressions

**Estimated Effort**: 1 hour

**Related Requirements**: Testing

---

## Phase 6: Accessibility Compliance

**Goal**: Ensure WCAG 2.1 AA compliance for all glass effects

**Dependencies**: Phases 2-5 complete

**Parallel Execution**: T044-T046 can run in parallel

### T044 [P2] [US5] Implement Reduce Transparency detection

**Description**: Detect iOS "Reduce Transparency" setting and apply fallbacks

**Files**: `src/components/common/GlassEffect.tsx` [ENHANCE]

**Steps**:
1. Open GlassEffect component
2. Use useBlurSupport hook
3. Check reduceTransparencyEnabled flag
4. Render opaque View when true
5. Use fallbackColor prop
6. Add accessibility change listener
7. Test setting toggle during runtime

**Acceptance Criteria**:
- Reduce Transparency setting detected
- Opaque fallback renders when enabled
- Setting changes update immediately
- Fallback color matches theme
- No visual glitches during transition

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-017 (Reduce Transparency), US5 (accessibility)

---

### T045 [P2] [US5] Validate all text contrast ratios

**Description**: Audit all glass surfaces for WCAG 2.1 AA compliance

**Files**: Run audit script across all glass components

**Steps**:
1. Create contrast audit script
2. Extract all text colors on glass surfaces
3. Calculate contrast ratios using accessibility util
4. Generate report of violations
5. Fix any contrast issues found
6. Re-run audit to confirm fixes
7. Document passing ratios in comments

**Acceptance Criteria**:
- All text on glass meets 4.5:1 minimum
- Audit script automated
- Zero contrast violations
- Passing ratios documented

**Estimated Effort**: 2 hours

**Related Requirements**: FR-016 (4.5:1 contrast), US5

---

### T046 [P2] [US5] Add VoiceOver compatibility tests

**Description**: Test all glass components with VoiceOver enabled

**Files**: Manual testing checklist + automated tests

**Steps**:
1. Enable VoiceOver on iOS simulator
2. Navigate through each screen
3. Verify all elements announced correctly
4. Check focus order makes sense
5. Test gestures (swipe, double-tap)
6. Verify no elements hidden from VoiceOver
7. Document any issues and fix

**Acceptance Criteria**:
- All glass elements announced
- Focus order logical
- No accessibility traps
- Gestures work correctly
- Screen reader navigation smooth

**Estimated Effort**: 2 hours

**Related Requirements**: FR-018 (VoiceOver), US5

---

### T047 [P2] [US5] Add High Contrast mode support

**Description**: Implement fallbacks for iOS High Contrast mode

**Files**: `src/components/common/GlassEffect.tsx` [ENHANCE]

**Steps**:
1. Open GlassEffect component
2. Detect High Contrast accessibility setting
3. Increase text contrast when enabled
4. Add subtle borders to glass surfaces
5. Test with High Contrast enabled
6. Verify readability improved

**Acceptance Criteria**:
- High Contrast mode detected
- Text contrast increased
- Borders added to glass surfaces
- Readability improved
- No layout breaking

**Estimated Effort**: 1.5 hours

**Related Requirements**: FR-020 (high contrast fallback), US5

---

### T048 [P2] [US5] Add Dynamic Type support

**Description**: Ensure glass components work with large text sizes

**Files**: All glass components [ENHANCE]

**Steps**:
1. Enable Dynamic Type at largest size
2. Test each screen with large text
3. Verify no text overflow on glass
4. Check touch targets still adequate
5. Adjust layouts if needed
6. Test with VoiceOver + large text

**Acceptance Criteria**:
- Text scales correctly on glass
- No overflow or clipping
- Touch targets maintained
- Layout responsive
- Works with VoiceOver

**Estimated Effort**: 2 hours

**Related Requirements**: Accessibility

---

### T049 [P2] [US5] Create accessibility testing guide

**Description**: Document accessibility testing procedures for glass effects

**Files**: `specs/003-liquid-glass/ACCESSIBILITY_TESTING.md` [NEW]

**Steps**:
1. Create accessibility testing guide
2. Document VoiceOver testing steps
3. Document contrast validation process
4. List iOS accessibility settings to test
5. Include automated test commands
6. Add troubleshooting section
7. Link from quickstart.md

**Acceptance Criteria**:
- Comprehensive testing guide created
- VoiceOver steps documented
- Contrast validation automated
- Troubleshooting included
- Linked from other docs

**Estimated Effort**: 1 hour

**Related Requirements**: Documentation

---

## Phase 7: Testing & Polish

**Goal**: Comprehensive testing and performance optimization

**Dependencies**: All previous phases complete

**Parallel Execution**: T050-T052 can run in parallel

### T050 [P3] Add performance profiling tests

**Description**: Automated performance tests for glass rendering

**Files**: `__tests__/integration/glass-performance.test.ts` [NEW]

**Steps**:
1. Create performance test file
2. Test frame rate with 5 glass instances
3. Test memory usage over time
4. Profile render time per component
5. Test scroll performance
6. Validate under 16ms render time
7. Generate performance report

**Acceptance Criteria**:
- Frame rate tests automated
- Memory leak tests included
- Render time measured
- Performance report generated
- Tests pass on CI

**Estimated Effort**: 2 hours

**Related Requirements**: FR-021 (smooth performance), FR-022 (instance limit)

---

### T051 [P3] Add comprehensive E2E test suite

**Description**: Full E2E test coverage for glass effects

**Files**: `__tests__/e2e/glass-full-flow.e2e.ts` [NEW]

**Steps**:
1. Create comprehensive E2E test file
2. Test user flow: open app → view list → open form → submit
3. Verify glass effects on each screen
4. Test transitions between screens
5. Capture screenshots at each step
6. Test on iOS and Android
7. Validate performance during flow

**Acceptance Criteria**:
- Full user flow tested
- Glass effects verified on all screens
- Screenshots captured
- iOS and Android tested
- Performance validated

**Estimated Effort**: 3 hours

**Related Requirements**: Testing

---

### T052 [P3] Add visual regression test baselines

**Description**: Generate baseline screenshots for all glass components

**Files**: Visual regression test suite

**Steps**:
1. Run all E2E visual tests
2. Generate baseline screenshots
3. Store in version control
4. Document baseline generation process
5. Set up CI to run visual tests
6. Configure threshold for acceptable diff
7. Add review process for baseline updates

**Acceptance Criteria**:
- Baselines generated for all components
- Stored in git repository
- CI runs visual regression tests
- Diff threshold configured
- Review process documented

**Estimated Effort**: 2 hours

**Related Requirements**: Testing

---

### T053 [P3] Optimize glass performance on older devices

**Description**: Profile and optimize glass rendering on iPhone 12

**Files**: All glass components [ENHANCE]

**Steps**:
1. Profile app on iPhone 12 simulator
2. Identify performance bottlenecks
3. Apply additional rasterization where possible
4. Reduce blur intensity on older devices
5. Test frame rate improvements
6. Verify still looks good on iPhone 12
7. Document optimization techniques

**Acceptance Criteria**:
- 60fps maintained on iPhone 12
- Blur intensity adjusted if needed
- Rasterization optimized
- Visual quality acceptable
- Performance documented

**Estimated Effort**: 2 hours

**Related Requirements**: FR-021 (smooth performance), FR-023 (hardware acceleration)

---

### T054 [P3] Add glass effect documentation

**Description**: Complete developer documentation for glass effects

**Files**: Update all spec docs

**Steps**:
1. Update `quickstart.md` with real examples
2. Add troubleshooting section to docs
3. Document performance best practices
4. Create migration guide for future expo-glass-effect
5. Add code examples to contracts
6. Update CLAUDE.md with glass patterns
7. Link all docs together

**Acceptance Criteria**:
- All docs updated with real code
- Troubleshooting included
- Performance tips documented
- Migration guide created
- Examples accurate
- Docs linked together

**Estimated Effort**: 2 hours

**Related Requirements**: Documentation

---

### T055 [P3] Final QA and bug fixes

**Description**: Comprehensive QA pass on all glass effects

**Files**: All glass components [ENHANCE]

**Steps**:
1. Test all screens on iOS simulator
2. Test all screens on Android emulator
3. Test with VoiceOver enabled
4. Test with Reduce Transparency enabled
5. Test with High Contrast enabled
6. Test with largest Dynamic Type
7. Fix any bugs found
8. Retest after fixes

**Acceptance Criteria**:
- All screens tested thoroughly
- All accessibility modes tested
- Bugs documented and fixed
- Retesting complete
- Ready for deployment

**Estimated Effort**: 3 hours

**Related Requirements**: All requirements

---

## Dependency Graph

### Critical Path (Must be sequential):
1. Phase 0 (T001-T003) → Phase 1 (T004-T015)
2. Phase 1 → Phases 2, 3, 4, 5 (can run in parallel)
3. Phases 2-5 → Phase 6 (Accessibility)
4. Phase 6 → Phase 7 (Testing & Polish)

### Parallelization Opportunities:

**Phase 0**: T001, T002, T003 can all run in parallel (setup tasks)

**Phase 1**: After T004 completes:
- T005, T006, T007 can run in parallel (hooks and utilities)
- T008, T009, T010, T011 can run in parallel (component variants)
- T012, T013, T014, T015 can run in parallel (enhancements)

**Phase 2**: T016, T017, T019 can run in parallel (different screens)

**Phase 3**: T024, T025 can run in parallel (different card types)

**Phase 4**: T030, T031, T032, T033 can run in parallel (different form elements)

**Phase 5**: T038, T039, T040 can run in parallel (different modals)

**Phase 6**: T044, T045, T046, T047, T048 can run in parallel (different accessibility features)

**Phase 7**: T050, T051, T052 can run in parallel (different test types)

### MVP Scope

**Minimum Viable Product** (first release):
- Phase 0: All tasks (T001-T003) - Required
- Phase 1: T004-T011 only (core components, skip enhancements T012-T015)
- Phase 2: T016-T018 only (navigation glass, skip detail screen T019)
- Phase 3: T024 only (exposure cards, skip stats and optimizations)
- Phase 4: T030, T032 only (inputs and buttons, skip filters and optimizations)
- Phase 5: T038 only (filter modal, skip other modals)
- Phase 6: T044, T045, T046 only (core accessibility, skip High Contrast and Dynamic Type)
- Phase 7: Skip all (defer to post-MVP)

**MVP Task Count**: 19/55 tasks (35%)

This creates a working glass effect implementation that covers:
- Core components (GlassEffect, GlassCard, GlassButton, GlassModal, GlassNavBar)
- Navigation glass (tab bar, headers)
- Card glass (exposure list)
- Form glass (inputs, buttons)
- Basic modal glass (filter)
- Essential accessibility (Reduce Transparency, contrast, VoiceOver)

Post-MVP can add:
- Performance optimizations
- Additional glass variants
- Comprehensive testing
- Documentation polish
- High Contrast and Dynamic Type support

---

## Task Checklist

### Phase 0: Setup & Dependencies (3 tasks)

- [ ] T001 [P0] Install expo-blur library → `package.json`, `package-lock.json`
- [ ] T002 [P0] Create glass configuration constants → `src/constants/glassConfig.ts` [NEW]
- [ ] T003 [P0] Extend theme with glass color tokens → `src/constants/theme.ts` [ENHANCE]

### Phase 1: Foundation Components (12 tasks)

- [ ] T004 [P1] [US1] Create GlassEffect wrapper component → `src/components/common/GlassEffect.tsx` [NEW]
- [ ] T005 [P1] Create useBlurSupport capability detection hook → `src/hooks/useBlurSupport.ts` [NEW]
- [ ] T006 [P1] Create useGlassTheme preset management hook → `src/hooks/useGlassTheme.ts` [NEW]
- [ ] T007 [P1] Create accessibility contrast validation utility → `src/utils/accessibility.ts` [NEW]
- [ ] T008 [P1] Add GlassCard component → `src/components/common/GlassCard.tsx` [NEW]
- [ ] T009 [P1] Add GlassButton component → `src/components/common/GlassButton.tsx` [NEW]
- [ ] T010 [P1] Add GlassModal component → `src/components/common/GlassModal.tsx` [NEW]
- [ ] T011 [P1] Add GlassNavBar component → `src/components/common/GlassNavBar.tsx` [NEW]
- [ ] T012 [P1] Update Button component with glass variant → `src/components/common/Button.tsx` [ENHANCE]
- [ ] T013 [P1] Update Card component with glass variant → `src/components/common/Card.tsx` [ENHANCE]
- [ ] T014 [P1] Update EmptyState with glass icon containers → `src/components/common/EmptyState.tsx` [ENHANCE]
- [ ] T015 [P1] Document component usage in CLAUDE.md → `CLAUDE.md` [ENHANCE]

### Phase 2: Navigation Glass Effects (8 tasks)

- [ ] T016 [P2] [US1] Apply glass to bottom tab bar → `src/app/(tabs)/_layout.tsx` [ENHANCE]
- [ ] T017 [P2] [US1] Apply glass to home screen header → `src/app/(tabs)/index.tsx` [ENHANCE]
- [ ] T018 [P2] [US1] Test navigation glass across all tabs → `src/app/(tabs)/*.tsx` [ENHANCE]
- [ ] T019 [P2] [US1] Add glass to exposure detail header → `src/app/exposure/[id].tsx` [ENHANCE]
- [ ] T020 [P2] [US1] Optimize navigation glass performance → `src/components/common/GlassNavBar.tsx` [ENHANCE]
- [ ] T021 [P2] [US1] Add navigation glass unit tests → `__tests__/unit/components/GlassNavBar.test.tsx` [NEW]
- [ ] T022 [P2] [US1] Add navigation glass integration tests → `__tests__/integration/glass-navigation.test.ts` [NEW]
- [ ] T023 [P2] [US1] Add navigation glass visual regression tests → `__tests__/e2e/glass-navigation.e2e.ts` [NEW]

### Phase 3: Card Glass Effects (6 tasks)

- [ ] T024 [P2] [US2] Apply glass to exposure cards in list → `src/components/exposure/ExposureCard.tsx` [ENHANCE]
- [ ] T025 [P2] [US2] Apply glass to statistics cards on home → `src/app/(tabs)/index.tsx` [ENHANCE]
- [ ] T026 [P2] [US2] Optimize card glass performance → `src/app/(tabs)/index.tsx`, `src/components/exposure/ExposureCard.tsx` [ENHANCE]
- [ ] T027 [P2] [US2] Add card glass transition animations → `src/components/exposure/ExposureCard.tsx` [ENHANCE]
- [ ] T028 [P2] [US2] Apply glass to empty state card → `src/components/common/EmptyState.tsx` [ENHANCE]
- [ ] T029 [P2] [US2] Add card glass unit tests → `__tests__/unit/components/GlassCard.test.tsx` [NEW]

### Phase 4: Form Glass Effects (8 tasks)

- [ ] T030 [P2] [US3] Apply glass to form input fields → `src/components/forms/FormInput.tsx` [NEW/ENHANCE]
- [ ] T031 [P2] [US3] Apply glass to form container → `src/components/exposure/ExposureForm.tsx` [ENHANCE]
- [ ] T032 [P2] [US3] Apply glass to primary action buttons → `src/components/exposure/ExposureForm.tsx`, `src/app/(tabs)/new.tsx` [ENHANCE]
- [ ] T033 [P2] [US3] Apply glass to filter chips → `src/components/exposure/FilterBar.tsx` [ENHANCE]
- [ ] T034 [P2] [US3] Add form glass unit tests → `__tests__/unit/components/form-glass.test.tsx` [NEW]
- [ ] T035 [P2] [US3] Optimize form glass performance → `src/components/forms/FormInput.tsx`, `src/components/exposure/ExposureForm.tsx` [ENHANCE]
- [ ] T036 [P2] [US3] Add form glass visual regression tests → `__tests__/e2e/glass-forms.e2e.ts` [NEW]
- [ ] T037 [P2] [US3] Add form accessibility tests → `__tests__/integration/glass-forms-a11y.test.ts` [NEW]

### Phase 5: Modal Glass Effects (6 tasks)

- [ ] T038 [P2] [US4] Apply glass to filter modal → `src/components/exposure/FilterBar.tsx` [ENHANCE]
- [ ] T039 [P2] [US4] Apply glass to confirmation dialogs → `src/components/common/GlassConfirmDialog.tsx` [NEW]
- [ ] T040 [P2] [US4] Apply glass to photo picker overlay → `src/components/exposure/PhotoCapture.tsx` [ENHANCE]
- [ ] T041 [P2] [US4] Optimize modal glass performance → `src/components/common/GlassModal.tsx` [ENHANCE]
- [ ] T042 [P2] [US4] Add modal glass unit tests → `__tests__/unit/components/GlassModal.test.tsx` [NEW]
- [ ] T043 [P2] [US4] Add modal glass visual regression tests → `__tests__/e2e/glass-modals.e2e.ts` [NEW]

### Phase 6: Accessibility Compliance (6 tasks)

- [ ] T044 [P2] [US5] Implement Reduce Transparency detection → `src/components/common/GlassEffect.tsx` [ENHANCE]
- [ ] T045 [P2] [US5] Validate all text contrast ratios → Audit script across all glass components
- [ ] T046 [P2] [US5] Add VoiceOver compatibility tests → Manual testing checklist + automated tests
- [ ] T047 [P2] [US5] Add High Contrast mode support → `src/components/common/GlassEffect.tsx` [ENHANCE]
- [ ] T048 [P2] [US5] Add Dynamic Type support → All glass components [ENHANCE]
- [ ] T049 [P2] [US5] Create accessibility testing guide → `specs/003-liquid-glass/ACCESSIBILITY_TESTING.md` [NEW]

### Phase 7: Testing & Polish (6 tasks)

- [ ] T050 [P3] Add performance profiling tests → `__tests__/integration/glass-performance.test.ts` [NEW]
- [ ] T051 [P3] Add comprehensive E2E test suite → `__tests__/e2e/glass-full-flow.e2e.ts` [NEW]
- [ ] T052 [P3] Add visual regression test baselines → Visual regression test suite
- [ ] T053 [P3] Optimize glass performance on older devices → All glass components [ENHANCE]
- [ ] T054 [P3] Add glass effect documentation → Update all spec docs
- [ ] T055 [P3] Final QA and bug fixes → All glass components [ENHANCE]

---

## Notes

- **Estimated Total Effort**: ~70 hours for full implementation
- **MVP Estimated Effort**: ~25 hours (19 critical tasks)
- **Primary Dependencies**: expo-blur@15.0.7, existing theme system, accessibility utilities
- **Testing Strategy**: Unit (20%), Integration (15%), E2E (10%), Manual QA (55%)
- **Performance Target**: 60fps on iPhone 12 minimum, max 5 simultaneous glass views
- **Accessibility Target**: WCAG 2.1 AA compliance (4.5:1 contrast minimum)
- **Platform Support**: iOS primary (blur), Android secondary (opaque fallback)
- **Migration Path**: expo-blur → expo-glass-effect when iOS 26 adoption reaches 30%

---

**Ready to start**: Run `/speckit.implement` to begin task execution
