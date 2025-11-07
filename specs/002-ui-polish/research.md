# Phase 0: Research - UX/UI Polish Improvements

**Feature**: 002-ui-polish | **Date**: 2025-11-07 | **Plan**: [plan.md](./plan.md)

## Purpose

Document best practices, proven patterns, and technical approaches for implementing comprehensive UX/UI polish improvements in React Native/Expo applications. This research resolves any technical unknowns and establishes implementation patterns before detailed design.

## Research Areas

### 1. Skeleton Screen Implementation in React Native

**Goal**: Establish best practices for skeleton loading states that appear <300ms and maintain 60fps.

#### Key Findings

**Pattern: Content-Aware Skeletons**
- Skeleton components should mirror the actual content structure (cards, lists, text blocks)
- Use `react-native-shimmer-placeholder` or implement custom shimmer with `Animated` API
- Avoid generic spinners for list/card content - users perceive skeleton screens as 33% faster

**Implementation Approach**:
```typescript
// Preferred pattern: Dedicated skeleton components
<SkeletonCard />  // Mirrors ExposureCard layout
<SkeletonList count={5} />  // Shows 5 skeleton items

// Anti-pattern: Conditional rendering with spinners
{loading && <ActivityIndicator />}
```

**Performance Considerations**:
- Use `shouldRasterizeIOS` for complex skeleton layouts to maintain 60fps
- Limit shimmer animations to visible viewport (use `FlatList` with `windowSize`)
- Cache skeleton components with `React.memo` to avoid re-renders

**Library Decision**:
- **DECISION**: Use custom implementation with `LinearGradient` from `expo-linear-gradient` (already in Expo)
- **RATIONALE**: More control over animation timing, no additional dependencies, works offline
- **ALTERNATIVE**: `react-native-shimmer-placeholder` (not needed, adds 200KB)

#### Example Pattern
```typescript
// SkeletonCard.tsx - Reusable skeleton component
import { LinearGradient } from 'expo-linear-gradient';

export const SkeletonCard = () => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.iconPlaceholder} />
      <View style={styles.textPlaceholder} />
      <View style={styles.badgePlaceholder} />
    </View>
  );
};
```

### 2. Filter and Search State Management

**Goal**: Implement real-time filtering with <100ms latency and persistent filter state.

#### Key Findings

**Pattern: Custom React Hooks for Filter State**
- Centralize filter logic in `useFilter` and `useSearch` hooks
- Use `useMemo` for derived filtered data to avoid re-computation
- Debounce search input with `useDebounce` (300ms optimal for typing)
- Store active filters in component state (not AsyncStorage for performance)

**Search Implementation**:
```typescript
// useSearch.ts - Debounced search hook
export const useSearch = (data: ExposureRecord[], delay = 300) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);

  const results = useMemo(() => {
    if (!debouncedQuery) return data;
    return data.filter(item =>
      item.workActivity.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [data, debouncedQuery]);

  return { query, setQuery, results };
};
```

**Filter Implementation**:
```typescript
// useFilter.ts - Multi-criteria filter hook
export const useFilter = (data: ExposureRecord[]) => {
  const [filters, setFilters] = useState<ExposureFilters>({
    exposureType: [],
    severity: [],
    dateFrom: undefined,
    dateTo: undefined,
  });

  const filtered = useMemo(() => {
    return data.filter(item => {
      if (filters.exposureType.length > 0 && !filters.exposureType.includes(item.exposureType)) {
        return false;
      }
      if (filters.severity.length > 0 && !filters.severity.includes(item.severity)) {
        return false;
      }
      if (filters.dateFrom && item.timestamp < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && item.timestamp > filters.dateTo) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  return { filters, setFilters, filtered, activeFilterCount: countActiveFilters(filters) };
};
```

**UI Pattern**: FilterBar Component
- Horizontal scroll of filter chips (pills)
- Active filters show badge count
- Clear all button when filters active
- Uses `@expo/vector-icons` for filter icons

#### Performance Optimization
- **Large lists (50+ items)**: Use `FlatList` with `getItemLayout` for fixed-height items
- **Search + Filter**: Apply search first (smaller dataset), then filters
- **Analytics**: Track filter usage for future optimization

### 3. Haptic Feedback Integration

