/**
 * FilterBar Component
 * T018: Horizontal scrollable filter bar with active filter chips
 *
 * Features:
 * - Scrollable filter chips
 * - Exposure type and severity filters
 * - Clear all filters button (T023)
 * - Result count display
 * - Accessibility announcements (T027)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, AccessibilityInfo } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { FilterChip } from './FilterChip';
import { colors, spacing } from '@constants/theme';

export interface ExposureFilters {
  exposureType?: string[];
  severity?: ('low' | 'medium' | 'high')[];
  searchQuery?: string;
}

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

/**
 * Filter options available for exposure types
 */
const EXPOSURE_TYPE_FILTER_OPTIONS = [
  { value: 'silica_dust', label: 'Silica Dust', icon: 'cloud-outline' as keyof typeof Ionicons.glyphMap },
  { value: 'asbestos_a', label: 'Asbestos A', icon: 'warning' as keyof typeof Ionicons.glyphMap },
  { value: 'asbestos_b', label: 'Asbestos B', icon: 'warning-outline' as keyof typeof Ionicons.glyphMap },
  { value: 'welding_fumes', label: 'Welding', icon: 'flame' as keyof typeof Ionicons.glyphMap },
  { value: 'hazardous_chemicals', label: 'Chemicals', icon: 'flask' as keyof typeof Ionicons.glyphMap },
  { value: 'noise', label: 'Noise', icon: 'volume-high' as keyof typeof Ionicons.glyphMap },
  { value: 'meth_contamination', label: 'Meth', icon: 'warning' as keyof typeof Ionicons.glyphMap },
  { value: 'mould', label: 'Mould', icon: 'leaf' as keyof typeof Ionicons.glyphMap },
  { value: 'heat_stress', label: 'Heat', icon: 'thermometer' as keyof typeof Ionicons.glyphMap },
  { value: 'contaminated_soils', label: 'Soil', icon: 'earth' as keyof typeof Ionicons.glyphMap },
  { value: 'biological_hazards', label: 'Biological', icon: 'bug' as keyof typeof Ionicons.glyphMap },
  { value: 'radiation', label: 'Radiation', icon: 'radio' as keyof typeof Ionicons.glyphMap },
];

/**
 * Filter options for severity levels
 */
const SEVERITY_FILTER_OPTIONS = [
  { value: 'low' as const, label: 'Low', icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap },
  { value: 'medium' as const, label: 'Medium', icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap },
  { value: 'high' as const, label: 'High', icon: 'close-circle' as keyof typeof Ionicons.glyphMap },
];

export function FilterBar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  isLoading = false,
  style,
}: FilterBarProps) {
  const hasActiveFilters =
    (filters.exposureType && filters.exposureType.length > 0) ||
    (filters.severity && filters.severity.length > 0);

  const activeFilterCount =
    (filters.exposureType?.length || 0) + (filters.severity?.length || 0);

  // T027: Announce filter results to screen readers
  useEffect(() => {
    if (hasActiveFilters && !isLoading) {
      const message =
        filteredCount === 0
          ? 'No exposures match the selected filters'
          : filteredCount === 1
            ? '1 exposure matches the selected filters'
            : `${filteredCount} exposures match the selected filters`;
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [filteredCount, hasActiveFilters, isLoading]);

  /**
   * Toggle exposure type filter
   */
  const toggleExposureType = (type: string) => {
    const currentTypes = filters.exposureType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onFiltersChange({
      ...filters,
      exposureType: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  /**
   * Toggle severity filter
   */
  const toggleSeverity = (severity: 'low' | 'medium' | 'high') => {
    const currentSeverities = filters.severity || [];
    const newSeverities = currentSeverities.includes(severity)
      ? currentSeverities.filter((s) => s !== severity)
      : [...currentSeverities, severity];

    onFiltersChange({
      ...filters,
      severity: newSeverities.length > 0 ? newSeverities : undefined,
    });
  };

  /**
   * T023: Clear all filters
   */
  const clearAllFilters = () => {
    onFiltersChange({
      exposureType: undefined,
      severity: undefined,
      searchQuery: filters.searchQuery, // Preserve search query
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Result Count */}
      <View style={styles.header}>
        <Text variant="titleSmall" style={styles.resultCount}>
          {isLoading
            ? 'Loading...'
            : hasActiveFilters
              ? `${filteredCount} of ${totalCount} exposures`
              : `${totalCount} exposures`}
        </Text>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <IconButton
            icon="close-circle"
            size={20}
            iconColor={colors.icon.secondary}
            onPress={clearAllFilters}
            accessibilityLabel={`Clear all ${activeFilterCount} filters`}
            accessibilityHint="Remove all active filters"
          />
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Filter options"
      >
        {/* Severity Filters */}
        {SEVERITY_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            icon={option.icon}
            isActive={filters.severity?.includes(option.value) || false}
            onPress={() => toggleSeverity(option.value)}
          />
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Exposure Type Filters */}
        {EXPOSURE_TYPE_FILTER_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            icon={option.icon}
            isActive={filters.exposureType?.includes(option.value) || false}
            onPress={() => toggleExposureType(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  resultCount: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
});
