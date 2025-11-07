# Phase 1: Data Models - UX/UI Polish Improvements

**Feature**: 002-ui-polish | **Date**: 2025-11-07 | **Plan**: [plan.md](./plan.md)

## Purpose

Define data structures for filter state, search state, and form draft management. These models are used by custom React hooks and components to manage UI state.

## Filter State Model

### ExposureFilters

State object for tracking active filters in the exposure list view.

```typescript
/**
 * Filter criteria for exposure list
 * All fields are optional - undefined means "no filter applied"
 */
export interface ExposureFilters {
  /** Filter by exposure types (e.g., ['silica_dust', 'welding_fumes']) */
  exposureType?: string[];

  /** Filter by severity levels */
  severity?: ('low' | 'medium' | 'high')[];

  /** Filter by date range - start timestamp (ms since epoch) */
  dateFrom?: number;

  /** Filter by date range - end timestamp (ms since epoch) */
  dateTo?: number;

  /** Filter by sync status */
  syncStatus?: SyncStatus[];

  /** Search query string (searched across workActivity, notes, chemicalName) */
  searchQuery?: string;
}
```

**Usage Pattern**:
```typescript
const [filters, setFilters] = useState<ExposureFilters>({
  exposureType: [],
  severity: [],
});

// Add a filter
setFilters(prev => ({
  ...prev,
  exposureType: [...prev.exposureType, 'silica_dust'],
}));

// Clear all filters
setFilters({});
```

### FilterChip

UI representation of an active filter chip.

```typescript
/**
 * Represents a single filter chip in the FilterBar
 */
export interface FilterChip {
  /** Unique identifier for the filter */
  id: string;

  /** Display label (e.g., "Silica Dust", "High Severity") */
  label: string;

  /** Filter category (e.g., 'exposureType', 'severity') */
  category: keyof ExposureFilters;

  /** Raw filter value (e.g., 'silica_dust', 'high') */
  value: string | number;

  /** Icon to display (from Ionicons) */
  icon?: keyof typeof Ionicons.glyphMap;
}
```

## Search State Model

### SearchState

State object for managing search functionality.

```typescript
/**
 * Search state with debouncing and result tracking
 */
export interface SearchState {
  /** Current search query (raw input) */
  query: string;

  /** Debounced query (used for actual filtering) */
  debouncedQuery: string;

  /** Is search actively being typed */
  isTyping: boolean;

  /** Number of results found */
  resultCount: number;
}
```

**Implementation Note**: The `useSearch` hook manages this state internally and only exposes the necessary values.

## Form Draft Model

### FormDraft

Generic form draft structure for auto-save functionality.

```typescript
/**
 * Generic form draft stored in AsyncStorage
 * T represents the form data type (e.g., ExposureDraft)
 */
export interface FormDraft<T> {
  /** Unique identifier for the draft */
  draftId: string;

  /** Form data */
  data: T;

  /** Last saved timestamp */
  lastSaved: number;

  /** Form version (for migration compatibility) */
  version: number;
}
```

**Storage Key Pattern**: `draft_{formId}` (e.g., `draft_exposure_new`, `draft_exposure_edit_abc123`)

### ExposureFormState

Enhanced exposure form state with validation tracking.

```typescript
/**
 * Exposure form state with inline validation
 * Extends ExposureDraft with UI-specific validation state
 */
export interface ExposureFormState extends ExposureDraft {
  /** Field-level validation errors */
  errors: Partial<Record<keyof ExposureDraft, string>>;

  /** Fields that have been touched (blurred) */
  touched: Partial<Record<keyof ExposureDraft, boolean>>;

  /** Is form currently submitting */
  isSubmitting: boolean;

  /** Last auto-save timestamp */
  lastAutoSaved?: number;

  /** Current step in multi-step form (0-indexed) */
  currentStep: number;
}
```

