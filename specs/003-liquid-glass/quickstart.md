# Quickstart: Liquid Glass Implementation

**Feature**: 003-liquid-glass
**For**: Developers implementing glass effects in Waldo Health
**Est. Reading Time**: 10 minutes

## Overview

This guide shows you how to add iOS-style glass blur effects to components in the Waldo Health app. Glass effects create a modern, premium visual design while maintaining accessibility and performance.

**What You'll Learn**:
- How to add glass effects to components
- When to use glass vs solid backgrounds
- How to maintain accessibility compliance
- How to test glass effects

## Prerequisites

- Expo SDK 54 installed
- Access to iOS simulator or device (glass effects iOS-only)
- Familiarity with React Native components
- Understanding of theme system (`src/constants/theme.ts`)

## Installation

```bash
# Install expo-blur
npx expo install expo-blur

# No additional configuration needed
```

## Quick Start: Add Glass to a Card

### Step 1: Import GlassEffect Component

```typescript
import { GlassEffect } from '@components/common/GlassEffect';
import { colors } from '@constants/theme';
```

### Step 2: Wrap Your Content

```typescript
// Before: Solid background card
<View style={{ backgroundColor: colors.surface, padding: 16 }}>
  <Text>Exposure Type: Asbestos</Text>
  <Text>Date: 2025-01-07</Text>
</View>

// After: Glass effect card
<GlassEffect preset="card" style={{ padding: 16 }}>
  <Text style={{ color: colors.text }}>Exposure Type: Asbestos</Text>
  <Text style={{ color: colors.textSecondary }}>Date: 2025-01-07</Text>
</GlassEffect>
```

**That's it!** The component automatically handles:
- ✅ iOS blur rendering
- ✅ Android fallback to solid background
- ✅ Accessibility (Reduce Transparency support)
- ✅ Contrast validation

## Common Use Cases

### Use Case 1: Navigation Bar with Glass

```typescript
import { GlassEffect } from '@components/common/GlassEffect';

const MyTabBar = () => (
  <GlassEffect
    preset="navigation"
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
    }}
  >
    {/* Tab buttons */}
    <View style={{ flexDirection: 'row' }}>
      <TabButton icon="home" label="Home" />
      <TabButton icon="list" label="List" />
      <TabButton icon="map" label="Map" />
    </View>
  </GlassEffect>
);
```

**Why This Works**:
- Uses `preset="navigation"` for appropriate blur intensity (85)
- Positioned absolutely to float over content
- Content scrolls behind with blur effect

### Use Case 2: Modal Overlay

```typescript
import { GlassEffect } from '@components/common/GlassEffect';
import { StyleSheet } from 'react-native';

const FilterModal = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    {/* Dark blur backdrop */}
    <GlassEffect
      preset="modal"
      style={StyleSheet.absoluteFill}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>
    </GlassEffect>

    {/* Modal content with light glass */}
    <View style={styles.modalContainer}>
      <GlassEffect
        preset="card"
        style={styles.modalContent}
      >
        <Text style={styles.title}>Filter Exposures</Text>
        {/* Filter options */}
      </GlassEffect>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
});
```

**Why This Works**:
- Dark blur (`preset="modal"`) for backdrop creates focus
- Light blur (`preset="card"`) for content maintains readability
- Layered glass creates depth hierarchy

### Use Case 3: Custom Glass Button

```typescript
import { GlassEffect } from '@components/common/GlassEffect';
import { useHaptics } from '@hooks/useHaptics';

const GlassButton = ({ onPress, children }) => {
  const { light } = useHaptics();

  return (
    <TouchableOpacity
      onPress={() => {
        light();
        onPress();
      }}
      activeOpacity={0.8}
    >
      <GlassEffect
        preset="button"
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: colors.primary,
            fontWeight: '600',
            fontSize: 16,
          }}
        >
          {children}
        </Text>
      </GlassEffect>
    </TouchableOpacity>
  );
};

// Usage
<GlassButton onPress={handleSave}>
  Save Exposure
</GlassButton>
```

**Why This Works**:
- Combines glass effect with haptic feedback
- Uses `activeOpacity` for visual feedback on press
- Button text uses high-contrast color for accessibility

## Available Presets

