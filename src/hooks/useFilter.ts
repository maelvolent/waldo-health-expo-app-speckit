/**
 * useFilter Hook
 * Manages exposure list filtering state and logic
 *
 * Usage:
 *   const { filters, setFilters, filtered, activeFilterCount } = useFilter(exposures);
 *
 * Features:
 * - Multi-criteria filtering (type, severity, date range, sync status)
 * - Real-time filtering with useMemo for performance
 * - Active filter count for UI display
 * - Filter helpers (addFilter, removeFilter, clearFilters)
 */

import { useMemo, useState } from 'react';
import type { ExposureRecord, ExposureFilters } from '@/types/exposure';

export function useFilter(data: ExposureRecord[]) {
  const [filters, setFilters] = useState<ExposureFilters>({
    exposureType: [],
    severity: [],
    searchQuery: undefined,
  });

  // Apply filters to data - memoized for performance
  const filtered = useMemo(() => {
    return data.filter((item) => {
      // Filter by exposure type
      if (filters.exposureType && filters.exposureType.length > 0) {
        if (!filters.exposureType.includes(item.exposureType)) {
          return false;
        }
      }

      // Filter by severity
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(item.severity)) {
          return false;
        }
      }

      // Filter by date range
      if (filters.dateFrom && item.timestamp < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && item.timestamp > filters.dateTo) {
        return false;
      }

      // Filter by sync status
      if (filters.syncStatus && filters.syncStatus.length > 0) {
        if (!filters.syncStatus.includes(item.syncStatus)) {
          return false;
        }
      }

      // All filters passed
      return true;
    });
  }, [data, filters]);

  // Count active filters (excluding search query which is handled separately)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.exposureType && filters.exposureType.length > 0) {
      count += filters.exposureType.length;
    }
    if (filters.severity && filters.severity.length > 0) {
      count += filters.severity.length;
    }
    if (filters.dateFrom || filters.dateTo) {
      count += 1;
    }
    if (filters.syncStatus && filters.syncStatus.length > 0) {
      count += filters.syncStatus.length;
    }
    return count;
  }, [filters]);

  // Helper: Add a filter value
  const addFilter = (category: keyof ExposureFilters, value: string | number) => {
    setFilters((prev) => {
      if (category === 'exposureType' || category === 'severity' || category === 'syncStatus') {
        const currentValues = prev[category] || [];
        if (!currentValues.includes(value as any)) {
          return {
            ...prev,
            [category]: [...currentValues, value],
          };
        }
      }
      return prev;
    });
  };

  // Helper: Remove a filter value
  const removeFilter = (category: keyof ExposureFilters, value: string | number) => {
    setFilters((prev) => {
      if (category === 'exposureType' || category === 'severity' || category === 'syncStatus') {
        const currentValues = prev[category] || [];
        return {
          ...prev,
          [category]: currentValues.filter((v) => v !== value) as any,
        };
      }
      return prev;
    });
  };

  // Helper: Clear all filters
  const clearFilters = () => {
    setFilters({
      exposureType: [],
      severity: [],
      searchQuery: undefined,
    });
  };

  return {
    filters,
    setFilters,
    filtered,
    activeFilterCount,
    addFilter,
    removeFilter,
    clearFilters,
  };
}
