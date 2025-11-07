import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@constants/theme';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { SkeletonText } from '@components/common/SkeletonText';

export default function Index() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const exposures = useQuery(api.exposures.list, isSignedIn ? { limit: 5 } : 'skip');

  const recentCount = exposures?.exposures?.length || 0;

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.header}>
            <Ionicons
              name="shield-checkmark"
              size={80}
              color={colors.primary}
              style={styles.logoIcon}
              accessibilityLabel="Waldo Health logo"
            />
            <Text style={styles.title}>Waldo Health</Text>
            <Text style={styles.subtitle}>Workplace Exposure Documentation</Text>
          </View>

          <View style={styles.authContent}>
            <Text style={styles.authMessage}>
              Document workplace exposures, track safety data, and export professional reports for
              ACC claims.
            </Text>

            <Link href="/sign-in" asChild>
              <TouchableOpacity style={styles.signInButton}>
                <Text style={styles.signInButtonText}>Sign In to Continue</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {user?.firstName || 'User'}!</Text>
          <Text style={styles.tagline}>What would you like to do today?</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {/* New Exposure Card */}
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryCard]}
            onPress={() => router.push('/new')}
            accessibilityLabel="Document new exposure"
            accessibilityHint="Navigate to exposure documentation form"
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name="camera"
                size={48}
                color={colors.primary}
                accessibilityLabel="Camera icon"
              />
            </View>
            <Text style={styles.cardTitle}>Document Exposure</Text>
            <Text style={styles.cardDescription}>Quick 60-second capture</Text>
          </TouchableOpacity>

          {/* View History Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/list')}
            accessibilityLabel="View exposure history"
            accessibilityHint={`View ${recentCount} recent exposures`}
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name="list"
                size={48}
                color={colors.icon.primary}
                accessibilityLabel="List icon"
              />
            </View>
            <Text style={styles.cardTitle}>View History</Text>
            {/* T036: Skeleton loading for statistics */}
            {exposures === undefined ? (
              <View style={{ width: '100%', paddingHorizontal: spacing.md }}>
                <SkeletonText width="80%" size="small" />
              </View>
            ) : (
              <Text style={styles.cardDescription}>{recentCount} recent exposures</Text>
            )}
          </TouchableOpacity>

          {/* Export Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/export')}
            accessibilityLabel="Export reports"
            accessibilityHint="Export data in PDF and CSV formats"
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name="download"
                size={48}
                color={colors.icon.primary}
                accessibilityLabel="Download icon"
              />
            </View>
            <Text style={styles.cardTitle}>Export Reports</Text>
            <Text style={styles.cardDescription}>PDF & CSV formats</Text>
          </TouchableOpacity>

          {/* Settings/Profile Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => signOut()}
            accessibilityLabel="Sign out"
            accessibilityHint="Sign out of your account"
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name="log-out"
                size={48}
                color={colors.icon.primary}
                accessibilityLabel="Sign out icon"
              />
            </View>
            <Text style={styles.cardTitle}>Sign Out</Text>
            <Text style={styles.cardDescription}>Secure your account</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoTitleContainer}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
              style={styles.infoIcon}
              accessibilityLabel="Information icon"
            />
            <Text style={styles.infoTitle}>About Waldo Health</Text>
          </View>
          <Text style={styles.infoText}>
            Professional workplace exposure documentation designed for New Zealand construction
            workers. Complies with ACC, Health & Safety, and Privacy Act requirements.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  // Auth Screen Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logoIcon: {
    marginBottom: spacing.md,
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
  authContent: {
    width: '100%',
    maxWidth: 400,
  },
  authMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  signInButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Main Screen Styles
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    backgroundColor: '#e3f2fd',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardIcon: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Info Section
  infoSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    marginRight: spacing.xs,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
