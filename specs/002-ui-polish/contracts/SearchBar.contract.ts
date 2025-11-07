/**
 * Component Contract: SearchBar
 *
 * Purpose: Search input with debouncing and clear button
 * Location: src/components/exposure/SearchBar.tsx
 */

export interface SearchBarProps {
  /**
   * Current search query value
   */
  query: string;

  /**
   * Callback when query changes
   */
  onQueryChange: (query: string) => void;

  /**
   * Placeholder text
   * @default "Search exposures..."
   */
  placeholder?: string;

  /**
   * Is search actively loading results
   * @default false
   */
  isLoading?: boolean;

  /**
   * Number of results found (for accessibility announcement)
   */
  resultCount?: number;

  /**
   * Should auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Callback when search is cleared
   */
  onClear?: () => void;

  /**
   * Callback when search input is focused
   */
  onFocus?: () => void;

  /**
   * Callback when search input is blurred
   */
  onBlur?: () => void;
}

/**
 * Example Usage:
 *
 * ```tsx
 * import { SearchBar } from '@/components/exposure/SearchBar';
 * import { useSearch } from '@/hooks/useSearch';
 *
 * function ExposureListScreen() {
 *   const exposures = useQuery(api.exposures.list);
 *   const { query, setQuery, results } = useSearch(exposures ?? []);
 *
 *   return (
 *     <SearchBar
 *       query={query}
 *       onQueryChange={setQuery}
 *       resultCount={results.length}
 *       placeholder="Search by activity or notes..."
 *     />
 *   );
 * }
 * ```
 */