**Validation Rules**:
```typescript
export const EXPOSURE_VALIDATION_RULES = {
  exposureType: {
    required: true,
    message: 'Exposure type is required',
  },
  duration: {
    required: true,
    validate: (d: Duration) => d.hours > 0 || d.minutes > 0,
    message: 'Duration must be greater than 0',
  },
  workActivity: {
    required: true,
    minLength: 3,
    message: 'Work activity must be at least 3 characters',
  },
  severity: {
    required: true,
    message: 'Severity level is required',
  },
  ppe: {
    required: false, // Optional field
  },
  chemicalName: {
    required: (formState: ExposureFormState) =>
      formState.exposureType === 'hazardous_chemicals',
    message: 'Chemical name is required for hazardous chemicals',
  },
};
```

## Skeleton State Model

### SkeletonConfig

Configuration for skeleton screen rendering.

```typescript
/**
 * Configuration for skeleton placeholder rendering
 */
export interface SkeletonConfig {
  /** Number of skeleton items to show */
  count: number;

  /** Animation speed (ms) */
  animationDuration?: number;

  /** Should shimmer animation run */
  animated?: boolean;

  /** Custom placeholder height (for dynamic content) */
  itemHeight?: number;
}
```

**Default Values**:
```typescript
export const DEFAULT_SKELETON_CONFIG: SkeletonConfig = {
  count: 5,
  animationDuration: 1500,
  animated: true,
};
```

## Empty State Model

### EmptyStateConfig

Configuration for empty state displays.

```typescript
/**
 * Configuration for empty state component
 */
export interface EmptyStateConfig {
  /** Icon to display */
  icon: keyof typeof Ionicons.glyphMap;

  /** Main title */
  title: string;

  /** Descriptive text */
  description: string;

  /** Optional CTA button label */
  actionLabel?: string;

  /** Optional CTA button handler */
  onAction?: () => void;

  /** Optional illustration image */
  illustration?: any; // ImageSourcePropType
}
```

**Preset Empty States**:
```typescript
export const EMPTY_STATE_PRESETS = {
  NO_EXPOSURES: {
    icon: 'document-text-outline',
    title: 'No exposures yet',
    description: 'Start logging your first workplace exposure',
    actionLabel: 'Log Exposure',
  },
  NO_SEARCH_RESULTS: (query: string) => ({
    icon: 'search-outline',
    title: 'No results found',
    description: `No exposures match "${query}"`,
    actionLabel: 'Clear Search',
  }),
  NO_FILTER_RESULTS: {
    icon: 'filter-outline',
    title: 'No matches',
    description: 'No exposures match these filters',
    actionLabel: 'Clear Filters',
  },
  ALL_SYNCED: {
    icon: 'checkmark-circle',
    title: 'All synced',
    description: 'All exposures are up to date',
  },
};
```

## Progress State Model

### FormProgressState

State for multi-step form progress tracking.

```typescript
/**
 * Multi-step form progress state
 */
export interface FormProgressState {
  /** Current step (0-indexed) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Array of step labels */
  stepLabels: string[];

  /** Steps that have been completed (for validation) */
  completedSteps: Set<number>;

  /** Can proceed to next step */
  canProceed: boolean;

  /** Can go back to previous step */
  canGoBack: boolean;
}
```

**Example for Exposure Form**:
```typescript
const EXPOSURE_FORM_STEPS = {
  totalSteps: 4,
  stepLabels: [
    'Exposure Type',
    'Duration & Severity',
    'Details & PPE',
    'Location & Notes',
  ],
};
```

## Derived Data Models

### FilteredExposureList

Result of applying filters and search to exposure list.

```typescript
/**
 * Result of filtering and searching exposures
 */
export interface FilteredExposureList {
  /** Filtered exposure records */
  items: ExposureRecord[];

  /** Total count before filtering */
  totalCount: number;

  /** Count after filtering */
  filteredCount: number;

  /** Active filters applied */
  activeFilters: FilterChip[];

  /** Active search query */
  searchQuery?: string;

  /** Is currently loading/filtering */
  isLoading: boolean;
}
```

### ExposureListMetrics

Analytics metrics for exposure list interactions.

