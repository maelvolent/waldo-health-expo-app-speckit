/**
 * ExposureTypeSelector Component
 * T049: Select from 12 exposure types with icons
 *
 * Features:
 * - Grid layout of exposure types
 * - Visual icons for each type
 * - Selected state indication
 * - Accessible labels
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { EXPOSURE_TYPES, ExposureTypeDefinition } from '@constants/exposureTypes';
import { colors, spacing, touchTarget } from '@constants/theme';

interface ExposureTypeSelectorProps {
  selectedType: string | null;
  onSelect: (typeId: string) => void;
}

export function ExposureTypeSelector({ selectedType, onSelect }: ExposureTypeSelectorProps) {
  const exposureTypes = Object.values(EXPOSURE_TYPES);

  // Group by category
  const groupedTypes = exposureTypes.reduce(
    (acc, type) => {
      if (!acc[type.category]) {
        acc[type.category] = [];
      }
      acc[type.category].push(type);
      return acc;
    },
    {} as Record<string, ExposureTypeDefinition[]>
  );

  const categories = {
    respiratory: 'Respiratory Hazards',
    skin: 'Skin Hazards',
    noise: 'Noise Hazards',
    environmental: 'Environmental Hazards',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
        const types = groupedTypes[categoryKey as keyof typeof groupedTypes];
        if (!types || types.length === 0) return null;

        return (
          <View key={categoryKey} style={styles.categorySection}>
            <Text variant="titleSmall" style={styles.categoryTitle}>
              {categoryLabel}
            </Text>
            <View style={styles.grid}>
              {types.map(type => {
                const isSelected = selectedType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    style={({ pressed }) => [
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                      pressed && styles.typeCardPressed,
                    ]}
                    onPress={() => onSelect(type.id)}
                    accessible={true}
                    accessibilityLabel={type.label}
                    accessibilityHint={type.description}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: getCategoryColor(type.category) },
                      ]}
                    >
                      <Text style={styles.icon}>{getIcon(type.iconName)}</Text>
                    </View>
                    <Text
                      style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}
                      numberOfLines={2}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

/**
 * Get category color
 */
function getCategoryColor(category: string): string {
  const colorMap = colors.exposureCategory as Record<string, string>;
  return colorMap[category] || colors.primary;
}

/**
 * Get icon emoji for exposure type
 * In production, replace with actual icon images
 */
function getIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    'silica-dust': '💨',
    'asbestos-a': '🏗️',
    'asbestos-b': '⚠️',
    chemicals: '🧪',
    noise: '🔊',
    meth: '☣️',
    mould: '🍄',
    'contaminated-soil': '🌍',
    'heat-stress': '🌡️',
    'welding-fumes': '⚡',
    biological: '🦠',
    radiation: '☢️',
  };
  return iconMap[iconName] || '📋';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  typeCard: {
    width: '47%',
    minHeight: touchTarget.minHeight * 2,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20', // 20% opacity
  },
  typeCardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.text,
  },
  typeLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
