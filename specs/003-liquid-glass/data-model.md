# Data Model: Liquid Glass Visual Design

**Feature**: 003-liquid-glass
**Phase**: Phase 1 Design
**Date**: 2025-01-07

## Overview

This document defines the data structures and configuration models for implementing glass effects throughout the Waldo Health app. Unlike traditional features with database entities, this visual design enhancement uses **configuration models** and **component props** rather than persisted data.

## Configuration Entities

### GlassEffectConfig

Defines the visual parameters for glass blur effects across different UI contexts.

**Fields**:

| Field | Type | Description | Validation Rules |
|-------|------|-------------|------------------|
| `intensity` | `number` | Blur strength (0-100) | Required, 0 ≤ value ≤ 100 |
| `tint` | `'light' \| 'dark' \| 'default'` | Blur tint color scheme | Required |
| `fallbackColor` | `string` | Solid color for Reduce Transparency mode | Required, valid CSS color |
| `cornerRadius` | `number` | Border radius in points | Optional, default 0 |
| `enabled` | `boolean` | Whether blur is currently active | Optional, default true |

**Example**:
```typescript
{
  intensity: 80,
  tint: 'light',
  fallbackColor: '#FFFFFF',
  cornerRadius: 12,
  enabled: true
}
```

**Relationships**:
- One GlassEffectConfig per UI component type (NavBar, Card, Modal, Button)
- Config inherits from theme color tokens for fallbackColor values
- Platform-specific: iOS uses blur, Android uses fallback only

**State Transitions**:
```
enabled: true → User enables "Reduce Transparency" → fallbackColor applied
enabled: true → Platform is Android → fallbackColor applied
enabled: false → Render as standard View with no blur
```

---

### GlassPreset

Predefined glass effect configurations for common UI patterns.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Preset identifier (e.g., 'navigation', 'card') |
| `config` | `GlassEffectConfig` | Glass effect configuration |
| `description` | `string` | Usage context description |

**Predefined Presets**:

```typescript
const glassPresets = {
  navigation: {
    name: 'navigation',
    config: {
      intensity: 85,
      tint: 'light',
      fallbackColor: colors.surface,
      cornerRadius: 0,
    },
    description: 'Tab bar and navigation headers',
  },
  card: {
    name: 'card',
    config: {
      intensity: 75,
      tint: 'light',
      fallbackColor: colors.surface,
      cornerRadius: 12,
    },
    description: 'Exposure cards and content containers',
  },
  modal: {
    name: 'modal',
    config: {
      intensity: 50,
      tint: 'dark',
      fallbackColor: 'rgba(0, 0, 0, 0.6)',
      cornerRadius: 16,
    },
    description: 'Modal overlays and dialogs',
  },
  button: {
    name: 'button',
    config: {
      intensity: 80,
      tint: 'light',
      fallbackColor: colors.primaryContainer,
      cornerRadius: 8,
    },
    description: 'Primary and secondary buttons',
  },
  input: {
    name: 'input',
    config: {
      intensity: 70,
      tint: 'default',
      fallbackColor: colors.surfaceVariant,
      cornerRadius: 8,
    },
    description: 'Form input fields',
  },
};
```

**Validation Rules**:
- Preset names must be unique
- All presets must include complete GlassEffectConfig
- Fallback colors must meet WCAG 2.1 AA contrast requirements

---

### BlurCapability

Represents the device/platform capability for rendering glass effects.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `liquidGlass` | `boolean` | True if iOS 26+ with native Liquid Glass support |
| `standardBlur` | `boolean` | True if iOS 13+ with standard blur support |
| `fallbackOnly` | `boolean` | True if Android or no blur support |
| `platform` | `'ios' \| 'android'` | Current platform |
| `reduceTransparencyEnabled` | `boolean` | iOS accessibility setting status |

**Example**:
```typescript
// iOS 15 device
{
  liquidGlass: false,
  standardBlur: true,
  fallbackOnly: false,
  platform: 'ios',
  reduceTransparencyEnabled: false
}

// Android device
{
  liquidGlass: false,
  standardBlur: false,
  fallbackOnly: true,
  platform: 'android',
  reduceTransparencyEnabled: false
}
```

**State Transitions**:
```
App Launch → Detect platform & iOS version → Set capability flags
User enables "Reduce Transparency" → reduceTransparencyEnabled: true
iOS 26 update → liquidGlass: true (if supported)
```

---

## Component Props Models

### GlassEffectProps

Props interface for the `<GlassEffect>` wrapper component.

**Type Definition**:
```typescript
export interface GlassEffectProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  fallbackColor?: string;
  style?: ViewStyle;
  enabled?: boolean;
  preset?: keyof typeof glassPresets;
  testID?: string;
}
```

**Field Descriptions**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Content to render within glass surface |
| `intensity` | `number` | 80 | Blur strength (0-100), overrides preset |
| `tint` | `'light' \| 'dark' \| 'default'` | 'light' | Blur tint, overrides preset |
| `fallbackColor` | `string` | `colors.surface` | Accessibility fallback, overrides preset |
| `style` | `ViewStyle` | `{}` | Additional React Native styles |
| `enabled` | `boolean` | `true` | Whether to render blur or fallback |
| `preset` | `string` | `undefined` | Use predefined preset (e.g., 'card') |
| `testID` | `string` | `undefined` | Test identifier for automation |

**Validation**:
- If `preset` provided, it overrides `intensity`, `tint`, and `fallbackColor`
- `intensity` must be between 0-100
- `fallbackColor` must be valid color string (hex, rgba, named)
- `children` is required (cannot be empty)

