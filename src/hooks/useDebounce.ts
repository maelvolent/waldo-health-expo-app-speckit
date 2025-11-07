/**
 * useDebounce Hook
 * Debounces a value with a specified delay
 *
 * Usage:
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const debouncedQuery = useDebounce(searchQuery, 300);
 *
 * The debounced value will only update after the delay period
 * has passed without the value changing. This is useful for:
 * - Search input (wait for user to stop typing)
 * - Form auto-save (batch saves instead of saving on every keystroke)
 * - API calls (reduce number of requests)
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes (user is still typing)
    // or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