| Preset | Intensity | Tint | Use Case | Example |
|--------|-----------|------|----------|---------|
| `navigation` | 85 | light | Tab bars, headers | Bottom tab navigation |
| `card` | 75 | light | Content cards | Exposure cards in list |
| `modal` | 50 | dark | Modal backdrops | Filter menu overlay |
| `button` | 80 | light | Interactive buttons | Primary action buttons |
| `input` | 70 | default | Form fields | Text input backgrounds |

## Custom Configuration

When presets don't fit your needs, use custom props:

```typescript
<GlassEffect
  intensity={90}  // More pronounced blur
  tint="dark"     // Dark tint for contrast
  fallbackColor="rgba(0, 0, 0, 0.8)"  // Accessibility fallback
  style={{
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',  // Subtle border
  }}
>
  <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
    High-contrast glass surface
  </Text>
</GlassEffect>
```

## Accessibility Best Practices

### Rule 1: Always Provide Fallback Color

```typescript
// ✅ GOOD: Includes fallback
<GlassEffect
  intensity={80}
  tint="light"
  fallbackColor={colors.surface}  // Required!
>
  <Text>Content</Text>
</GlassEffect>

// ❌ BAD: No fallback (will use default, but explicit is better)
<GlassEffect intensity={80} tint="light">
  <Text>Content</Text>
</GlassEffect>
```

**Why**: iOS "Reduce Transparency" setting requires solid fallback color

### Rule 2: Validate Text Contrast

```typescript
// ✅ GOOD: High contrast text on glass
<GlassEffect tint="light" fallbackColor="#FFFFFF">
  <Text style={{ color: '#000000' }}>  {/* 9.2:1 contrast ratio */}
    High contrast text
  </Text>
</GlassEffect>

// ❌ BAD: Low contrast text on glass
<GlassEffect tint="light" fallbackColor="#CCCCCC">
  <Text style={{ color: '#AAAAAA' }}>  {/* 2.1:1 contrast ratio - fails WCAG */}
    Low contrast text
  </Text>
</GlassEffect>
```

**Tool**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to validate

### Rule 3: Test with Accessibility Settings

```typescript
// In iOS Simulator: Settings > Accessibility > Display & Text Size

// Test checklist:
// 1. Enable "Reduce Transparency" - verify fallback color appears
// 2. Enable "Increase Contrast" - verify text remains readable
// 3. Enable VoiceOver - verify all elements announced correctly
// 4. Set text size to "Largest" - verify no text overflow
```

## Performance Guidelines

### Guideline 1: Limit Blur Instances

```typescript
// ✅ GOOD: Limited glass effects
<View>
  <GlassEffect preset="navigation">
    <TabBar />
  </GlassEffect>

  <ScrollView>
    <GlassEffect preset="card">
      <ExposureCard />  {/* 3-4 cards visible at once = OK */}
    </GlassEffect>
  </ScrollView>
</View>

// ❌ BAD: Excessive glass effects
<ScrollView>
  {exposures.map(item => (
    <GlassEffect preset="card" key={item.id}>
      <ExposureCard />  {/* 50+ blurs = frame drops */}
    </GlassEffect>
  ))}
</ScrollView>
```

**Rule**: Maximum 5 simultaneous glass effects per screen

### Guideline 2: Avoid Blur Stacking

```typescript
// ✅ GOOD: Single blur layer
<GlassEffect preset="card">
  <View>
    <Text>Title</Text>
    <Text>Description</Text>
  </View>
</GlassEffect>

// ❌ BAD: Nested blurs
<GlassEffect preset="card">
  <GlassEffect preset="button">
    <GlassEffect intensity={90}>
      <Text>Triple blur = performance killer</Text>
    </GlassEffect>
  </GlassEffect>
</GlassEffect>
```

**Why**: Each blur layer multiplies GPU cost exponentially

### Guideline 3: Use Static Rasterization

```typescript
// For non-animated blurs (better performance)
<GlassEffect
  preset="navigation"
  style={{
    shouldRasterizeIOS: true,  // Cache blur for better performance
    rasterizationScale: PixelRatio.get(),
  }}
>
  <TabBar />
</GlassEffect>
```

## Testing Glass Effects

### Unit Tests

```typescript
import { render } from '@testing-library/react-native';
import { GlassEffect } from '@components/common/GlassEffect';

describe('GlassEffect', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <GlassEffect preset="card">
        <Text>Test Content</Text>
      </GlassEffect>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('disables blur when enabled={false}', () => {
    const { getByTestID } = render(
      <GlassEffect enabled={false} testID="glass">
        <Text>Content</Text>
      </GlassEffect>
    );

    // Should render as View, not BlurView
    expect(getByTestID('glass').type).toBe('View');
  });
});
```