**Usage Example**:
```typescript
// Using preset
<GlassEffect preset="card">
  <Text>Card content</Text>
</GlassEffect>

// Custom configuration
<GlassEffect
  intensity={90}
  tint="dark"
  fallbackColor={colors.surfaceDark}
  style={{ padding: 16 }}
>
  <Text>Custom glass surface</Text>
</GlassEffect>

// Disabled for testing
<GlassEffect enabled={false}>
  <Text>Opaque surface</Text>
</GlassEffect>
```

---

### GlassCardProps

Props for the `<GlassCard>` component with glass styling.

**Type Definition**:
```typescript
export interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  preset?: 'card' | 'elevated';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}
```

**Validation**:
- `onPress` and `onLongPress` are optional (card can be non-interactive)
- If `disabled: true`, opacity reduced and touch events blocked
- Accessibility props required if `onPress` provided

---

### GlassModalProps

Props for the `<GlassModal>` component.

**Type Definition**:
```typescript
export interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  backdropIntensity?: number;
  contentPreset?: 'modal' | 'card';
  animationType?: 'slide' | 'fade';
  testID?: string;
}
```

**Validation**:
- `visible` and `onClose` are required
- `backdropIntensity` defaults to 50 (dark tint blur behind modal)
- `contentPreset` determines glass config for modal content surface

---

## Theme Integration Models

### GlassThemeExtension

Extension to existing theme system for glass-specific color tokens.

**Added to `src/constants/theme.ts`**:
```typescript
export const glassColors = {
  // Light mode glass
  glassLight: {
    tint: 'light' as const,
    fallback: colors.surface,
    textColor: colors.text,  // Pre-validated 4.8:1 contrast
  },

  // Dark mode glass
  glassDark: {
    tint: 'dark' as const,
    fallback: colors.surfaceDark,
    textColor: colors.onPrimary,  // Pre-validated 12.5:1 contrast
  },

  // Tinted glass (for buttons, interactive elements)
  glassPrimary: {
    tint: 'light' as const,
    fallback: colors.primaryContainer,
    textColor: colors.onPrimaryContainer,
  },
};
```

**Contrast Validation**:
- All `textColor` values pre-validated to meet WCAG 2.1 AA (4.5:1 minimum)
- Fallback colors tested against text colors in both light and dark modes
- Documented in component JSDoc for reference

---

## Derived Data & Calculations

### Blur Intensity Calculation

For components that need adaptive blur based on context:

```typescript
function calculateBlurIntensity(
  baseIntensity: number,
  scrollOffset: number,
  maxOffset: number
): number {
  // Increase blur intensity as user scrolls
  const scrollRatio = Math.min(scrollOffset / maxOffset, 1);
  return baseIntensity + (scrollRatio * 20);  // Max +20 intensity
}
```

**Use Case**: Navigation bar blur intensifies as content scrolls beneath it

---

### Contrast Ratio Validation

Utility to verify text remains accessible on glass surfaces:

```typescript
function validateGlassContrast(
  fallbackColor: string,
  textColor: string
): { isAccessible: boolean; ratio: number } {
  const ratio = calculateContrastRatio(fallbackColor, textColor);
  return {
    isAccessible: ratio >= 4.5,  // WCAG 2.1 AA minimum
    ratio,
  };
}
```

**Use Case**: Automated testing and runtime validation in development mode

---

## No Persistence Required

**Important**: This feature does NOT require database persistence. All configuration is:
- Hardcoded in theme constants
- Derived from existing theme tokens
- Stateful only in component props (React state)

**Rationale**: Glass effects are purely visual - no user preferences, no data storage, no sync requirements.

---

## Relationships to Existing Models

### Theme System

**Relationship**: GlassEffectConfig → `colors` from `src/constants/theme.ts`

```typescript
import { colors } from '@constants/theme';

const glassConfig: GlassEffectConfig = {
  intensity: 80,
  tint: 'light',
  fallbackColor: colors.surface,  // References existing theme token
};
```

**Dependency**: Glass effects depend on theme for fallback colors and text colors

---

### Accessibility Settings

**Relationship**: BlurCapability → iOS system settings (AccessibilityInfo API)

```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceTransparency, setReduceTransparency] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceTransparencyEnabled().then(enabled => {
    setReduceTransparency(enabled);
  });
}, []);
```

**Dependency**: Blur rendering depends on iOS accessibility preferences

---

### Platform Detection

**Relationship**: BlurCapability → `Platform` from `react-native`

```typescript
import { Platform } from 'react-native';

const capability: BlurCapability = {
  liquidGlass: Platform.OS === 'ios' && isLiquidGlassAvailable(),
  standardBlur: Platform.OS === 'ios',
  fallbackOnly: Platform.OS === 'android',
  platform: Platform.OS,
  reduceTransparencyEnabled: false,
};
```

---

## Type Definitions Summary

```typescript
// Core types
export type GlassTint = 'light' | 'dark' | 'default';
export type GlassPresetName = 'navigation' | 'card' | 'modal' | 'button' | 'input';

// Configuration
export interface GlassEffectConfig {
  intensity: number;  // 0-100
  tint: GlassTint;
  fallbackColor: string;
  cornerRadius?: number;
  enabled?: boolean;
}

// Capability detection
export interface BlurCapability {
  liquidGlass: boolean;
  standardBlur: boolean;
  fallbackOnly: boolean;
  platform: 'ios' | 'android';
  reduceTransparencyEnabled: boolean;
}

// Component props
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

// Presets
export interface GlassPreset {
  name: GlassPresetName;
  config: GlassEffectConfig;
  description: string;
}
```

---

## Next Steps

With data models defined, proceed to:

1. **Contracts**: Define component prop interfaces and behavior contracts
2. **Quickstart**: Create developer guide with usage examples
3. **Tasks**: Break down implementation into specific development tasks
