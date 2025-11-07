# VoiceOver Compatibility Testing Checklist

**Feature**: 003-liquid-glass
**Date**: 2025-01-08
**Platform**: iOS with VoiceOver enabled
**Testing Status**: Ready for manual validation

## Overview

This document provides a comprehensive checklist for validating VoiceOver compatibility with all Liquid Glass components. All glass components have been designed with accessibility in mind, including proper labels, hints, and roles.

---

## Pre-Test Setup

### Enable VoiceOver on iOS Simulator

1. Open iOS Simulator
2. Go to **Settings → Accessibility → VoiceOver**
3. Toggle **VoiceOver** ON
4. Familiarize yourself with VoiceOver gestures:
   - **Swipe right**: Move to next element
   - **Swipe left**: Move to previous element
   - **Double-tap**: Activate element
   - **Three-finger swipe**: Scroll
   - **Two-finger Z-gesture**: Go back

### Alternative: Use Accessibility Inspector

1. Open Xcode
2. **Xcode → Open Developer Tool → Accessibility Inspector**
3. Select iOS Simulator target
4. Run inspection on each screen

---

## Component Testing Checklist

### 1. GlassNavBar (Navigation Header)

**File**: `src/components/common/GlassNavBar.tsx`

**Test Scenarios**:

- [ ] **Title Announcement**
  - Navigate to GlassNavBar
  - Expected: Hears "Waldo Health, header" or similar
  - Actual: ________________

- [ ] **Left Action Button** (if present)
  - Swipe to left action (e.g., back button)
  - Expected: Hears "Go back, button"
  - Actual: ________________

- [ ] **Right Action Button** (if present)
  - Swipe to right action (e.g., settings)
  - Expected: Hears appropriate label + "button"
  - Actual: ________________

- [ ] **Focus Order**
  - Order: Title → Left Action → Right Action
  - Expected: Logical left-to-right flow
  - Actual: ________________

**Accessibility Props Verified**:
- ✅ Title has `accessibilityRole="header"`
- ✅ Action buttons have `accessibilityLabel`
- ✅ Hit slop configured for easy tapping

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

### 2. GlassCard (Exposure Cards)

**File**: `src/components/common/GlassCard.tsx`

**Test Scenarios**:

- [ ] **Card Announcement**
  - Navigate to exposure card
  - Expected: Hears full accessibility label (e.g., "Silica Dust on Jan 8, 2025, button")
  - Actual: ________________

- [ ] **Card Activation**
  - Double-tap on card
  - Expected: Navigates to detail screen
  - Confirmation: Hears new screen title
  - Actual: ________________

- [ ] **Long Press Menu**
  - Card hint: "Tap to view details, long press for options"
  - Expected: VoiceOver announces hint
  - Actual: ________________

- [ ] **Card Content Readability**
  - Type label, date, location all announced
  - Expected: All text elements accessible
  - Actual: ________________

**Accessibility Props Verified**:
- ✅ Card has `accessibilityRole="button"`
- ✅ `accessibilityLabel` provides context
- ✅ `accessibilityHint` explains actions
- ✅ Haptic feedback on press

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

### 3. GlassButton (Action Buttons)

**File**: `src/components/common/GlassButton.tsx`

**Test Scenarios**:

#### Primary Variant ("Save Exposure")

- [ ] **Button Announcement**
  - Navigate to Save button
  - Expected: Hears "Save exposure, button"
  - Actual: ________________

- [ ] **Button Activation**
  - Double-tap on button
  - Expected: Saves exposure, hears confirmation
  - Actual: ________________

- [ ] **Loading State**
  - Trigger loading state
  - Expected: Hears "Saving..." or loading indicator
  - Actual: ________________

- [ ] **Disabled State**
  - When form incomplete
  - Expected: Button announced as "dimmed" or "disabled"
  - Actual: ________________

#### Secondary Variant ("Cancel")

- [ ] **Button Announcement**
  - Navigate to Cancel button
  - Expected: Hears "Cancel, button. Go back without saving"
  - Actual: ________________

- [ ] **Button Activation**
  - Double-tap on button
  - Expected: Goes back, hears previous screen
  - Actual: ________________

**Accessibility Props Verified**:
- ✅ All variants have `accessibilityLabel`
- ✅ `accessibilityHint` explains action
- ✅ `disabled` prop correctly set
- ✅ Loading state announced

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

### 4. GlassModal (Context Menu)

**File**: `src/components/common/GlassModal.tsx`

**Test Scenarios**:

- [ ] **Modal Appearance**
  - Trigger context menu (long press on card)
  - Expected: VoiceOver focus moves to modal
  - Hears: "Options, Alert" or similar
  - Actual: ________________

- [ ] **Modal Title**
  - First element in modal
  - Expected: Hears "Options" as header
  - Actual: ________________

- [ ] **Menu Items**
  - Navigate through menu items
  - Expected order: View → Edit → Delete → Cancel
  - Each announced with role "button"
  - Actual: ________________

- [ ] **Close Button**
  - Top-right close button
  - Expected: Hears "Close, button"
  - Actual: ________________

- [ ] **Backdrop Dismissal**
  - VoiceOver on backdrop
  - Double-tap to dismiss
  - Expected: Modal closes, focus returns to card
  - Actual: ________________

- [ ] **Focus Trapping**
  - While modal open, swipe past last item
  - Expected: Focus wraps to first modal element (no escape to background)
  - Actual: ________________