### Visual Regression Tests

```typescript
// Using react-native-testing-library + jest-snapshot

it('matches snapshot with glass effect', () => {
  const tree = renderer
    .create(
      <GlassEffect preset="card">
        <Text>Snapshot Test</Text>
      </GlassEffect>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});

it('matches snapshot with Reduce Transparency', () => {
  // Mock AccessibilityInfo
  jest.spyOn(AccessibilityInfo, 'isReduceTransparencyEnabled')
    .mockResolvedValue(true);

  const tree = renderer
    .create(
      <GlassEffect preset="card" fallbackColor="#FFFFFF">
        <Text>Fallback Test</Text>
      </GlassEffect>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
```

## Troubleshooting

### Problem: Blur Not Appearing

**Symptoms**: Component renders as solid color on iOS

**Solutions**:
1. Check `enabled` prop is not `false`
2. Verify running on iOS simulator/device (Android shows fallback)
3. Check iOS version is 13+ (`expo-blur` requirement)
4. Restart Metro bundler: `npx expo start --clear`

```typescript
// Debug: Log platform and blur capability
import { Platform } from 'react-native';

console.log('Platform:', Platform.OS);
console.log('iOS Version:', Platform.Version);
```

### Problem: Poor Performance / Frame Drops

**Symptoms**: Scrolling feels laggy when glass effects visible

**Solutions**:
1. Count glass instances on screen (should be ≤ 5)
2. Remove nested GlassEffect components
3. Use `shouldRasterizeIOS` for static blurs
4. Consider removing glass from list items

```typescript
// Performance debugging
import { PerformanceMonitor } from 'react-native';

// Shake device > "Show Perf Monitor"
// Watch FPS - should stay at 60
```

### Problem: Accessibility Violation

**Symptoms**: Contrast checker fails, VoiceOver doesn't work

**Solutions**:
1. Validate `fallbackColor` + text color contrast >= 4.5:1
2. Use theme colors (pre-validated): `colors.text`, `colors.surface`
3. Test with Reduce Transparency enabled
4. Ensure `fallbackColor` prop is provided

```typescript
// Validate contrast
import { validateGlassContrast } from '@utils/accessibility';

const result = validateGlassContrast(colors.surface, colors.text);
console.log('Contrast ratio:', result.ratio);  // Should be >= 4.5
console.log('Accessible:', result.isAccessible);  // Should be true
```

### Problem: Android Shows Solid Background

**Symptoms**: Android users don't see blur effect

**Solution**: This is **expected behavior**. Android receives opaque fallback:

```typescript
// Expected: Different appearance on each platform
// iOS: Translucent blur
// Android: Solid color from fallbackColor prop

<GlassEffect
  preset="card"
  fallbackColor={colors.surface}  // Android uses this
>
  <Text>Cross-platform content</Text>
</GlassEffect>
```

**Why**: Android doesn't support hardware-accelerated blur efficiently

## Next Steps

1. **Start Simple**: Add glass to navigation bar first (high visual impact, low risk)
2. **Validate Accessibility**: Test with VoiceOver and Reduce Transparency
3. **Monitor Performance**: Check frame rate with multiple glass instances
4. **Expand Gradually**: Add glass to cards, then modals, then buttons

## Additional Resources

- [Expo Blur Documentation](https://docs.expo.dev/versions/latest/sdk/blur-view/)
- [iOS Human Interface Guidelines - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [React Native Performance Optimization](https://reactnative.dev/docs/performance)

## Support

Questions or issues? Check:
- `specs/003-liquid-glass/research.md` - Technical research and library comparison
- `specs/003-liquid-glass/data-model.md` - Component props and configuration
- `specs/003-liquid-glass/contracts/` - Component behavior contracts
- CLAUDE.md - Project conventions and glass effect patterns

## Examples in Codebase

Once implemented, refer to:
- `src/components/common/GlassEffect.tsx` - Base component
- `src/app/(tabs)/_layout.tsx` - Navigation bar glass
- `src/components/exposure/ExposureCard.tsx` - Card glass
- `src/components/exposure/FilterBar.tsx` - Modal glass
