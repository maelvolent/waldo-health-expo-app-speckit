/**
 * Component Contract: FilterBar
 *
 * Purpose: Horizontal scrollable filter bar with active filter chips
 * Location: src/components/exposure/FilterBar.tsx
 */

import { Ionicons } from '@expo/vector-icons';
import { ExposureFilters, FilterChip } from '../data-model';

export interface FilterBarProps {
  /**
   * Current active filters
   */
  filters: ExposureFilters;

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: ExposureFilters) => void;

  /**
   * Number of total items (for display context)
   */
  totalCount: number;

  /**
   * Number of filtered items (for result count)
   */
  filteredCount: number;

  /**
   * Is data currently loading
   * @default false
   */
  isLoading?: boolean;

  /**
   * Custom style for container
   */
  style?: ViewStyle;
}

export interface FilterChipProps {
  /**
   * Display label for the chip
   */
  label: string;

  /**
   * Icon to show in the chip
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Is this chip currently active
   */
  isActive: boolean;

  /**
   * Callback when chip is pressed
   */
  onPress: () => void;

  /**
   * Badge count to display (e.g., number of items with this filter)
   */
  badgeCount?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

export interface ClearFiltersButtonProps {
  /**
   * Callback when clear button is pressed
   */
  onPress: () => void;

  /**
   * Number of active filters (for accessibility label)
   */
  activeCount: number;
}

/**
 * Filter options available for exposure types
 */
export const EXPOSURE_TYPE_FILTER_OPTIONS = [
  { value: 'silica_dust', label: 'Silica Dust', icon: 'cloud-outline' as const },
  { value: 'asbestos_class_a', label: 'Asbestos A', icon: 'warning' as const },
  { value: 'asbestos_class_b', label: 'Asbestos B', icon: 'warning-outline' as const },
  { value: 'welding_fumes', label: 'Welding', icon: 'flame' as const },
  { value: 'hazardous_chemicals', label: 'Chemicals', icon: 'flask' as const },
  { value: 'noise', label: 'Noise', icon: 'volume-high' as const },
  { value: 'vibration', label: 'Vibration', icon: 'pulse' as const },
  { value: 'heat_stress', label: 'Heat', icon: 'thermometer' as const },
  { value: 'cold_exposure', label: 'Cold', icon: 'snow' as const },
  { value: 'contaminated_soils', label: 'Soil', icon: 'earth' as const },
  { value: 'lead', label: 'Lead', icon: 'beaker' as const },
  { value: 'confined_space', label: 'Confined', icon: 'contract' as const },
];

/**
 * Filter options for severity levels
 */
export const SEVERITY_FILTER_OPTIONS = [
  { value: 'low', label: 'Low', icon: 'checkmark-circle-outline' as const },
  { value: 'medium', label: 'Medium', icon: 'alert-circle-outline' as const },
  { value: 'high', label: 'High', icon: 'close-circle' as const },
];

/**
 * Example Usage:
 *
 * ```tsx
 * import { FilterBar } from '@/components/exposure/FilterBar';
 * import { useFilter } from '@/hooks/useFilter';
 *
 * function ExposureListScreen() {
 *   const exposures = useQuery(api.exposures.list);
 *   const { filters, setFilters, filtered } = useFilter(exposures ?? []);
 *
 *   return (
 *     <FilterBar
 *       filters={filters}
 *       onFiltersChange={setFilters}
 *       totalCount={exposures?.length ?? 0}
 *       filteredCount={filtered.length}
 *     />
 *   );
 * }
 * ```
 */