**Accessibility Props Verified**:
- ✅ Modal announced as dialog/alert
- ✅ Title is header
- ✅ All menu items have labels
- ✅ Close button labeled
- ✅ Backdrop dismissal works

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

### 5. Tab Bar Glass (Bottom Navigation)

**File**: `src/app/(tabs)/_layout.tsx`

**Test Scenarios**:

- [ ] **Tab Announcements**
  - Navigate through tabs
  - Expected: Each tab announced with name + "tab" + state (selected/not selected)
  - Examples:
    - "Home, tab, 1 of 5, selected"
    - "New, tab, 2 of 5"
  - Actual: ________________

- [ ] **Tab Activation**
  - Double-tap on inactive tab
  - Expected: Switches to tab, hears new screen content
  - Actual: ________________

- [ ] **Tab Icons**
  - Each icon has accessibility label
  - Expected: Labels match tab names
  - Actual: ________________

- [ ] **Focus Order**
  - Swipe through tabs left-to-right
  - Expected: Logical order: Home → New → History → Export → Learn
  - Actual: ________________

**Accessibility Props Verified**:
- ✅ Each tab has `accessibilityLabel`
- ✅ Icons have descriptive labels
- ✅ Haptic feedback on tab press

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

### 6. Home Screen with Glass Navigation

**File**: `src/app/(tabs)/index.tsx`

**Test Scenarios**:

- [ ] **Screen Announcement**
  - Navigate to home screen
  - Expected: Hears "Waldo Health" (from GlassNavBar)
  - Actual: ________________

- [ ] **Greeting Text**
  - Swipe to greeting
  - Expected: Hears "Welcome back, [Name]!"
  - Actual: ________________

- [ ] **Action Cards**
  - Navigate to "Document Exposure" card
  - Expected: Hears "Document new exposure, button. Navigate to exposure documentation form"
  - Actual: ________________

- [ ] **Statistics**
  - Swipe to "View History" card
  - Expected: Hears "View exposure history, button. View X recent exposures"
  - Actual: ________________

- [ ] **Glass Transparency**
  - Verify glass doesn't interfere with content announcement
  - Expected: All text readable, no missing elements
  - Actual: ________________

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

**Issues Found**: _______________________________

---

## Common VoiceOver Issues to Check

### Focus Management

- [ ] **Initial Focus**: When screen loads, focus on logical first element
- [ ] **Modal Focus**: When modal opens, focus moves to modal
- [ ] **Return Focus**: When modal closes, focus returns to trigger element
- [ ] **No Focus Traps**: Can always navigate away from any element

### Element Announcements

- [ ] **Decorative Elements Hidden**: Glass blur itself not announced (it's visual only)
- [ ] **Interactive Elements Announced**: All buttons, links, cards announced with role
- [ ] **Text Elements Clear**: All text content announced in logical order
- [ ] **Status Changes**: Loading, error, success states announced

### Navigation

- [ ] **Gesture Support**: Standard VoiceOver gestures work (swipe, double-tap, etc.)
- [ ] **Logical Order**: Tab order follows visual hierarchy
- [ ] **No Hidden Elements**: All visible elements reachable via VoiceOver
- [ ] **Grouped Elements**: Related content grouped with headings

---

## Reduce Transparency Testing

### Test with Reduce Transparency ON

1. Enable **Settings → Accessibility → Display & Text Size → Reduce Transparency**
2. Re-test all components
3. Verify:
   - [ ] Opaque fallback colors used instead of blur
   - [ ] All text still readable
   - [ ] Contrast ratios maintained
   - [ ] VoiceOver behavior unchanged

**Expected**: Glass components automatically switch to opaque mode, accessibility features work identically

**Status**: ⬜ Not Tested / ✅ Pass / ❌ Fail

---

## Automated Testing Recommendations

For future implementation:

```typescript
// Example automated VoiceOver test
describe('GlassNavBar Accessibility', () => {
  it('should have correct accessibility role', () => {
    const { getByRole } = render(<GlassNavBar title="Test" />);
    expect(getByRole('header')).toBeTruthy();
  });

  it('should announce title correctly', () => {
    const { getByA11yLabel } = render(<GlassNavBar title="Test Screen" />);
    expect(getByA11yLabel(/Test Screen/)).toBeTruthy();
  });
});
```

---

## Test Summary

### Components Tested: ___ / 6

- [ ] GlassNavBar
- [ ] GlassCard
- [ ] GlassButton
- [ ] GlassModal
- [ ] Tab Bar Glass
- [ ] Home Screen

### Overall Status: ⬜ Not Started / 🔄 In Progress / ✅ Complete

### Critical Issues Found: ___

### Non-Critical Issues Found: ___

---

## Tester Sign-Off

**Tested By**: ___________________________

**Date**: ___________________________

**Device**: ___________________________ (e.g., iPhone 15 Simulator, iOS 17.2)

**VoiceOver Version**: ___________________________

**Result**: ⬜ PASS / ⬜ FAIL / ⬜ PASS WITH NOTES

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## Appendix: VoiceOver Gestures Quick Reference

| Gesture | Action |
|---------|--------|
| Swipe right | Move to next element |
| Swipe left | Move to previous element |
| Double-tap | Activate element |
| Three-finger swipe up/down | Scroll |
| Two-finger double-tap | Pause/resume speaking |
| Two-finger Z-gesture | Go back |
| Three-finger triple-tap | Turn on/off screen curtain |
| Rotor gesture (two fingers rotate) | Change navigation mode |

---

**End of Checklist**
