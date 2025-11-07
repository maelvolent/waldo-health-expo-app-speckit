/**
 * useSearch Hook
 * Provides debounced search functionality for exposure lists
 *
 * Usage:
 *   const { query, setQuery, results, resultCount, isTyping } = useSearch(exposures, 300);
 *
 * Features:
 * - Debounced search (default 300ms)
 * - Real-time result count
 * - Typing indicator
 * - Searches across multiple fields (workActivity, notes, chemicalName, site name)
 * - Case-insensitive
 */

import { useMemo, useState } from 'react';
import type { ExposureRecord } from '@/types/exposure';
import { useDebounce } from './useDebounce';

export function useSearch(data: ExposureRecord[], delay: number = 300) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);

  // Determine if user is currently typing (query !== debouncedQuery)
  const isTyping = query !== debouncedQuery;

  // Search results - memoized for performance
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      return data;
    }

    const searchTerm = debouncedQuery.toLowerCase().trim();

    return data.filter((item) => {
      // Search in work activity
      if (item.workActivity?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in notes
      if (item.notes?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in chemical name
      if (item.chemicalName?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in site name (from location)
      if (item.location?.siteName?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in site address
      if (item.location?.address?.toLowerCase().includes(searchTerm)) {
        return true;
      }

      return false;
    });
  }, [data, debouncedQuery]);

  const resultCount = results.length;

  // Helper: Clear search
  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    results,
    resultCount,
    isTyping,
    debouncedQuery,
    clearSearch,
  };
}
