/**
 * Root Layout Component
 * Configures providers for authentication, backend, and UI theming
 *
 * Provider hierarchy:
 * 1. ClerkProvider - Authentication state
 * 2. ConvexProviderWithClerk - Backend with auth integration
 * 3. PaperProvider - UI components with WCAG AA theme
 * 4. NetworkMonitor - T058: Auto-sync on connectivity
 * 5. VoiceLanguageChecker - T082: Verify voice recognition language support
 * 6. PerformanceMonitor - T116: Track app performance metrics
 */

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Slot } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { NetworkMonitor } from '@components/common/NetworkMonitor';
import { VoiceLanguageChecker } from '@components/common/VoiceLanguageChecker';
import { performanceMonitor } from '@utils/performance';

// Initialize Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

// Secure token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('SecureStore getToken error:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore saveToken error:', err);
    }
  },
};

/**
 * User Initializer - Ensures user exists in Convex on auth
 */
function UserInitializer({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeUser() {
      if (!isSignedIn) {
        setIsInitialized(true);
        return;
      }

      try {
        await getOrCreateUser();
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize user:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize user');
          // Retry after 2 seconds
          setTimeout(() => {
            if (mounted) {
              setIsInitialized(false);
            }
          }, 2000);
        }
      }
    }

    if (isLoaded) {
      initializeUser();
    }

    return () => {
      mounted = false;
    };
  }, [isSignedIn, isLoaded, getOrCreateUser]);

  // Show loading state while initializing
  if (!isLoaded || (isSignedIn && !isInitialized)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        {error && (
          <Text style={{ marginTop: 16, color: 'red', textAlign: 'center' }}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  // T116: Track app start time
  useEffect(() => {
    performanceMonitor.startMeasure('app_start_time');
    // Mark app as interactive after first render
    return () => {
      performanceMonitor.endMeasure('app_start_time');
    };
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <SafeAreaProvider>
          <PaperProvider>
            <UserInitializer>
              <NetworkMonitor />
              <VoiceLanguageChecker />
              <Slot />
            </UserInitializer>
          </PaperProvider>
        </SafeAreaProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
