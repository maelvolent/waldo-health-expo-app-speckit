/**
 * Component Contract: Skeleton Loading Components
 *
 * Purpose: Skeleton placeholders for loading states
 * Location: src/components/common/SkeletonCard.tsx, SkeletonList.tsx
 */

export interface SkeletonCardProps {
  /**
   * Width of the skeleton card
   * @default '100%'
   */
  width?: number | string;

  /**
   * Height of the skeleton card
   * @default 120
   */
  height?: number;

  /**
   * Should animate the shimmer effect
   * @default true
   */
  animated?: boolean;

  /**
   * Animation duration in milliseconds
   * @default 1500
   */
  animationDuration?: number;

  /**
   * Border radius
   * @default 12
   */
  borderRadius?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

export interface SkeletonListProps {
  /**
   * Number of skeleton items to render
   * @default 5
   */
  count?: number;

  /**
   * Height of each skeleton item
   * @default 120
   */
  itemHeight?: number;

  /**
   * Spacing between items
   * @default 12
   */
  spacing?: number;

  /**
   * Should animate the shimmer effect
   * @default true
   */
  animated?: boolean;

  /**
   * Custom style for container
   */
  style?: ViewStyle;

  /**
   * Custom style for each item
   */
  itemStyle?: ViewStyle;
}

export interface SkeletonTextProps {
  /**
   * Width of the text skeleton
   * Can be number (pixels) or string (percentage)
   * @default '100%'
   */
  width?: number | string;

  /**
   * Height of the text skeleton
   * @default 16
   */
  height?: number;

  /**
   * Border radius
   * @default 4
   */
  borderRadius?: number;

  /**
   * Should animate
   * @default true
   */
  animated?: boolean;

  /**
   * Custom style
   */
  style?: ViewStyle;
}

/**
 * Example Usage:
 *
 * ```tsx
 * import { SkeletonList, SkeletonCard } from '@/components/common';
 *
 * function ExposureListScreen() {
 *   const exposures = useQuery(api.exposures.list);
 *
 *   if (!exposures) {
 *     return <SkeletonList count={5} />;
 *   }
 *
 *   return <FlatList data={exposures} ... />;
 * }
 * ```
 *
 * Custom Skeleton Pattern:
 * ```tsx
 * function CustomSkeleton() {
 *   return (
 *     <View style={styles.card}>
 *       <SkeletonText width={60} height={60} borderRadius={30} />
 *       <View style={styles.content}>
 *         <SkeletonText width="80%" height={20} />
 *         <SkeletonText width="60%" height={16} />
 *       </View>
 *     </View>
 *   );
 * }
 * ```
 */