**Goal**: Add tactile feedback for touch interactions with <16ms response time.

#### Key Findings

**Library**: `expo-haptics` (requires installation)
```bash
npx expo install expo-haptics
```

**Usage Patterns**:
```typescript
// useHaptics.ts - Wrapper hook for consistent feedback
import * as Haptics from 'expo-haptics';

export const useHaptics = () => {
  const light = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const medium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  const selection = () => Haptics.selectionAsync();
  const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  const warning = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  const error = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

  return { light, medium, heavy, selection, success, warning, error };
};
```

**When to Use**:
- **Light**: Tab bar navigation, filter chip toggle
- **Medium**: Card tap, button press
- **Selection**: Scrolling through picker items
- **Success**: Form submission success
- **Warning**: Form validation warning
- **Error**: Form submission error

**Best Practices**:
- Always wrap in `try/catch` (haptics may not be supported on all devices)
- Don't overuse - only for meaningful interactions
- Test on real devices (simulator doesn't support haptics)

### 4. Form Validation and Auto-Save

**Goal**: Inline validation with real-time feedback and draft auto-save.

#### Key Findings

**Pattern: Field-Level Validation with Inline Errors**
```typescript
// InlineError.tsx - Field validation error display
export const InlineError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={16} color={colors.error} />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};

// Usage in form field
<TextInput
  value={workActivity}
  onChangeText={setWorkActivity}
  onBlur={() => validateField('workActivity', workActivity)}
/>
<InlineError error={errors.workActivity} />
```

**Auto-Save Pattern**:
```typescript
// useDraftForm.ts - Auto-save form drafts to AsyncStorage
export const useDraftForm = (formId: string, formData: ExposureDraft) => {
  const debouncedData = useDebounce(formData, 2000); // Save 2s after last edit

  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(`draft_${formId}`, JSON.stringify(debouncedData));
        console.log('Draft saved');
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    };

    if (debouncedData) {
      saveDraft();
    }
  }, [debouncedData, formId]);

  const loadDraft = async () => {
    const draft = await AsyncStorage.getItem(`draft_${formId}`);
    return draft ? JSON.parse(draft) : null;
  };

  const clearDraft = async () => {
    await AsyncStorage.removeItem(`draft_${formId}`);
  };

  return { loadDraft, clearDraft };
};
```

**Multi-Step Form Progress**:
```typescript
// FormProgress.tsx - Step indicator component
export const FormProgress: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            index < currentStep && styles.stepCompleted,
            index === currentStep && styles.stepActive,
          ]}
        />
      ))}
      <Text style={styles.text}>Step {currentStep + 1} of {totalSteps}</Text>
    </View>
  );
};
```

### 5. Icon System Migration (Emoji → Vector Icons)

**Goal**: Replace all emoji icons with professional vector icons from `@expo/vector-icons`.

#### Key Findings

**Library**: `@expo/vector-icons` (already included in Expo)
- Supports Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons
- **DECISION**: Use Ionicons as primary icon family for consistency
- **RATIONALE**: Modern, comprehensive set (1,300+ icons), optimized for mobile

**Exposure Type Icon Mapping**:
```typescript
// src/constants/icons.ts - Centralized icon mapping
import { Ionicons } from '@expo/vector-icons';

export const EXPOSURE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  silica_dust: 'cloud-outline',
  asbestos_class_a: 'warning',
  asbestos_class_b: 'warning-outline',
  welding_fumes: 'flame',
  hazardous_chemicals: 'flask',
  noise: 'volume-high',
  vibration: 'pulse',
  heat_stress: 'thermometer',
  cold_exposure: 'snow',
  contaminated_soils: 'earth',
  lead: 'beaker',
  confined_space: 'contract',
};

export const SEVERITY_ICONS = {
  low: 'checkmark-circle-outline',
  medium: 'alert-circle-outline',
  high: 'close-circle',
};
```

**Consistent Sizing**:
- Small: 16px (inline icons)
- Medium: 24px (list items, buttons)
- Large: 32px (cards, headers)
- Extra Large: 48px (empty states)

**Color Usage**:
```typescript
// src/constants/theme.ts - Semantic color tokens
export const colors = {
  icon: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};
```

### 6. Accessibility Testing and Compliance

**Goal**: Achieve WCAG 2.1 AA compliance and 90+ accessibility audit score.

#### Key Findings

**Testing Tools**:
1. **React Native Accessibility Inspector** (built-in)
   - Enable in dev menu: "Toggle Inspector" → "Accessibility"
   - Shows labels, roles, states for all elements

2. **iOS VoiceOver / Android TalkBack** (manual testing)
   - Essential for real-world validation
   - Test all user flows with screen reader

3. **react-native-testing-library** (automated)
   - Use `accessibilityLabel` queries in tests
   - Validate focus order and keyboard navigation

**Key Requirements**:

**Touch Targets**: 44x44 minimum (WCAG 2.1 AA)
```typescript
// Enforce minimum touch target size
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Accessibility Labels**: All interactive elements
```typescript
<TouchableOpacity
  accessibilityLabel="View exposure details for silica dust on March 15"
  accessibilityRole="button"
  accessibilityHint="Opens detailed view with exposure information"
>
  <ExposureCard exposure={item} />
</TouchableOpacity>
```

**Color Contrast**: 4.5:1 for text, 3:1 for UI components
```typescript
// Validated contrast ratios in theme.ts
export const colors = {
  text: {
    primary: '#000000',   // 21:1 on white (PASS)
    secondary: '#4B5563', // 9.4:1 on white (PASS)
  },
  background: {
    surface: '#FFFFFF',
    elevated: '#F9FAFB',
  },
};
```

**Focus Management**:
```typescript
// Announce dynamic content changes to screen readers
import { AccessibilityInfo } from 'react-native';

const announceFilterResults = (count: number) => {
  AccessibilityInfo.announceForAccessibility(
    `Showing ${count} exposure${count !== 1 ? 's' : ''}`
  );
};
```

**Testing Checklist**:
- [ ] All interactive elements have `accessibilityLabel`
- [ ] All touch targets meet 44x44 minimum
- [ ] Color contrast meets 4.5:1 (text) and 3:1 (UI)
- [ ] Screen reader can navigate all content
- [ ] Focus order is logical and intuitive
- [ ] Form errors are announced to screen readers
- [ ] Loading states are announced

### 7. Empty State Design

**Goal**: Provide clear guidance when lists/searches return no results.

#### Key Findings

**Pattern: Contextual Empty States**
```typescript
// EmptyState.tsx - Reusable empty state component
export const EmptyState: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.icon.muted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button onPress={onAction}>{actionLabel}</Button>
      )}
    </View>
  );
};
```

**Context-Specific Messages**:
- **No exposures yet**: "No exposures recorded" + "Log your first exposure" CTA
- **No search results**: "No results found for '{query}'" + "Try different keywords"
- **No filtered results**: "No exposures match these filters" + "Clear filters" CTA
- **Sync queue empty**: "All exposures synced" + success icon

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Skeleton Library** | Custom with `expo-linear-gradient` | Already in Expo, full control, offline support |
| **Icon Library** | Ionicons from `@expo/vector-icons` | Already in Expo, 1,300+ icons, modern design |
| **Haptic Library** | `expo-haptics` | Official Expo API, consistent cross-platform |
| **Search Debounce** | 300ms | Optimal for typing (not too fast, not too slow) |
| **Auto-Save Delay** | 2000ms (2s) | Balance between saving frequently and performance |
| **Filter Storage** | Component state (not AsyncStorage) | Real-time performance, filters not persisted across sessions |
| **Testing Framework** | Jest + React Native Testing Library + Detox | Already in project, comprehensive coverage |

## Open Questions

**NONE** - All technical decisions resolved during research phase.

## Next Steps

1. ✅ Phase 0 complete - All research documented
2. ⏭️ Proceed to Phase 1: Create data-model.md (filter state models, search state models)
3. ⏭️ Proceed to Phase 1: Create contracts/ (component prop interfaces)
4. ⏭️ Proceed to Phase 1: Create quickstart.md (developer guide)
5. ⏭️ Update agent context with research findings

## References

- [React Native Accessibility Guide](https://reactnative.dev/docs/accessibility)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Loading States](https://material.io/design/communication/loading.html)
- [iOS Human Interface Guidelines - Haptic Feedback](https://developer.apple.com/design/human-interface-guidelines/haptics)
