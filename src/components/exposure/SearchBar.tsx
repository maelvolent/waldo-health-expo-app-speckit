/**
 * SearchBar Component
 * T017: Search input with debouncing and clear button
 *
 * Features:
 * - Search input with icon
 * - Clear button when query exists
 * - Loading indicator
 * - Accessibility announcements
 * - Auto-focus support
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ViewStyle, AccessibilityInfo } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, touchTarget } from '@constants/theme';

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

export function SearchBar({
  query,
  onQueryChange,
  placeholder = 'Search exposures...',
  isLoading = false,
  resultCount,
  autoFocus = false,
  style,
  onClear,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const hasQuery = query.length > 0;

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Announce results to screen readers when they change
  useEffect(() => {
    if (resultCount !== undefined && hasQuery) {
      const message =
        resultCount === 0
          ? 'No results found'
          : resultCount === 1
            ? '1 result found'
            : `${resultCount} results found`;
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [resultCount, hasQuery]);

  /**
   * Handle clear button press
   */
  const handleClear = () => {
    onQueryChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Search Icon */}
      <Ionicons
        name="search"
        size={20}
        color={colors.icon.secondary}
        style={styles.searchIcon}
        accessibilityLabel="Search"
      />

      {/* Text Input */}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={query}
        onChangeText={onQueryChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never" // We'll use custom clear button
        onFocus={onFocus}
        onBlur={onBlur}
        accessibilityLabel="Search input"
        accessibilityHint="Search exposures by activity, notes, or location"
        accessibilityValue={{ text: query }}
      />

      {/* Loading Indicator or Clear Button */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.rightIcon}
          accessibilityLabel="Loading search results"
        />
      ) : hasQuery ? (
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.clearButtonPressed,
          ]}
          hitSlop={touchTarget.hitSlop}
          accessibilityLabel="Clear search"
          accessibilityHint="Clear the search query"
          accessibilityRole="button"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={colors.icon.secondary}
            accessibilityLabel="Clear icon"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: touchTarget.minHeight,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
});
