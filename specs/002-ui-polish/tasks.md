# Tasks: UX/UI Polish Improvements

**Input**: Design documents from `/specs/002-ui-polish/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT explicitly requested in this specification. Implementation focuses on UI components, hooks, and screen enhancements with manual QA validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Mobile React Native/Expo project structure:
- `src/` - Source code at repository root
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/constants/` - Configuration and theme
- `src/app/(tabs)/` - Expo Router screen files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create foundational constants

- [X] T001 Install expo-haptics dependency via `npx expo install expo-haptics`
- [X] T002 [P] Create icon mapping constants in src/constants/icons.ts
- [X] T003 [P] Extend theme with semantic color tokens in src/constants/theme.ts
- [X] T004 [P] Create useDebounce utility hook in src/hooks/useDebounce.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Implement useHaptics hook in src/hooks/useHaptics.ts
- [X] T006 [P] Implement useFilter hook with ExposureFilters state management in src/hooks/useFilter.ts
- [X] T007 [P] Implement useSearch hook with debouncing in src/hooks/useSearch.ts
- [X] T008 [P] Implement useDraftForm hook for auto-save functionality in src/hooks/useDraftForm.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Professional Icon System (Priority: P1) 🎯 MVP

**Goal**: Replace all emoji icons with vector icons from @expo/vector-icons for consistent cross-platform rendering and screen reader support

**Independent Test**: Navigate through all tabs (home, new, map, education, profile) and verify vector icons display consistently on both iOS simulator and Android emulator, with screen readers properly announcing icon meanings

### Implementation for User Story 1

- [X] T009 [P] [US1] Replace emoji icons in tab navigation with Ionicons in src/app/(tabs)/_layout.tsx
- [X] T010 [P] [US1] Replace emoji icons with Ionicons in Home screen (index.tsx) statistics cards in src/app/(tabs)/index.tsx
- [X] T011 [P] [US1] Replace emoji icons with Ionicons in ExposureCard component in src/components/exposure/ExposureCard.tsx
- [X] T012 [P] [US1] Replace emoji icons with Ionicons in ExposureTypeSelector component in src/components/exposure/ExposureTypeSelector.tsx
- [X] T013 [P] [US1] Add accessibility labels to all icon elements in tab navigation src/app/(tabs)/_layout.tsx
- [X] T014 [P] [US1] Add accessibility labels to all icon elements in ExposureCard src/components/exposure/ExposureCard.tsx
- [X] T015 [P] [US1] Add accessibility labels to all icon elements in ExposureTypeSelector src/components/exposure/ExposureTypeSelector.tsx
- [X] T016 [US1] Update severity indicator icons in exposure detail screen src/app/exposure/[id].tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - all emoji icons replaced with vector icons, screen readers announce icon meanings

---

## Phase 4: User Story 2 - Intuitive List Navigation & Filtering (Priority: P1)

**Goal**: Add search and filter functionality to exposure list screen for quick record location

**Independent Test**: Create 20+ test exposures with varied types/dates/severities, then use search bar to find by keyword, apply multiple filters (type + severity), and verify filtered results display correctly with count

### Implementation for User Story 2

- [X] T017 [P] [US2] Create SearchBar component with query input and clear button in src/components/exposure/SearchBar.tsx
- [X] T018 [P] [US2] Create FilterBar component with filter chips in src/components/exposure/FilterBar.tsx
- [X] T019 [P] [US2] Create FilterChip sub-component for filter UI in src/components/exposure/FilterChip.tsx
- [X] T020 [US2] Integrate SearchBar into list screen with useSearch hook in src/app/(tabs)/list.tsx
- [X] T021 [US2] Integrate FilterBar into list screen with useFilter hook in src/app/(tabs)/list.tsx
- [X] T022 [US2] Add filter result count display in list screen header src/app/(tabs)/list.tsx
- [X] T023 [US2] Implement clear all filters functionality in FilterBar src/components/exposure/FilterBar.tsx
- [X] T024 [US2] Add haptic feedback to filter chip tap interactions in src/components/exposure/FilterChip.tsx
- [X] T025 [US2] Make exposure cards tappable with navigation to detail view in src/app/(tabs)/list.tsx
- [X] T026 [US2] Add pull-to-refresh gesture to list screen in src/app/(tabs)/list.tsx
- [X] T027 [US2] Announce filter results to screen readers using AccessibilityInfo in src/components/exposure/FilterBar.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can search and filter 50+ exposures efficiently

---

## Phase 5: User Story 3 - Enhanced Loading & Empty States (Priority: P2)

**Goal**: Add skeleton loading placeholders and contextual empty state displays

**Independent Test**: Enable network throttling in dev tools, navigate to list screen to verify skeleton cards display during loading, then clear all data to verify empty state with helpful message and CTA button

