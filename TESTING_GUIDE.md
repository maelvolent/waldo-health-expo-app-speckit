# Phase 10 Testing Guide

This document provides instructions for completing the remaining Phase 10 testing tasks (T078-T085).

## Prerequisites

- Expo dev environment set up
- iOS simulator or physical iOS device
- Android emulator or physical Android device
- Convex backend running (`npx convex dev`)

## T078: Quickstart Validation

**Objective**: Verify all code examples in quickstart.md work as documented

**Steps**:
1. Locate quickstart.md (if exists) or relevant getting started documentation
2. Follow each code example step-by-step in a clean environment
3. Verify all commands execute without errors
4. Verify all code snippets compile and run correctly

**Expected Result**: All examples work as documented

## T079: Functional Requirements Verification

**Objective**: Verify all 29 functional requirements (FR-001 through FR-029) from spec.md

**Steps**:
1. Open `specs/002-ui-polish/spec.md`
2. Locate the functional requirements section
3. For each requirement FR-001 to FR-029:
   - Read the requirement description
   - Test the feature in the app
   - Verify it works as specified
   - Mark as ✅ or ❌ in your notes

**Expected Result**: All 29 functional requirements pass

## T080: iOS VoiceOver Testing

**Objective**: Test accessibility with iOS VoiceOver screen reader

**Steps**:
1. Launch app in iOS simulator or device
2. Enable VoiceOver:
   - **Simulator**: Settings > Accessibility > VoiceOver > On
   - **Physical device**: Triple-click side button (if configured)
3. Navigate through each screen using VoiceOver:
   - **Home screen**: Verify all cards and buttons are announced
   - **List screen**: Verify exposure cards, search bar, filters are accessible
   - **New exposure screen**: Verify form fields, buttons have proper labels
   - **Export screen**: Verify format selection and buttons
   - **Exposure detail**: Verify all information is accessible

**Test Checklist**:
- [ ] All buttons have descriptive labels
- [ ] All form inputs have labels
- [ ] All icons have descriptions
- [ ] Navigation flows logically
- [ ] No unlabeled interactive elements
- [ ] Hint text provides context where needed

**Expected Result**: App is fully usable with VoiceOver, all elements properly labeled

## T081: Android TalkBack Testing

**Objective**: Test accessibility with Android TalkBack screen reader

**Steps**:
1. Launch app in Android emulator or device
2. Enable TalkBack:
   - Settings > Accessibility > TalkBack > On
3. Navigate through each screen using TalkBack gestures:
   - Swipe right to move to next element
   - Double-tap to activate
   - Swipe up then right for reading menus

**Test Same Checklist as T080**

**Expected Result**: App is fully usable with TalkBack, all elements properly labeled

## T082: Performance Audit

**Objective**: Verify performance targets are met

**Performance Targets**:
- Skeleton screens appear: <300ms
- Search response time: <100ms after typing stops
- Filter application: <50ms
- Form auto-save: <100ms to persist

**Steps**:

### 1. Skeleton Screen Timing
```bash
# In app code, add timing logs temporarily:
const start = performance.now();
// ... skeleton render ...
const end = performance.now();
console.log(`Skeleton render: ${end - start}ms`); // Should be <300ms
```

### 2. Search Response Timing
1. Navigate to list screen
2. Type in search bar
3. Observe time from last keystroke to results update
4. Should feel instant (<100ms after 300ms debounce)

### 3. Filter Response Timing
1. Navigate to list screen
2. Tap a filter chip
3. Results should update immediately (<50ms)

### 4. Form Auto-Save Timing
1. Navigate to new exposure screen
2. Start typing in a field
3. Observe draft saver indicator
4. Should show "Saving..." then "Saved X seconds ago" within 2-3 seconds

**Tools**:
- React DevTools Profiler
- Chrome DevTools Performance tab (for Expo web)
- Console timing logs

**Expected Result**: All performance targets met

## T083: Touch Target Measurement

**Objective**: Verify all interactive elements meet 44x44px minimum

**Steps**:
1. Launch app with React Native Debugger or use built-in inspector
2. Enable element inspector:
   - Shake device/simulator
   - Select "Toggle Element Inspector"
3. Tap each interactive element and verify dimensions:
   - All buttons: ≥48x48 (our safe minimum)
   - All cards: ≥48px height
   - All filter chips: ≥48px height
   - All icons (when tappable): ≥48x48

