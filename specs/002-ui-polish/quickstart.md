# Quickstart Guide: UX/UI Polish Components

**Feature**: 002-ui-polish | **Date**: 2025-11-07 | **For**: Developers implementing polish improvements

## Purpose

Get started quickly with the new UX/UI polish components, hooks, and patterns. This guide provides copy-paste examples and common usage patterns.

## Table of Contents

1. [Installing Dependencies](#installing-dependencies)
2. [Filter & Search](#filter--search)
3. [Skeleton Loading States](#skeleton-loading-states)
4. [Empty States](#empty-states)
5. [Form Components](#form-components)
6. [Icon Migration](#icon-migration)
7. [Haptic Feedback](#haptic-feedback)
8. [Accessibility Best Practices](#accessibility-best-practices)

---

## Installing Dependencies

```bash
# Install expo-haptics for tactile feedback
npx expo install expo-haptics

# Verify @expo/vector-icons is available (should be included by default)
npm ls @expo/vector-icons
```

---

## Filter & Search

### Basic Usage - List with Filter and Search

```tsx
import { useQuery } from 'convex/react';
import { useFilter } from '@/hooks/useFilter';
import { useSearch } from '@/hooks/useSearch';
import { FilterBar } from '@/components/exposure/FilterBar';
import { SearchBar } from '@/components/exposure/SearchBar';
import { api } from '@/convex/_generated/api';

export default function ExposureListScreen() {
  // 1. Fetch data from Convex
  const exposures = useQuery(api.exposures.list);

  // 2. Apply filters
  const { filters, setFilters, filtered } = useFilter(exposures ?? []);

  // 3. Apply search to filtered results
  const { query, setQuery, results } = useSearch(filtered);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        resultCount={results.length}
        placeholder="Search by activity or notes..."
      />

      {/* Filter chips */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={exposures?.length ?? 0}
        filteredCount={results.length}
      />

      {/* Results list */}
      <FlatList
        data={results}
        renderItem={({ item }) => <ExposureCard exposure={item} />}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
}
```

### Programmatically Setting Filters

```tsx
import { ExposureFilters } from '@/types/exposure';

// Add a filter
const addFilter = (type: string) => {
  setFilters(prev => ({
    ...prev,
    exposureType: [...(prev.exposureType ?? []), type],
  }));
};

// Clear all filters
const clearFilters = () => {
  setFilters({});
};

// Set date range filter
const setDateRange = (from: Date, to: Date) => {
  setFilters(prev => ({
    ...prev,
    dateFrom: from.getTime(),
    dateTo: to.getTime(),
  }));
};

// Remove specific filter
const removeFilter = (type: string) => {
  setFilters(prev => ({
    ...prev,
    exposureType: prev.exposureType?.filter(t => t !== type) ?? [],
  }));
};
```

---

## Skeleton Loading States

### Basic Loading State

```tsx
import { SkeletonList } from '@/components/common/SkeletonList';

export default function ExposureListScreen() {
  const exposures = useQuery(api.exposures.list);

  // Show skeleton while loading
  if (exposures === undefined) {
    return <SkeletonList count={5} />;
  }

  return <FlatList data={exposures} ... />;
}
```

### Custom Skeleton Layout

```tsx
import { SkeletonCard, SkeletonText } from '@/components/common';

function CustomSkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonText width={60} height={60} borderRadius={30} />
        <View style={styles.info}>
          <SkeletonText width="80%" height={20} />
          <SkeletonText width="60%" height={16} />
        </View>
      </View>
      <SkeletonText width="100%" height={16} />
      <SkeletonText width="90%" height={16} />
    </View>
  );
}
```

### Conditional Skeleton

```tsx
function ExposureCard({ exposure, isLoading }) {
  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <View style={styles.card}>
      {/* Actual card content */}
    </View>
  );
}
```

---

## Empty States

### Basic Empty State

```tsx
import { EmptyState, EMPTY_STATE_PRESETS } from '@/components/common/EmptyState';
import { useRouter } from 'expo-router';

function ExposureListScreen() {
  const exposures = useQuery(api.exposures.list);
  const router = useRouter();

  if (exposures?.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATE_PRESETS.NO_EXPOSURES}
        onAction={() => router.push('/new')}
      />
    );
  }

  return <FlatList data={exposures} ... />;
}
```

### Empty Search Results

```tsx
function SearchResults({ query, results }) {
  if (query && results.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATE_PRESETS.NO_SEARCH_RESULTS(query)}
        onAction={() => setQuery('')}
      />
    );
  }

  return <FlatList data={results} ... />;
}
```

### Custom Empty State

```tsx
<EmptyState
  icon="warning-outline"
  title="No exposures this month"
  description="You haven't logged any exposures in March 2024"
  actionLabel="View All Exposures"
  onAction={() => router.push('/list')}
/>
```

---

## Form Components

### Multi-Step Form with Progress

```tsx
import { FormProgress } from '@/components/forms/FormProgress';
import { useState } from 'react';

export default function ExposureFormScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = ['Type', 'Duration', 'Details', 'Review'];

  return (
    <View style={styles.container}>
      <FormProgress
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepLabels={STEPS}
      />

      {currentStep === 0 && <ExposureTypeStep />}
      {currentStep === 1 && <DurationStep />}
      {currentStep === 2 && <DetailsStep />}
      {currentStep === 3 && <ReviewStep />}

      <View style={styles.buttons}>
        {currentStep > 0 && (
          <Button onPress={() => setCurrentStep(prev => prev - 1)}>
            Back
          </Button>
        )}
        <Button onPress={() => setCurrentStep(prev => prev + 1)}>
          {currentStep === STEPS.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </View>
    </View>
  );
}
```

### Field Validation with Inline Errors

```tsx
import { InlineError } from '@/components/forms/InlineError';
import { useState } from 'react';

function WorkActivityField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  const validate = () => {
    if (!value.trim()) {
      setError('Work activity is required');
    } else if (value.length < 3) {
      setError('Work activity must be at least 3 characters');
    } else {
      setError(undefined);
    }
  };

  return (
    <View>
      <Text style={styles.label}>Work Activity</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onBlur={validate}
        placeholder="e.g., Cutting concrete slabs"
      />
      <InlineError error={error} />
    </View>
  );
}
```

### Auto-Save Form Drafts

```tsx
import { DraftSaver } from '@/components/forms/DraftSaver';
import { useDraftForm } from '@/hooks/useDraftForm';
import { useEffect, useState } from 'react';

export default function ExposureFormScreen() {
  const [formData, setFormData] = useState<ExposureDraft>(initialData);
  const { loadDraft, clearDraft } = useDraftForm('exposure_new', formData);

  // Load draft on mount
  useEffect(() => {
    loadDraft().then(draft => {
      if (draft) {
        setFormData(draft);
        Alert.alert('Draft Restored', 'Your previous draft has been loaded.');
      }
    });
  }, []);

  const handleSubmit = async () => {
    try {
      await submitExposure(formData);
      await clearDraft(); // Clear draft on successful submit
      router.push('/list');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exposure');
    }
  };

  return (
    <View>
      {/* Auto-save component (renders save indicator) */}
      <DraftSaver
        draftId="exposure_new"
        formData={formData}
        onSaved={(ts) => console.log('Draft saved at', ts)}
      />

      {/* Form fields */}
      <TextInput
        value={formData.workActivity}
        onChangeText={(text) => setFormData({ ...formData, workActivity: text })}
      />

      <Button onPress={handleSubmit}>Submit</Button>
    </View>
  );
}
```

---

## Icon Migration

### Replacing Emoji with Vector Icons

**Before (Emoji)**:
```tsx
<Text style={styles.icon}>☁️</Text>
```

**After (Vector Icon)**:
```tsx
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="cloud-outline" size={24} color="#333" />
```

### Using Centralized Icon Mapping

```tsx
// src/constants/icons.ts
import { Ionicons } from '@expo/vector-icons';

export const EXPOSURE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  silica_dust: 'cloud-outline',
  asbestos_class_a: 'warning',
  welding_fumes: 'flame',
  // ... more mappings
};

// Usage in component
import { EXPOSURE_TYPE_ICONS } from '@/constants/icons';

function ExposureCard({ exposure }) {
  const iconName = EXPOSURE_TYPE_ICONS[exposure.exposureType];

  return (
    <View style={styles.card}>
      <Ionicons name={iconName} size={32} color="#333" />
      <Text>{exposure.workActivity}</Text>
    </View>
  );
}
```

### Tab Bar Icons

```tsx
// src/app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';

<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color, focused }) => (
      <Ionicons
        name={focused ? 'home' : 'home-outline'}
        size={24}
        color={color}
      />
    ),
  }}
/>
```

---

## Haptic Feedback

### Basic Haptic Usage

```tsx
import { useHaptics } from '@/hooks/useHaptics';

function ExposureCard({ exposure, onPress }) {
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light(); // Trigger light haptic feedback
    onPress(exposure);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Card content */}
    </TouchableOpacity>
  );
}
```

### Haptic Feedback Patterns

```tsx
import { useHaptics } from '@/hooks/useHaptics';

function FormScreen() {
  const haptics = useHaptics();

  const handleSubmit = async () => {
    try {
      await submitForm();
      haptics.success(); // Success haptic
      router.push('/success');
    } catch (error) {
      haptics.error(); // Error haptic
      Alert.alert('Error', 'Failed to submit');
    }
  };

  const handleFilterToggle = () => {
    haptics.selection(); // Selection change haptic
    toggleFilter();
  };

  const handleButtonPress = () => {
    haptics.medium(); // Medium impact
    performAction();
  };

  return (
    <View>
      <Button onPress={handleSubmit}>Submit</Button>
      <Button onPress={handleFilterToggle}>Toggle Filter</Button>
    </View>
  );
}
```

---

## Accessibility Best Practices

### Touch Target Sizes

```tsx
// ✅ Correct - 44x44 minimum
const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ❌ Incorrect - Too small
const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 30, // Fails WCAG 2.1 AA
  },
});
```

### Accessibility Labels

```tsx
import { TouchableOpacity } from 'react-native';

// ✅ Correct - Descriptive label
<TouchableOpacity
  accessibilityLabel="View exposure details for silica dust on March 15"
  accessibilityRole="button"
  accessibilityHint="Opens detailed view with exposure information"
  onPress={() => router.push(`/exposure/${exposure._id}`)}
>
  <ExposureCard exposure={exposure} />
</TouchableOpacity>

// ❌ Incorrect - No accessibility labels
<TouchableOpacity onPress={() => router.push('/exposure')}>
  <ExposureCard exposure={exposure} />
</TouchableOpacity>
```

### Announcing Dynamic Content

```tsx
import { AccessibilityInfo } from 'react-native';

function FilterBar({ filters, onFiltersChange }) {
  const { filtered } = useFilter(exposures);

  // Announce filter results to screen readers
  useEffect(() => {
    const count = filtered.length;
    AccessibilityInfo.announceForAccessibility(
      `Showing ${count} exposure${count !== 1 ? 's' : ''}`
    );
  }, [filtered]);

  return <View>{/* Filter UI */}</View>;
}
```

### Color Contrast

```tsx
// ✅ Correct - Meets WCAG 2.1 AA (4.5:1 for text)
const colors = {
  text: {
    primary: '#000000',   // 21:1 on white
    secondary: '#4B5563', // 9.4:1 on white
  },
  background: '#FFFFFF',
};

// ❌ Incorrect - Fails contrast requirements
const colors = {
  text: {
    primary: '#999999', // Only 2.8:1 on white (FAIL)
  },
  background: '#FFFFFF',
};
```

---

## Common Patterns

### Loading → Data → Empty State Flow

```tsx
function ExposureListScreen() {
  const exposures = useQuery(api.exposures.list);
  const router = useRouter();

  // 1. Loading state
  if (exposures === undefined) {
    return <SkeletonList count={5} />;
  }

  // 2. Empty state
  if (exposures.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATE_PRESETS.NO_EXPOSURES}
        onAction={() => router.push('/new')}
      />
    );
  }

  // 3. Data state
  return <FlatList data={exposures} ... />;
}
```

### Filter + Search + Empty State

```tsx
function ExposureListScreen() {
  const exposures = useQuery(api.exposures.list);
  const { filters, setFilters, filtered } = useFilter(exposures ?? []);
  const { query, setQuery, results } = useSearch(filtered);

  // Loading
  if (exposures === undefined) {
    return <SkeletonList count={5} />;
  }

  // No data at all
  if (exposures.length === 0) {
    return <EmptyState {...EMPTY_STATE_PRESETS.NO_EXPOSURES} />;
  }

  // No search results
  if (query && results.length === 0) {
    return (
      <View>
        <SearchBar query={query} onQueryChange={setQuery} />
        <EmptyState
          {...EMPTY_STATE_PRESETS.NO_SEARCH_RESULTS(query)}
          onAction={() => setQuery('')}
        />
      </View>
    );
  }

  // No filter results
  if (Object.keys(filters).length > 0 && results.length === 0) {
    return (
      <View>
        <FilterBar filters={filters} onFiltersChange={setFilters} />
        <EmptyState
          {...EMPTY_STATE_PRESETS.NO_FILTER_RESULTS}
          onAction={() => setFilters({})}
        />
      </View>
    );
  }

  // Has results
  return (
    <View>
      <SearchBar query={query} onQueryChange={setQuery} />
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <FlatList data={results} ... />
    </View>
  );
}
```

---

## Testing Examples

### Unit Test - useFilter Hook

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useFilter } from '@/hooks/useFilter';

describe('useFilter', () => {
  const mockData = [
    { exposureType: 'silica_dust', severity: 'high' },
    { exposureType: 'welding_fumes', severity: 'low' },
  ];

  it('should filter by exposure type', () => {
    const { result } = renderHook(() => useFilter(mockData));

    act(() => {
      result.current.setFilters({ exposureType: ['silica_dust'] });
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].exposureType).toBe('silica_dust');
  });
});
```

### Integration Test - FilterBar Component

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBar } from '@/components/exposure/FilterBar';

describe('FilterBar', () => {
  it('should call onFiltersChange when filter chip is pressed', () => {
    const onFiltersChange = jest.fn();

    const { getByText } = render(
      <FilterBar
        filters={{}}
        onFiltersChange={onFiltersChange}
        totalCount={10}
        filteredCount={10}
      />
    );

    fireEvent.press(getByText('Silica Dust'));

    expect(onFiltersChange).toHaveBeenCalledWith({
      exposureType: ['silica_dust'],
    });
  });
});
```

---

## Performance Tips

1. **Use `React.memo` for expensive components**:
```tsx
export const ExposureCard = React.memo(({ exposure }) => {
  // Component implementation
});
```

2. **Optimize FlatList rendering**:
```tsx
<FlatList
  data={results}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  windowSize={5}
  maxToRenderPerBatch={10}
/>
```

3. **Debounce search input**:
```tsx
// useSearch hook already implements debouncing (300ms)
const { query, setQuery, results } = useSearch(data);
```

4. **Memoize filtered data**:
```tsx
// useFilter hook already uses useMemo internally
const { filtered } = useFilter(data);
```

---

## Troubleshooting

**Issue**: Icons not rendering
- **Solution**: Ensure `@expo/vector-icons` is installed: `npm ls @expo/vector-icons`

**Issue**: Haptics not working
- **Solution**: Test on real device (simulator doesn't support haptics)

**Issue**: Skeleton animation stuttering
- **Solution**: Reduce `animationDuration` or disable animation: `<SkeletonList animated={false} />`

**Issue**: Filters not updating
- **Solution**: Ensure you're using `setFilters` with a new object (spread operator)

**Issue**: Search results not updating
- **Solution**: Check debounce delay (default 300ms), or reduce it: `useSearch(data, 100)`

---

## Next Steps

- Review [data-model.md](./data-model.md) for data structures
- Review [contracts/](./contracts/) for component prop interfaces
- Review [research.md](./research.md) for implementation patterns
- Run `/speckit.tasks` to generate implementation tasks
