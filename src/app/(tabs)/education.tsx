/**
 * T090: Educational Content List Screen
 * Displays educational articles about workplace hazards
 *
 * Features:
 * - List of published educational content
 * - Filter by exposure type
 * - Filter by tags
 * - Search functionality
 * - Navigation to article details
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Searchbar, Chip, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { EducationCard } from '@components/education/EducationCard';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';

type FilterType = 'all' | 'silica_dust' | 'asbestos' | 'chemicals' | 'other';

export default function EducationListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Query educational content based on filters
  const queryArgs = filterType === 'all' ? {} : { exposureType: getExposureTypeForFilter(filterType) };
  const content = useQuery(api.educationalContent.list, queryArgs);

  // Filter content by search query and tags
  const filteredContent = React.useMemo(() => {
    if (!content) return [];

    let results = content;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      results = results.filter(item => item.tags.some(tag => selectedTags.includes(tag)));
    }

    return results;
  }, [content, searchQuery, selectedTags]);

  // Get all unique tags from content
  const allTags = React.useMemo(() => {
    if (!content) return [];
    const tagsSet = new Set<string>();
    content.forEach(item => item.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [content]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (content === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading educational content..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Safety Education
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Learn about workplace hazards and safe practices
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search articles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Filter by Exposure Type */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterType}
          onValueChange={value => setFilterType(value as FilterType)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'silica_dust', label: 'Dust' },
            { value: 'asbestos', label: 'Asbestos' },
            { value: 'chemicals', label: 'Chemicals' },
            { value: 'other', label: 'Other' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <View style={styles.tagsFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollContent}
          >
            {allTags.map(tag => (
              <Chip
                key={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)}
                mode={selectedTags.includes(tag) ? 'flat' : 'outlined'}
                style={styles.tagChip}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content List */}
      <FlatList
        data={filteredContent}
        renderItem={({ item }) => (
          <EducationCard
            content={item}
            onPress={() => router.push(`/education/${item._id}`)}
          />
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTags.length > 0
                ? 'No articles match your search'
                : 'No educational content available'}
            </Text>
            <Text style={styles.emptyHint}>
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your filters'
                : 'Check back later for safety information'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

/**
 * Map filter type to exposure type query value
 */
function getExposureTypeForFilter(filter: FilterType): string | undefined {
  switch (filter) {
    case 'silica_dust':
      return 'silica_dust';
    case 'asbestos':
      return 'asbestos_class_a'; // Will also match asbestos_class_b due to backend logic
    case 'chemicals':
      return 'hazardous_chemicals';
    case 'other':
      return 'general';
    default:
      return undefined;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchbar: {
    backgroundColor: colors.surfaceVariant,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
  },
  tagsFilterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  tagsScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tagChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    padding: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
