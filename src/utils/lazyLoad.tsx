/**
 * T118: Lazy Loading Utility for Code Splitting
 *
 * React Native doesn't support React.lazy natively, but we can implement
 * a similar pattern for on-demand component loading to reduce initial bundle size.
 *
 * This utility provides:
 * - Lazy component loading
 * - Loading states
 * - Error boundaries
 * - Preloading capability
 */

import React, { ComponentType, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@constants/theme';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  preload?: boolean;
}

/**
 * Create a lazy-loaded component wrapper
 *
 * Note: In React Native, dynamic imports are bundled at build time,
 * but this pattern helps organize code and can reduce initial parse time
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {}
): ComponentType<P> {
  const {
    fallback = <DefaultLoadingFallback />,
    errorFallback = <DefaultErrorFallback />,
    preload = false,
  } = options;

  let cachedComponent: ComponentType<P> | null = null;
  let importPromise: Promise<{ default: ComponentType<P> }> | null = null;

  // Preload if requested
  if (preload && !importPromise) {
    importPromise = importFn();
    importPromise.then(module => {
      cachedComponent = module.default;
    });
  }

  return function LazyComponent(props: P) {
    const [Component, setComponent] = useState<ComponentType<P> | null>(cachedComponent);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(!cachedComponent);

    useEffect(() => {
      if (cachedComponent) {
        return;
      }

      let cancelled = false;

      const loadComponent = async () => {
        try {
          if (!importPromise) {
            importPromise = importFn();
          }

          const module = await importPromise;

          if (!cancelled) {
            cachedComponent = module.default;
            setComponent(module.default);
            setLoading(false);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err as Error);
            setLoading(false);
            console.error('Error loading lazy component:', err);
          }
        }
      };

      loadComponent();

      return () => {
        cancelled = true;
      };
    }, []);

    if (error) {
      return <>{errorFallback}</>;
    }

    if (loading || !Component) {
      return <>{fallback}</>;
    }

    return <Component {...props} />;
  };
}

/**
 * Preload a lazy component
 */
export function preloadComponent(importFn: () => Promise<any>): Promise<any> {
  return importFn();
}

/**
 * Default loading fallback
 */
function DefaultLoadingFallback() {
  return (
    <View style={styles.fallbackContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

/**
 * Default error fallback
 */
function DefaultErrorFallback() {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.errorText}>⚠️</Text>
      <Text style={styles.errorMessage}>Failed to load component</Text>
    </View>
  );
}

/**
 * Custom loading fallback for maps
 */
export function MapLoadingFallback() {
  return (
    <View style={styles.mapFallback}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading map...</Text>
    </View>
  );
}

/**
 * Custom loading fallback for camera
 */
export function CameraLoadingFallback() {
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.loadingIcon}>📷</Text>
      <Text style={styles.loadingText}>Loading camera...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});
