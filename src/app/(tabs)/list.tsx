/**
 * Exposures List Screen
 * T020, T021, T022, T025, T026: Integrated search, filter, and navigation
 *
 * Features:
 * - Search with debouncing (T020)
 * - Filter by type and severity (T021)
 * - Result count display (T022)
 * - Tappable cards with navigation (T025)
 * - Pull-to-refresh (T026)
 */

import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExposures } from '@hooks/useExposures';
import { useOfflineSync } from '@hooks/useOfflineSync';
import { useSearch } from '@hooks/useSearch';
import { useFilter } from '@hooks/useFilter';
import { SearchBar } from '@components/exposure/SearchBar';
import { FilterBar } from '@components/exposure/FilterBar';
import { ExposureCard } from '@components/exposure/ExposureCard';
import { SkeletonList } from '@components/common/SkeletonList';
import { EmptyState } from '@components/common/EmptyState';
import { colors, spacing, typography } from '@constants/theme';

export default function ExposuresListScreen() {
  const router = useRouter();
  const { exposures, isLoading, refresh } = useExposures();
  const { isOnline, exposureQueueCount, photoQueueCount } = useOfflineSync();
  const pendingCount = exposureQueueCount + photoQueueCount;

  // T020: Search integration
  const { query, setQuery, results: searchResults, isTyping } = useSearch(exposures || []);

  // T021: Filter integration
  const { filters, setFilters, filtered } = useFilter(searchResults);

  /**
   * T025: Handle card press - navigate to detail view
   */
  const handleCardPress = (exposureId: string) => {
    router.push(`/exposure/${exposureId}`);
  };

  const hasActiveFilters =
    (filters.exposureType && filters.exposureType.length > 0) ||
    (filters.severity && filters.severity.length > 0);

  const hasSearchQuery = query.length > 0;

  /**
   * T032: Show skeleton loading when data is undefined (initial load)
   */
  if (exposures === undefined && isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Exposures</Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={isOnline ? 'cloud-done' : 'cloud-offline'}
              size={16}
              color={isOnline ? colors.success : colors.offline}
              accessibilityLabel={isOnline ? 'Online' : 'Offline'}
            />
            <Text style={styles.status}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Skeleton Loading State */}
        <SkeletonList count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with online status */}
      <View style={styles.header}>
        <Text style={styles.title}>Exposures</Text>
        <View style={styles.statusContainer}>
          <Ionicons
            name={isOnline ? 'cloud-done' : 'cloud-offline'}
            size={16}
            color={isOnline ? colors.success : colors.offline}
            accessibilityLabel={isOnline ? 'Online' : 'Offline'}
          />
          <Text style={styles.status}>
            {isOnline ? 'Online' : 'Offline'}
            {pendingCount > 0 && ` (${pendingCount} pending)`}
          </Text>
        </View>
      </View>

      {/* T020: SearchBar */}
      <View style={styles.searchContainer}>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          isLoading={isTyping}
          resultCount={searchResults.length}
          placeholder="Search by activity, notes, or location..."
        />
      </View>

      {/* T021, T022: FilterBar with result count */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={exposures?.length || 0}
        filteredCount={filtered.length}
        isLoading={isLoading}
      />

      {/* T026: List with pull-to-refresh */}
      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          // T025: Use ExposureCard component with tap navigation
          <ExposureCard
            exposure={item}
            onPress={() => handleCardPress(item._id)}
          />
        )}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => {
          // T035: Empty state for no filter results with clear filters CTA
          if (hasActiveFilters || hasSearchQuery) {
            return (
              <EmptyState
                icon="search"
                title="No exposures found"
                description={
                  hasSearchQuery && hasActiveFilters
                    ? 'No exposures match your search and filters. Try adjusting your criteria.'
                    : hasSearchQuery
                      ? 'No exposures match your search. Try different keywords.'
                      : 'No exposures match the selected filters.'
                }
                ctaLabel="Clear Filters"
                onCtaPress={() => {
                  setQuery('');
                  setFilters({
                    exposureType: undefined,
                    severity: undefined,
                  });
                }}
              />
            );
          }

          // T033: Empty state to list screen when data length is zero
          return (
            <EmptyState
              icon="document-text-outline"
              title="No exposures yet"
              description='Tap "Document Exposure" on the home screen to create your first exposure record'
              ctaLabel="Go to Home"
              onCtaPress={() => router.push('/')}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listContent: {
    padding: spacing.md,
  },
});
