/**
 * Sign In Screen
 * Simple authentication with Clerk
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOAuth } from '@clerk/clerk-expo';
import { colors, spacing } from '@constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });

  async function handleGoogleSignIn() {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Waldo Health</Text>
        <Text style={styles.subtitle}>Document workplace exposures for ACC claims</Text>

        <View style={styles.authContainer}>
          <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Note: In Expo Go, OAuth may not work fully.{'\n'}
          For testing, you can skip auth by modifying the backend.
        </Text>
      </View>
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
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  authContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  note: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
