/**
 * T115: User Profile Screen
 * Settings and preferences for the user
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { colors, spacing } from '@constants/theme';
import { APP_CONFIG } from '@constants/config';
import { performanceMonitor } from '@utils/performance';
import {
  generatePerformanceReport,
  exportPerformanceReport,
  printPerformanceReport,
  getPerformanceMetricsSummary,
} from '@utils/performanceReport';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const { userId } = useAuth();

  // Fetch user preferences
  const userData = useQuery(api.users.get, userId ? {} : 'skip');
  const updatePreferences = useMutation(api.users.updatePreferences);

  // Local state for preferences
  const [enableVoiceEntry, setEnableVoiceEntry] = useState(
    userData?.preferences?.enableVoiceEntry ?? true
  );
  const [includeMapInPDF, setIncludeMapInPDF] = useState(
    userData?.preferences?.includeMapInPDF ?? false
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userData?.preferences?.notificationsEnabled ?? false
  );

  // T116: Performance metrics state
  const [perfMetrics, setPerfMetrics] = useState(getPerformanceMetricsSummary());

  /**
   * Update preference in backend
   */
  async function handlePreferenceChange(
    preference: 'enableVoiceEntry' | 'includeMapInPDF' | 'notificationsEnabled',
    value: boolean
  ) {
    try {
      await updatePreferences({
        [preference]: value,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
    }
  }

  /**
   * Handle sign out
   */
  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in' as any);
        },
      },
    ]);
  }

  /**
   * T116: Handle performance report generation
   */
  async function handleGeneratePerformanceReport() {
    try {
      const report = await generatePerformanceReport(APP_CONFIG.APP_VERSION);
      printPerformanceReport(report);
      Alert.alert(
        'Performance Report',
        `Score: ${report.summary.performanceScore}/100\n\n` +
          `Screen Loads: ${report.metrics.screenLoads.length}\n` +
          `Slow Renders: ${report.metrics.slowRenders.length}\n` +
          `Memory Warnings: ${report.metrics.memoryWarnings}\n\n` +
          'Report printed to console. Export to file?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: () => exportPerformanceReport(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate performance report');
      console.error(error);
    }
  }

  /**
   * T116: Update performance metrics periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setPerfMetrics(getPerformanceMetricsSummary());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || '?'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses[0]?.emailAddress || 'User'}
          </Text>
          <Text style={styles.email}>{user?.emailAddresses[0]?.emailAddress}</Text>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Occupation</Text>
              <Text style={styles.infoValue}>{userData?.occupation || 'Not set'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Employer</Text>
              <Text style={styles.infoValue}>{userData?.employer || 'Not set'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userData?.phoneNumber || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Voice Entry</Text>
                <Text style={styles.settingDescription}>
                  Enable voice-to-text for quick exposure documentation
                </Text>
              </View>
              <Switch
                value={enableVoiceEntry}
                onValueChange={value => {
                  setEnableVoiceEntry(value);
                  handlePreferenceChange('enableVoiceEntry', value);
                }}
                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                thumbColor={enableVoiceEntry ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Include Map in PDF</Text>
                <Text style={styles.settingDescription}>
                  Add exposure location map to PDF exports
                </Text>
              </View>
              <Switch
                value={includeMapInPDF}
                onValueChange={value => {
                  setIncludeMapInPDF(value);
                  handlePreferenceChange('includeMapInPDF', value);
                }}
                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                thumbColor={includeMapInPDF ? colors.primary : colors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders and safety alerts
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={value => {
                  setNotificationsEnabled(value);
                  handlePreferenceChange('notificationsEnabled', value);
                }}
                trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Performance (T116 - Development Only) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance (Dev Only)</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Screen Loads</Text>
                <Text style={styles.infoValue}>{perfMetrics.totalScreenLoads}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Avg Load Time</Text>
                <Text style={styles.infoValue}>
                  {perfMetrics.avgScreenLoadTime.toFixed(0)}ms
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Slow Components</Text>
                <Text
                  style={[
                    styles.infoValue,
                    perfMetrics.slowComponents > 0 && { color: colors.error },
                  ]}
                >
                  {perfMetrics.slowComponents}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Memory Warnings</Text>
                <Text
                  style={[
                    styles.infoValue,
                    perfMetrics.memoryWarnings > 0 && { color: colors.error },
                  ]}
                >
                  {perfMetrics.memoryWarnings}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.performanceButton}
              onPress={handleGeneratePerformanceReport}
            >
              <Text style={styles.performanceButtonText}>Generate Performance Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.APP_VERSION}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bundle ID</Text>
              <Text style={styles.infoValue}>{APP_CONFIG.APP_BUNDLE_ID}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Waldo Health</Text>
          <Text style={styles.footerSubtext}>
            Workplace exposure tracking for New Zealand construction workers
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dangerButton: {
    backgroundColor: colors.errorContainer,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  performanceButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  performanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
