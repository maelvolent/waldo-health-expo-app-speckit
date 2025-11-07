/**
 * T109: Map Screen
 * Interactive map showing all exposure locations with filtering
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { MapView } from '@components/exposure/MapView';
import { EXPOSURE_TYPES } from '@constants/exposureTypes';
import { colors, spacing } from '@constants/theme';
import { useAuth } from '@clerk/clerk-expo';

export default function MapScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all exposures for the user (userId comes from auth context in Convex)
  const exposuresData = useQuery(api.exposures.list, userId ? {} : 'skip');
  const exposures = exposuresData?.exposures || [];

  // Filter exposures by selected types
  const filteredExposures =
    exposures?.filter(exposure => {
      if (selectedTypes.size === 0) return true; // Show all if no filters
      return selectedTypes.has(exposure.exposureType);
    }) || [];

  // Convert to marker format
  const markers = filteredExposures.map(exposure => ({
    id: exposure._id,
    latitude: exposure.location.latitude,
    longitude: exposure.location.longitude,
    exposureType: exposure.exposureType,
    siteName: exposure.location.siteName,
    timestamp: exposure.timestamp,
  }));

  /**
   * Toggle exposure type filter
   */
  function toggleFilter(exposureType: string) {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(exposureType)) {
      newSelected.delete(exposureType);
    } else {
      newSelected.add(exposureType);
    }
    setSelectedTypes(newSelected);
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    setSelectedTypes(new Set());
  }

  /**
   * Handle marker press - navigate to exposure detail
   */
  function handleMarkerPress(exposureId: string) {
    router.push(`/exposures/${exposureId}` as any);
  }

  // Get unique exposure types from data
  const availableTypes = Array.from(
    new Set(exposures?.map(e => e.exposureType) || [])
  ).sort();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Exposure Map</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>
              {selectedTypes.size > 0 ? `Filters (${selectedTypes.size})` : 'Filter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter by Exposure Type</Text>
            {selectedTypes.size > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilters}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {availableTypes.map(type => {
              const typeInfo = EXPOSURE_TYPES[type.toUpperCase()];
              const isSelected = selectedTypes.has(type);

              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                  onPress={() => toggleFilter(type)}
                >
                  <Text style={styles.filterChipIcon}>{typeInfo?.icon || '📍'}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                  >
                    {typeInfo?.label || type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Showing {markers.length} of {exposures?.length || 0} exposures
        </Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {markers.length > 0 ? (
          <MapView
            exposures={markers}
            onMarkerPress={handleMarkerPress}
            showUserLocation={true}
            followUserLocation={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>No Exposures to Display</Text>
            <Text style={styles.emptyText}>
              {selectedTypes.size > 0
                ? 'Try adjusting your filters or clear them to see all exposures'
                : 'Record your first exposure to see it on the map'}
            </Text>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(EXPOSURE_TYPES).map(([key, value]) => (
            <View key={key} style={styles.legendItem}>
              <Text style={styles.legendIcon}>{value.icon}</Text>
              <Text style={styles.legendText}>{value.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
  },
  filterButtonText: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
    fontSize: 14,
  },
  filterPanel: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  clearFilters: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  filterChipIcon: {
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  statsBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceVariant,
  },
  statsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  legend: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.md,
  },
  legendIcon: {
    fontSize: 16,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
