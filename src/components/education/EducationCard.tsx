/**
 * T089: EducationCard Component
 * Card for educational content list items
 *
 * Displays:
 * - Exposure type icon
 * - Article title
 * - Source and tags
 * - View count
 * - Thumbnail (if available)
 *
 * WCAG 2.1 AA Compliant:
 * - Touch target size (min 44x44)
 * - Clear visual hierarchy
 * - Accessible labels for screen readers
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Card } from '@components/common/Card';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { Id } from '../../../convex/_generated/dataModel';

interface EducationCardProps {
  content: {
    _id: Id<'educationalContent'>;
    title: string;
    exposureType: string;
    source: string;
    tags: string[];
    viewCount: number;
    thumbnailUrl?: string | null;
  };
  onPress: () => void;
}

export function EducationCard({ content, onPress }: EducationCardProps) {
  const exposureType = EXPOSURE_TYPES[content.exposureType.toUpperCase()];

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${content.title}, ${content.viewCount} views`}
      accessibilityHint="Tap to read article"
    >
      <View style={styles.container}>
        {/* Header: Icon and Title */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{exposureType?.icon || '📚'}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
              {content.title}
            </Text>
          </View>
        </View>

        {/* Source and Stats */}
        <View style={styles.metadata}>
          <Text variant="bodySmall" style={styles.source} numberOfLines={1}>
            {content.source}
          </Text>
          <View style={styles.viewCount}>
            <Text variant="bodySmall" style={styles.viewCountText}>
              👁 {content.viewCount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {content.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {content.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                mode="outlined"
                compact
                style={styles.tag}
                textStyle={styles.tagText}
              >
                {tag}
              </Chip>
            ))}
            {content.tags.length > 3 && (
              <Text variant="bodySmall" style={styles.moreTagsText}>
                +{content.tags.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    flex: 1,
    color: colors.textSecondary,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCountText: {
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  tag: {
    height: 24,
    borderColor: colors.outline,
  },
  tagText: {
    fontSize: 11,
    marginVertical: 0,
    marginHorizontal: 6,
  },
  moreTagsText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