### Implementation for User Story 3

- [X] T028 [P] [US3] Create SkeletonCard component with shimmer animation in src/components/common/SkeletonCard.tsx
- [X] T029 [P] [US3] Create SkeletonList component rendering multiple skeleton cards in src/components/common/SkeletonList.tsx
- [X] T030 [P] [US3] Create SkeletonText component for text placeholders in src/components/common/SkeletonText.tsx
- [X] T031 [P] [US3] Create EmptyState component with icon, title, description, and CTA in src/components/common/EmptyState.tsx
- [X] T032 [US3] Add skeleton loading state to list screen when data is undefined in src/app/(tabs)/list.tsx
- [X] T033 [US3] Add empty state to list screen when data length is zero in src/app/(tabs)/list.tsx
- [X] T034 [US3] Add empty state for no search results in src/app/(tabs)/list.tsx
- [X] T035 [US3] Add empty state for no filter results with clear filters CTA in src/app/(tabs)/list.tsx
- [X] T036 [US3] Add skeleton loading to home screen statistics in src/app/(tabs)/index.tsx
- [X] T037 [US3] Add skeleton loading to exposure detail screen in src/app/exposure/[id].tsx
- [X] T038 [US3] Add progress indicator to PDF export with percentage in src/app/(tabs)/export.tsx

**Checkpoint**: All loading and empty states should provide clear feedback - users never see blank screens or generic spinners

---

## Phase 6: User Story 4 - Improved Form Experience (Priority: P2)

**Goal**: Add multi-step progress indicators, inline validation errors, and draft auto-save to exposure creation form

**Independent Test**: Start creating an exposure, intentionally skip required fields and verify inline errors appear, navigate away and return to verify draft restored, complete form and verify progress indicator updates

### Implementation for User Story 4

- [X] T039 [P] [US4] Create FormProgress component with step indicator in src/components/forms/FormProgress.tsx
- [X] T040 [P] [US4] Create InlineError component for field validation display in src/components/forms/InlineError.tsx
- [X] T041 [P] [US4] Create DraftSaver component with save indicator in src/components/forms/DraftSaver.tsx
- [X] T042 [US4] Add FormProgress to new exposure screen with 4 steps in src/app/(tabs)/new.tsx
- [X] T043 [US4] Add field-level validation with InlineError components in src/app/(tabs)/new.tsx
- [X] T044 [US4] Integrate DraftSaver component with form data in src/app/(tabs)/new.tsx
- [X] T045 [US4] Load draft on screen mount if exists in src/app/(tabs)/new.tsx
- [X] T046 [US4] Clear draft on successful form submission in src/app/(tabs)/new.tsx
- [X] T047 [US4] Add haptic feedback to voice recording button state changes in src/app/(tabs)/new.tsx
- [X] T048 [US4] Update site suggestions to display as cards with location details in src/app/(tabs)/new.tsx

**Checkpoint**: Form experience should be smooth - users receive inline validation, progress feedback, and drafts are preserved

---

## Phase 7: User Story 5 - Accessibility Improvements (Priority: P2)

**Goal**: Add comprehensive accessibility labels, ensure 44x44 touch targets, and implement haptic feedback

**Independent Test**: Enable VoiceOver (iOS) or TalkBack (Android), navigate through app and verify all interactive elements have descriptive labels, measure touch targets with layout inspector to confirm 44x44 minimum

### Implementation for User Story 5

- [X] T049 [P] [US5] Add accessibility labels to all buttons in home screen src/app/(tabs)/index.tsx
- [X] T050 [P] [US5] Add accessibility labels to all buttons in list screen src/app/(tabs)/list.tsx
- [X] T051 [P] [US5] Add accessibility labels to all buttons in new exposure screen src/app/(tabs)/new.tsx
- [X] T052 [P] [US5] Add accessibility labels to all buttons in export screen src/app/(tabs)/export.tsx
- [X] T053 [P] [US5] Add accessibility labels to all buttons in profile screen src/app/(tabs)/profile.tsx
- [X] T054 [P] [US5] Add accessibility labels to all form inputs in new exposure screen src/app/(tabs)/new.tsx
- [X] T055 [P] [US5] Audit and fix touch target sizes (<44x44) in Button component src/components/common/Button.tsx
- [X] T056 [P] [US5] Audit and fix touch target sizes in Card component src/components/common/Card.tsx
- [X] T057 [P] [US5] Add haptic feedback to button taps using useHaptics in src/components/common/Button.tsx
- [X] T058 [P] [US5] Add haptic feedback to card taps in ExposureCard src/components/exposure/ExposureCard.tsx
- [X] T059 [P] [US5] Add haptic feedback to tab navigation switches in src/app/(tabs)/_layout.tsx
- [X] T060 [US5] Verify logical reading order for screen readers in all screens using accessibilityRole

