/**
 * Component Contract: EmptyState
 *
 * Purpose: Display empty states with icon, message, and optional CTA
 * Location: src/components/common/EmptyState.tsx
 */

import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  /**
   * Icon to display (from Ionicons)
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Main heading text
   */
  title: string;

  /**
   * Descriptive text below title
   */
  description: string;

  /**
   * Optional CTA button label
   */
  actionLabel?: string;

  /**
   * Optional CTA button handler
   */
  onAction?: () => void;

  /**
   * Optional illustration image
   */
  illustration?: ImageSourcePropType;

  /**
   * Icon size
   * @default 48
   */
  iconSize?: number;

  /**
   * Icon color
   * @default colors.icon.muted
   */
  iconColor?: string;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Accessibility label override
   */
  accessibilityLabel?: string;
}

/**
 * Preset empty state configurations
 */
export const EMPTY_STATE_PRESETS = {
  NO_EXPOSURES: {
    icon: 'document-text-outline' as const,
    title: 'No exposures yet',
    description: 'Start logging your first workplace exposure',
    actionLabel: 'Log Exposure',
  },
  NO_SEARCH_RESULTS: (query: string) => ({
    icon: 'search-outline' as const,
    title: 'No results found',
    description: `No exposures match "${query}"`,
    actionLabel: 'Clear Search',
  }),
  NO_FILTER_RESULTS: {
    icon: 'filter-outline' as const,
    title: 'No matches',
    description: 'No exposures match these filters',
    actionLabel: 'Clear Filters',
  },
  ALL_SYNCED: {
    icon: 'checkmark-circle' as const,
    title: 'All synced',
    description: 'All exposures are up to date',
  },
  OFFLINE_NO_DATA: {
    icon: 'cloud-offline-outline' as const,
    title: 'No offline data',
    description: 'Connect to internet to view exposures',
  },
  ERROR_STATE: {
    icon: 'alert-circle-outline' as const,
    title: 'Something went wrong',
    description: 'Unable to load exposures. Please try again.',
    actionLabel: 'Retry',
  },
};

/**
 * Example Usage:
 *
 * ```tsx
 * import { EmptyState, EMPTY_STATE_PRESETS } from '@/components/common/EmptyState';
 * import { useRouter } from 'expo-router';
 *
 * function ExposureListScreen() {
 *   const exposures = useQuery(api.exposures.list);
 *   const router = useRouter();
 *
 *   if (exposures?.length === 0) {
 *     return (
 *       <EmptyState
 *         {...EMPTY_STATE_PRESETS.NO_EXPOSURES}
 *         onAction={() => router.push('/new')}
 *       />
 *     );
 *   }
 *
 *   return <FlatList data={exposures} ... />;
 * }
 * ```
 *
 * Dynamic Empty State:
 * ```tsx
 * function SearchResults({ query, results }) {
 *   if (query && results.length === 0) {
 *     return (
 *       <EmptyState
 *         {...EMPTY_STATE_PRESETS.NO_SEARCH_RESULTS(query)}
 *         onAction={() => setQuery('')}
 *       />
 *     );
 *   }
 *
 *   return <FlatList data={results} ... />;
 * }
 * ```
 */
