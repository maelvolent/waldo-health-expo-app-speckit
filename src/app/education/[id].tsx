/**
 * T091: Educational Content Detail Screen
 * Displays full article content with metadata
 *
 * Features:
 * - Full article content (markdown-style formatting)
 * - Source attribution
 * - External link to source URL
 * - Tags display
 * - View count tracking
 * - Related content suggestions
 * - Share article option
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Appbar, Chip, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { Id } from '../../../convex/_generated/dataModel';

export default function EducationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const content = useQuery(api.educationalContent.get, { id: id as Id<'educationalContent'> });
  const incrementViewCount = useMutation(api.educationalContent.incrementViewCount);

  // Increment view count when article is viewed
  useEffect(() => {
    if (content && id) {
      incrementViewCount({ id: id as Id<'educationalContent'> }).catch(error => {
        console.error('Failed to increment view count:', error);
      });
    }
  }, [content, id]);

  /**
   * Open external source URL
   */
  async function handleOpenSource() {
    if (!content?.sourceUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(content.sourceUrl);
      if (canOpen) {
        await Linking.openURL(content.sourceUrl);
      } else {
        Alert.alert('Error', 'Unable to open link');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  }

  /**
   * Share article
   */
  function handleShare() {
    // TODO: Implement share functionality (Share API or generate PDF)
    Alert.alert('Share', 'Share functionality coming soon');
  }

  // Loading state
  if (content === undefined) {
    return <LoadingSpinner fullScreen message="Loading article..." />;
  }

  // Not found
  if (content === null) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Article" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorText}>
            Article not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const exposureType = EXPOSURE_TYPES[content.exposureType.toUpperCase()];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Education" />
        <Appbar.Action icon="share" onPress={handleShare} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Card */}
        <Card>
          <View style={styles.header}>
            {/* Exposure Type Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{exposureType?.icon || '📚'}</Text>
            </View>

            {/* Title */}
            <Text variant="headlineMedium" style={styles.title}>
              {content.title}
            </Text>

            {/* Metadata */}
            <View style={styles.metadata}>
              <Text variant="bodySmall" style={styles.metadataText}>
                {content.source}
              </Text>
              <Text variant="bodySmall" style={styles.metadataText}>
                •
              </Text>
              <Text variant="bodySmall" style={styles.metadataText}>
                👁 {content.viewCount.toLocaleString()} views
              </Text>
            </View>

            {/* Tags */}
            {content.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {content.tags.map((tag, index) => (
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
              </View>
            )}
          </View>
        </Card>

        {/* Article Content */}
        <Card>
          <Text variant="bodyLarge" style={styles.content}>
            {content.content}
          </Text>
        </Card>

        {/* Source Link */}
        {content.sourceUrl && (
          <Card>
            <View style={styles.sourceCard}>
              <Text variant="titleMedium" style={styles.sourceTitle}>
                Official Source
              </Text>
              <Text variant="bodyMedium" style={styles.sourceName}>
                {content.source}
              </Text>
              <Button
                title="View on WorkSafe NZ"
                onPress={handleOpenSource}
                variant="outline"
                icon="open-in-new"
                style={styles.sourceButton}
              />
            </View>
          </Card>
        )}

        {/* Disclaimer */}
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimer}>
            <Text variant="bodySmall" style={styles.disclaimerText}>
              ⚠️ This information is for educational purposes only. Always follow your
              employer's health and safety procedures and consult with qualified safety
              professionals. For specific guidance, refer to WorkSafe New Zealand and relevant
              health and safety regulations.
            </Text>
          </View>
        </Card>

        {/* Related Articles Placeholder */}
        <Card>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Related Topics
          </Text>
          <Text variant="bodyMedium" style={styles.relatedHint}>
            More articles about {exposureType?.label || 'workplace safety'} coming soon.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metadataText: {
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.sm,
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
  contentText: {
    color: colors.text,
    lineHeight: 24,
  },
  sourceCard: {
    gap: spacing.sm,
  },
  sourceTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  sourceName: {
    color: colors.textSecondary,
  },
  sourceButton: {
    marginTop: spacing.sm,
  },
  disclaimerCard: {
    backgroundColor: colors.warningContainer,
  },
  disclaimer: {
    padding: spacing.sm,
  },
  disclaimerText: {
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  relatedHint: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