**Checkpoint**: All accessibility improvements in place - app is fully usable with screen readers and meets WCAG 2.1 AA touch target requirements

---

## Phase 8: User Story 6 - Visual Consistency & Theme Refinement (Priority: P3)

**Goal**: Eliminate hardcoded colors and standardize typography hierarchy across all screens

**Independent Test**: Audit all screen files for hardcoded color values (grep for #[0-9a-f]{6}), verify all colors come from theme system, check typography consistency across H1/H2/H3 elements

### Implementation for User Story 6

- [X] T061 [P] [US6] Replace hardcoded colors with theme tokens in home screen src/app/(tabs)/index.tsx
- [X] T062 [P] [US6] Replace hardcoded colors with theme tokens in list screen src/app/(tabs)/list.tsx
- [X] T063 [P] [US6] Replace hardcoded colors with theme tokens in new exposure screen src/app/(tabs)/new.tsx
- [X] T064 [P] [US6] Replace hardcoded colors with theme tokens in export screen src/app/(tabs)/export.tsx
- [X] T065 [P] [US6] Replace hardcoded colors with theme tokens in education screen src/app/(tabs)/education.tsx
- [X] T066 [P] [US6] Replace hardcoded colors with theme tokens in profile screen src/app/(tabs)/profile.tsx
- [X] T067 [P] [US6] Replace hardcoded colors with theme tokens in ExposureCard src/components/exposure/ExposureCard.tsx
- [X] T068 [P] [US6] Replace hardcoded colors with theme tokens in Button component src/components/common/Button.tsx
- [X] T069 [P] [US6] Standardize H1/H2/H3 typography in home screen src/app/(tabs)/index.tsx
- [X] T070 [P] [US6] Standardize H1/H2/H3 typography in list screen src/app/(tabs)/list.tsx
- [X] T071 [P] [US6] Standardize H1/H2/H3 typography in exposure detail screen src/app/exposure/[id].tsx

**Checkpoint**: Visual consistency achieved - all colors from theme system, typography hierarchy standardized

---

## Phase 9: User Story 7 - Mobile Interaction Enhancements (Priority: P3)

**Goal**: Add haptic feedback to remaining interactions and implement contextual long-press menus

**Independent Test**: Test on physical device (haptics don't work in simulator), tap buttons/cards to feel feedback, long-press exposure card to verify contextual menu appears

### Implementation for User Story 7

- [X] T072 [P] [US7] Add haptic feedback to form submission success in src/app/(tabs)/new.tsx
- [X] T073 [P] [US7] Add haptic feedback to form validation errors in src/app/(tabs)/new.tsx
- [X] T074 [P] [US7] Add haptic feedback to PDF export completion in src/app/(tabs)/export.tsx
- [X] T075 [P] [US7] Add haptic feedback to filter selection in FilterBar src/components/exposure/FilterBar.tsx
- [X] T076 [P] [US7] Add contextual long-press menu to ExposureCard with quick actions (view, edit, delete) in src/components/exposure/ExposureCard.tsx
- [X] T077 [US7] Ensure pull-to-refresh has haptic feedback on refresh trigger in src/app/(tabs)/list.tsx

**Checkpoint**: All mobile interaction enhancements complete - app feels native and responsive with comprehensive haptic feedback

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [ ] T078 [P] Run quickstart.md validation - test all code examples work as documented
- [ ] T079 [P] Verify all 29 functional requirements (FR-001 through FR-029) are implemented per spec.md
- [ ] T080 [P] Test on iOS simulator with VoiceOver enabled - verify all accessibility labels
- [ ] T081 [P] Test on Android emulator with TalkBack enabled - verify all accessibility labels
- [ ] T082 [P] Performance audit - verify skeleton screens appear <300ms, search <100ms
- [ ] T083 [P] Measure touch target sizes using React Native Debugger - verify all meet 44x44 minimum
- [ ] T084 [P] Test with 50+ exposure records - verify search/filter performance
- [ ] T085 [P] Test form abandonment and draft restoration flow end-to-end
- [ ] T086 Code cleanup - remove any console.log statements not using warn/error
- [ ] T087 Code cleanup - ensure all imports follow path aliases (@components, @hooks, etc.)
- [ ] T088 Update CLAUDE.md with any new patterns or conventions from this feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Icons**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1) - Filtering**: Can start after Foundational (Phase 2) - No dependencies on other stories (but integrates well with US1 icons)
- **User Story 3 (P2) - Loading States**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 4 (P2) - Forms**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 5 (P2) - Accessibility**: Can start after US1 (icons must exist to add labels) - Integrates with all other stories
- **User Story 6 (P3) - Visual Consistency**: Can start after Foundational (Phase 2) - Independent but benefits from US1 completion
- **User Story 7 (P3) - Mobile Interactions**: Can start after Foundational (Phase 2) - Builds on US5 (haptics hook)

### Within Each User Story

- Components before integration (e.g., create SearchBar before integrating into list screen)
- Hooks before components that use them (foundational phase ensures this)
- Accessibility labels after UI elements exist
- Haptic feedback after interaction handlers exist

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, ALL user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (Icons)

Launch all icon replacement tasks together (different files, no dependencies):

```bash
Task T009: "Replace emoji icons in tab navigation src/app/(tabs)/_layout.tsx"
Task T010: "Replace emoji icons in Home screen src/app/(tabs)/index.tsx"
Task T011: "Replace emoji icons in ExposureCard src/components/exposure/ExposureCard.tsx"
Task T012: "Replace emoji icons in ExposureTypeSelector src/components/exposure/ExposureTypeSelector.tsx"
```

Then launch all accessibility label tasks together:

```bash
Task T013: "Add accessibility labels to tab navigation src/app/(tabs)/_layout.tsx"
Task T014: "Add accessibility labels to ExposureCard src/components/exposure/ExposureCard.tsx"
Task T015: "Add accessibility labels to ExposureTypeSelector src/components/exposure/ExposureTypeSelector.tsx"
```

---

## Parallel Example: User Story 2 (Filtering)

Launch all component creation tasks together:

```bash
Task T017: "Create SearchBar component src/components/exposure/SearchBar.tsx"
Task T018: "Create FilterBar component src/components/exposure/FilterBar.tsx"
Task T019: "Create FilterChip component src/components/exposure/FilterChip.tsx"
```

---

## Parallel Example: User Story 3 (Loading States)

Launch all skeleton component creation together:

```bash
Task T028: "Create SkeletonCard src/components/common/SkeletonCard.tsx"
Task T029: "Create SkeletonList src/components/common/SkeletonList.tsx"
Task T030: "Create SkeletonText src/components/common/SkeletonText.tsx"
Task T031: "Create EmptyState src/components/common/EmptyState.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - P1 Priority)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008) - CRITICAL
3. Complete Phase 3: User Story 1 - Icons (T009-T016)
4. Complete Phase 4: User Story 2 - Filtering (T017-T027)
5. **STOP and VALIDATE**: Test icons and filtering independently on both iOS/Android
6. Deploy/demo if ready - this is a functional MVP with professional appearance and efficient list navigation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Icons) → Test independently → Deploy/Demo
3. Add User Story 2 (Filtering) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 (Loading States) → Test independently → Deploy/Demo
5. Add User Story 4 (Forms) → Test independently → Deploy/Demo
6. Add User Story 5 (Accessibility) → Test independently → Deploy/Demo
7. Add User Story 6 (Visual Consistency) → Test independently → Deploy/Demo
8. Add User Story 7 (Mobile Interactions) → Test independently → Deploy/Demo
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (critical shared infrastructure)
2. Once Foundational is done:
   - Developer A: User Story 1 (Icons) - T009-T016
   - Developer B: User Story 2 (Filtering) - T017-T027
   - Developer C: User Story 3 (Loading States) - T028-T038
3. Once P1 stories complete:
   - Developer A: User Story 4 (Forms) - T039-T048
   - Developer B: User Story 5 (Accessibility) - T049-T060
   - Developer C: User Story 6 (Visual Consistency) - T061-T071
4. Final sprint:
   - Developer A: User Story 7 (Mobile Interactions) - T072-T077
   - Developers B & C: Polish & Testing - T078-T088

---

## Task Summary

**Total Tasks**: 88

**Tasks by Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1 - Icons): 8 tasks
- Phase 4 (US2 - Filtering): 11 tasks
- Phase 5 (US3 - Loading States): 11 tasks
- Phase 6 (US4 - Forms): 10 tasks
- Phase 7 (US5 - Accessibility): 12 tasks
- Phase 8 (US6 - Visual Consistency): 11 tasks
- Phase 9 (US7 - Mobile Interactions): 6 tasks
- Phase 10 (Polish): 11 tasks

**Parallel Opportunities**: 63 tasks marked [P] can run in parallel within their phase

**MVP Scope** (Suggested minimum viable product):
- Setup (Phase 1): 4 tasks
- Foundational (Phase 2): 4 tasks
- User Story 1 (Icons): 8 tasks
- User Story 2 (Filtering): 11 tasks
- **MVP Total**: 27 tasks = 31% of feature

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, [P] marker (if parallelizable), [Story] label (for user story tasks), and file paths

---

## Notes

- [P] tasks = different files, no dependencies within that phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included as spec doesn't explicitly request TDD approach - manual QA validation expected
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution gate compliance: Code Quality (TypeScript), UX Consistency (theme system), Performance (skeleton <300ms), Accessibility (WCAG 2.1 AA)
