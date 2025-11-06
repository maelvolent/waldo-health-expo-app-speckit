/**
 * Exposures List Screen
 * Displays all exposure records
 */

import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useExposures } from '@hooks/useExposures';
import { useOfflineSync } from '@hooks/useOfflineSync';
import { colors, spacing } from '@constants/theme';

export default function ExposuresListScreen() {
  const router = useRouter();
  const { exposures, isLoading, refresh } = useExposures();
  const { isOnline, exposureQueueCount, photoQueueCount } = useOfflineSync();
  const pendingCount = exposureQueueCount + photoQueueCount;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exposures</Text>
        <Text style={styles.status}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
          {pendingCount > 0 && ` (${pendingCount} pending)`}
        </Text>
      </View>

      <FlatList
        data={exposures || []}
        renderItem={({ item }) => {
          const exposureTypeMap: Record<string, { name: string; emoji: string }> = {
            silica_dust: { name: 'Silica Dust', emoji: '💨' },
            asbestos_a: { name: 'Asbestos (Class A)', emoji: '⚠️' },
            asbestos_b: { name: 'Asbestos (Class B)', emoji: '⚠️' },
            hazardous_chemicals: { name: 'Hazardous Chemicals', emoji: '🧪' },
            noise: { name: 'Noise', emoji: '🔊' },
            meth_contamination: { name: 'Meth Contamination', emoji: '☣️' },
            mould: { name: 'Mould', emoji: '🍄' },
            contaminated_soils: { name: 'Contaminated Soils', emoji: '🏗️' },
            heat_stress: { name: 'Heat Stress', emoji: '🌡️' },
            welding_fumes: { name: 'Welding Fumes', emoji: '⚡' },
            biological_hazards: { name: 'Biological Hazards', emoji: '🦠' },
            radiation: { name: 'Radiation', emoji: '☢️' },
          };

          const typeInfo = exposureTypeMap[item.exposureType] || {
            name: item.exposureType,
            emoji: '📋',
          };
          const severityColors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#dc3545',
          };

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{typeInfo.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{typeInfo.name}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: severityColors[item.severity] },
                    ]}
                  >
                    <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cardDate}>
                  📅{' '}
                  {new Date(item.timestamp).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.cardLocation}>
                  📍 {item.location.siteName || item.location.address || 'Location captured'}
                </Text>
                <Text style={styles.cardDuration}>
                  ⏱️ {item.duration.hours}h {item.duration.minutes}m
                </Text>
                {item.photoIds && item.photoIds.length > 0 && (
                  <Text style={styles.cardPhotos}>
                    📸 {item.photoIds.length} photo{item.photoIds.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No exposures yet</Text>
            <Text style={styles.emptyHint}>
              Tap "Document Exposure" on the home screen to create your first record
            </Text>
          </View>
        }
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  status: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDetails: {
    gap: spacing.xs,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardPhotos: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