**Key Elements to Check**:
- [ ] Home screen action cards
- [ ] List screen exposure cards
- [ ] Search bar clear button
- [ ] Filter chips
- [ ] Form input touch areas
- [ ] Navigation tabs
- [ ] Export format selection
- [ ] Context menu items (long-press)

**Expected Result**: All interactive elements meet or exceed 48x48px minimum

## T084: Large Dataset Performance

**Objective**: Test with 50+ exposure records

**Steps**:
1. Create test data:
   ```bash
   # Option 1: Manually create 50+ exposures through the app
   # Option 2: Use Convex dashboard to import test data
   # Option 3: Create a script to generate test exposures
   ```

2. Test list screen performance:
   - [ ] List loads without lag
   - [ ] Scrolling is smooth (60fps)
   - [ ] Search with 50+ records is fast
   - [ ] Filtering is instant
   - [ ] Pull-to-refresh works smoothly

3. Test export performance:
   - [ ] PDF generation completes (may take longer for 50+ records)
   - [ ] Progress indicator works correctly
   - [ ] CSV export completes quickly
   - [ ] No memory issues

4. Test map screen (if applicable):
   - [ ] Map clustering works (if >100 markers)
   - [ ] Markers render without lag
   - [ ] Zoom/pan is smooth

**Performance Monitoring**:
```bash
# Watch for performance warnings in console
# Monitor React DevTools Profiler
# Check for memory leaks
```

**Expected Result**: App remains performant with 50+ records

## T085: Form Draft Flow Testing

**Objective**: Test form abandonment and draft restoration end-to-end

**Steps**:

### 1. Draft Creation
1. Navigate to new exposure screen
2. Fill in some fields:
   - Select exposure type
   - Enter work activity (at least 10 characters)
   - Add site name (optional)
3. Wait 2-3 seconds for auto-save
4. Verify "Saved X seconds ago" appears
5. Navigate away WITHOUT submitting (go back or switch tabs)

### 2. Draft Restoration
1. Navigate back to new exposure screen
2. Verify all previously entered data is restored:
   - [ ] Exposure type selected
   - [ ] Work activity text present
   - [ ] Site name present (if entered)
   - [ ] Photos present (if added)
3. Verify "Draft restored" or similar message appears

### 3. Draft Clearing
1. Complete the form
2. Submit successfully
3. Verify success message and haptic feedback
4. Navigate back to new exposure screen
5. Verify form is cleared (no draft restored)

### 4. Multiple Abandonments
1. Create a draft, navigate away
2. Return and modify, navigate away again
3. Return again - verify latest changes are present

### 5. Edge Cases
- [ ] Test with no data entered (no draft created)
- [ ] Test with only one field filled
- [ ] Test rapid navigation (before auto-save triggers)
- [ ] Test app restart (if using AsyncStorage, drafts should persist)

**Expected Result**:
- Drafts save automatically every 2-3 seconds
- Drafts restore on form re-entry
- Drafts clear on successful submission
- UX is seamless and intuitive

## Reporting Issues

For any failures found during testing:

1. **Document the Issue**:
   - Task ID (T078-T085)
   - Description of what's broken
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/videos if applicable

2. **Severity Classification**:
   - **Critical**: App crashes, data loss, accessibility blocker
   - **High**: Major functionality broken, poor UX
   - **Medium**: Minor functionality issue
   - **Low**: Cosmetic issue, minor polish

3. **Create Issues**:
   - Add to tasks.md or create GitHub issues
   - Assign priority
   - Fix before marking Phase 10 complete

## Testing Completion Checklist

- [ ] T078: Quickstart validation passed
- [ ] T079: All 29 functional requirements verified
- [ ] T080: iOS VoiceOver testing passed
- [ ] T081: Android TalkBack testing passed
- [ ] T082: Performance audit passed (all targets met)
- [ ] T083: Touch target measurements passed (all ≥48px)
- [ ] T084: Large dataset testing passed (50+ records)
- [ ] T085: Form draft flow passed (all scenarios work)

## Post-Testing

Once all tests pass:

1. Mark tasks T078-T085 as complete in tasks.md
2. Update IMPLEMENTATION_SUMMARY.md with test results
3. Create final commit for Phase 10 completion
4. Update documentation with any findings
5. Prepare for production deployment

---

**Note**: These are manual testing tasks that require a running app and user interaction. They cannot be automated at this stage but are critical for ensuring production quality.