```typescript
/**
 * Metrics for tracking list interactions
 */
export interface ExposureListMetrics {
  /** Number of filter changes */
  filterChangeCount: number;

  /** Number of searches performed */
  searchCount: number;

  /** Average time to find exposure (ms) */
  avgTimeToFind?: number;

  /** Most used filters */
  topFilters: { filter: string; count: number }[];
}
```

## State Management Architecture

```typescript
/**
 * Hook composition pattern for list view
 */
function ExposureListScreen() {
  // Raw data from Convex
  const exposures = useQuery(api.exposures.list);

  // Filter state
  const { filters, setFilters, filtered } = useFilter(exposures ?? []);

  // Search state
  const { query, setQuery, results } = useSearch(filtered);

  // Final filtered list
  const finalList = results;

  return (
    <View>
      <SearchBar query={query} onQueryChange={setQuery} />
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <FlatList data={finalList} ... />
    </View>
  );
}
```

## Data Flow Diagram

```
┌─────────────────┐
│  Raw Exposures  │ (from Convex useQuery)
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │  useFilter   │ (applies ExposureFilters)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  useSearch   │ (applies search query)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ Final List   │ (rendered in FlatList)
  └──────────────┘
```

## Storage Strategy

| Data Type | Storage Location | Persistence | Why |
|-----------|-----------------|-------------|-----|
| **Filters** | Component State | Session only | Real-time performance, filters not preserved across app restarts |
| **Search Query** | Component State | Session only | Real-time typing, no need to persist |
| **Form Drafts** | AsyncStorage | Persistent | User might leave app mid-form, drafts should survive |
| **Raw Exposures** | Convex (remote) + AsyncStorage (offline cache) | Persistent | Offline-first architecture |
| **Skeleton Config** | Component Props | None | Static configuration |

## Validation Strategy

**Field-Level Validation** (on blur):
```typescript
const validateField = (field: keyof ExposureDraft, value: any): string | null => {
  const rule = EXPOSURE_VALIDATION_RULES[field];

  if (rule.required && !value) {
    return rule.message;
  }

  if (rule.validate && !rule.validate(value)) {
    return rule.message;
  }

  return null;
};
```

**Form-Level Validation** (on submit):
```typescript
const validateForm = (formState: ExposureFormState): boolean => {
  const errors: Partial<Record<keyof ExposureDraft, string>> = {};

  Object.keys(EXPOSURE_VALIDATION_RULES).forEach(field => {
    const error = validateField(field as keyof ExposureDraft, formState[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return Object.keys(errors).length === 0;
};
```

## Migration Strategy

**Form Draft Version Management**:
```typescript
export const FORM_DRAFT_VERSION = 1;

export function migrateDraft(draft: FormDraft<any>): FormDraft<ExposureDraft> {
  if (draft.version === FORM_DRAFT_VERSION) {
    return draft;
  }

  // Add migration logic here when form structure changes
  // Example: v0 → v1 (add new required field with default)
  if (draft.version === 0) {
    return {
      ...draft,
      version: 1,
      data: {
        ...draft.data,
        controlMeasures: null, // New field in v1
      },
    };
  }

  return draft;
}
```

## Performance Considerations

1. **Filter Performance**:
   - Use `useMemo` to cache filtered results
   - Only re-filter when `filters` or `data` changes
   - Apply filters in order of selectivity (most restrictive first)

2. **Search Performance**:
   - Debounce search input (300ms)
   - Search on filtered data (smaller dataset)
   - Use lowercase comparison for case-insensitive search

3. **Form Auto-Save**:
   - Debounce saves (2000ms)
   - Only save if form data changed
   - Don't block UI during save

4. **Skeleton Rendering**:
   - Limit to 5-10 skeleton items
   - Use `React.memo` to prevent re-renders
   - Disable shimmer animation if performance issues

## Next Steps

1. ✅ Data models defined
2. ⏭️ Create contracts/ directory with component prop interfaces
3. ⏭️ Create quickstart.md developer guide
4. ⏭️ Update agent context
