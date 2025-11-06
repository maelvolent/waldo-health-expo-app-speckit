/**
 * New Exposure Screen
 * Simple form for creating exposure records
 * T080-T081: Voice entry UI integrated
 * T100: AI scan workflow integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConvexAction, useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
import { useExposures } from '@hooks/useExposures';
import { useLocation } from '@hooks/useLocation';
import { useVoice } from '@hooks/useVoice';
import { PhotoCapture } from '@components/exposure/PhotoCapture';
import { HazardScanResult } from '@components/exposure/HazardScanResult';
import { colors, spacing } from '@constants/theme';
import { isAIDetectionEnabled } from '@constants/config';

const EXPOSURE_TYPES = [
  { value: 'silica_dust', label: 'Silica Dust' },
  { value: 'asbestos_a', label: 'Asbestos (Class A)' },
  { value: 'asbestos_b', label: 'Asbestos (Class B)' },
  { value: 'hazardous_chemicals', label: 'Hazardous Chemicals' },
  { value: 'noise', label: 'Noise' },
  { value: 'meth_contamination', label: 'Meth Contamination' },
  { value: 'mould', label: 'Mould' },
  { value: 'contaminated_soils', label: 'Contaminated Soils' },
  { value: 'heat_stress', label: 'Heat Stress' },
  { value: 'welding_fumes', label: 'Welding Fumes' },
  { value: 'biological_hazards', label: 'Biological Hazards' },
  { value: 'radiation', label: 'Radiation' },
];

export default function NewExposureScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { createExposure } = useExposures();
  const { location, isLoading: isLoadingLocation } = useLocation(true);
  const {
    isListening,
    transcript,
    parsedData,
    isAvailable: isVoiceAvailable,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoice();

  // T100: AI Scan Integration
  const analyzePhoto = useConvexAction(api.hazardScans.analyze);
  const updateAcceptance = useMutation(api.hazardScans.updateAcceptance);

  // T110-T111: Location suggestion and save site
  const createLocation = useMutation(api.locations.create);
  const nearbySites = useQuery(
    api.locations.suggestNearby,
    location && userId
      ? {
          userId: userId as any,
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMeters: 50,
        }
      : 'skip'
  );

  const [exposureType, setExposureType] = useState('');
  const [workActivity, setWorkActivity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // T100: Photo and AI scan state
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [aiScanLoading, setAiScanLoading] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<any>(null);
  const [aiScanError, setAiScanError] = useState<string | null>(null);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  // T110-T111: Location state
  const [siteName, setSiteName] = useState('');
  const [showSiteSuggestions, setShowSiteSuggestions] = useState(false);

  // Auto-fill form fields from parsed voice data
  useEffect(() => {
    if (parsedData.exposureType && !exposureType) {
      setExposureType(parsedData.exposureType);
    }
    if (parsedData.workActivity && !workActivity) {
      setWorkActivity(parsedData.workActivity);
    }
  }, [parsedData, exposureType, workActivity]);

  // Pulse animation for voice button
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  async function handleVoiceToggle() {
    if (!isVoiceAvailable) {
      Alert.alert('Voice Not Available', 'Voice recognition is not available on this device');
      return;
    }

    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }

  /**
   * T100: Handle AI scan request for a photo
   */
  async function handleAIScanRequest(photoUri: string, photoIndex: number) {
    try {
      setAiScanLoading(true);
      setAiScanError(null);

      // Note: In real implementation, we would need to:
      // 1. Upload photo to storage and get public URL
      // 2. Create photo record in database
      // 3. Pass photo ID and exposure ID to analyze action
      // For now, we'll show a placeholder implementation

      // TODO: Implement photo upload to Convex storage
      // const photoId = await uploadPhoto(photoUri);
      // const result = await analyzePhoto({
      //   photoId,
      //   exposureId: temporaryExposureId,
      //   photoUrl: publicPhotoUrl,
      // });

      // Placeholder: Show alert that feature requires backend integration
      Alert.alert(
        'AI Scan',
        'AI hazard detection will analyze this photo once the exposure is saved. This feature requires photo upload to be implemented first.',
        [{ text: 'OK' }]
      );

      setAiScanLoading(false);
    } catch (error: any) {
      console.error('AI scan error:', error);
      setAiScanError(error.message || 'Failed to analyze photo');
      setAiScanLoading(false);
      Alert.alert('AI Scan Error', 'Failed to analyze photo. Please try again.');
    }
  }

  /**
   * T100: Handle accepting AI suggestions
   */
  async function handleAcceptAISuggestion() {
    if (!aiScanResult || !currentScanId) return;

    try {
      await updateAcceptance({ scanId: currentScanId as any, accepted: true });

      // Pre-populate form with AI suggestions
      if (aiScanResult.suggestedExposureType && !exposureType) {
        setExposureType(aiScanResult.suggestedExposureType);
      }

      Alert.alert('Accepted', 'AI suggestions applied to the form');
    } catch (error) {
      console.error('Error accepting AI suggestion:', error);
    }
  }

  /**
   * T100: Handle rejecting AI suggestions
   */
  async function handleRejectAISuggestion() {
    if (!currentScanId) return;

    try {
      await updateAcceptance({ scanId: currentScanId as any, accepted: false });
      setAiScanResult(null);
      setCurrentScanId(null);

      Alert.alert('Rejected', 'AI suggestions dismissed');
    } catch (error) {
      console.error('Error rejecting AI suggestion:', error);
    }
  }

  /**
   * T111: Save current location as a reusable site
   */
  async function handleSaveThisSite() {
    if (!location || !userId) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!siteName.trim()) {
      Alert.alert('Required', 'Please enter a site name');
      return;
    }

    try {
      await createLocation({
        userId: userId as any,
        siteName: siteName.trim(),
        address: location.address || 'Address not available',
        latitude: location.latitude,
        longitude: location.longitude,
        notes: null,
      });

      Alert.alert('Success', `Site "${siteName}" saved for future use`);
    } catch (error) {
      console.error('Error saving site:', error);
      Alert.alert('Error', 'Failed to save site');
    }
  }

  /**
   * T110: Apply suggested site name from nearby location
   */
  function applySiteSuggestion(suggestedSiteName: string) {
    setSiteName(suggestedSiteName);
    setShowSiteSuggestions(false);
  }

  async function handleSave() {
    if (!exposureType || !workActivity) {
      Alert.alert('Required', 'Please fill in exposure type and work activity');
      return;
    }

    try {
      setIsSaving(true);

      // Use actual location if available, otherwise use placeholder coordinates
      const locationData = location
        ? {
            ...location,
            siteName: siteName.trim() || location.siteName || null, // T110: Include site name
          }
        : {
            latitude: -36.8485,
            longitude: 174.7633,
            accuracy: null,
            address: 'Location not available',
            siteName: siteName.trim() || null,
          };

      await createExposure({
        exposureType,
        timestamp: Date.now(),
        duration: parsedData.duration || { hours: 1, minutes: 0 },
        location: locationData,
        severity: parsedData.severity || 'low',
        ppe: parsedData.ppe || [],
        workActivity,
        notes: parsedData.notes || null,
        chemicalName: parsedData.chemicalName || null,
        sdsReference: null,
        controlMeasures: null,
        photoUris, // T100: Include captured photos
        voiceTranscription: transcript || null,
      });

      Alert.alert('Success', 'Exposure saved!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save exposure');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Exposure</Text>
        <Text style={styles.subtitle}>
          {isLoadingLocation
            ? 'Getting location...'
            : location
              ? '📍 Location captured'
              : '❌ No location'}
        </Text>
      </View>

      {/* Voice Entry Button */}
      {isVoiceAvailable && (
        <View style={styles.voiceContainer}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoiceToggle}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.voiceButtonIcon}>{isListening ? '🎤' : '🎙️'}</Text>
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.voiceTextContainer}>
            <Text style={styles.voiceLabel}>
              {isListening ? 'Listening...' : 'Tap to use voice entry'}
            </Text>
            {transcript && (
              <Text style={styles.voiceTranscript} numberOfLines={2}>
                {transcript}
              </Text>
            )}
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* T100: Photo Capture with AI Scan */}
        {isAIDetectionEnabled() && (
          <View style={styles.section}>
            <PhotoCapture
              onPhotosChange={setPhotoUris}
              onAIScanRequest={handleAIScanRequest}
              maxPhotos={5}
              aiScanEnabled={true}
            />
          </View>
        )}

        {/* T100: AI Scan Loading */}
        {aiScanLoading && (
          <View style={styles.aiLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.aiLoadingText}>Analyzing photo for hazards...</Text>
          </View>
        )}

        {/* T100: AI Scan Error */}
        {aiScanError && (
          <View style={styles.aiErrorContainer}>
            <Text style={styles.aiErrorText}>❌ {aiScanError}</Text>
          </View>
        )}

        {/* T100: AI Scan Results */}
        {aiScanResult && (
          <View style={styles.section}>
            <HazardScanResult
              detectedHazards={aiScanResult.detectedHazards}
              suggestedExposureType={aiScanResult.suggestedExposureType}
              suggestedPPE={aiScanResult.suggestedPPE}
              processingTime={aiScanResult.processingTime}
              onAccept={handleAcceptAISuggestion}
              onReject={handleRejectAISuggestion}
              showActions={true}
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Exposure Type *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTypePicker(true)}>
            <Text style={exposureType ? styles.inputText : styles.placeholderText}>
              {exposureType
                ? EXPOSURE_TYPES.find(t => t.value === exposureType)?.label
                : 'Select exposure type...'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Work Activity *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={workActivity}
            onChangeText={setWorkActivity}
            placeholder="Describe what you were doing..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* T110-T111: Site Name Field */}
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.label}>Site Name (Optional)</Text>
            {nearbySites && nearbySites.length > 0 && (
              <TouchableOpacity onPress={() => setShowSiteSuggestions(!showSiteSuggestions)}>
                <Text style={styles.suggestionLink}>
                  {nearbySites.length} nearby {nearbySites.length === 1 ? 'site' : 'sites'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={siteName}
            onChangeText={setSiteName}
            placeholder="e.g., Building Site A, Office Level 3..."
          />

          {/* T110: Site Suggestions */}
          {showSiteSuggestions && nearbySites && nearbySites.length > 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Nearby sites:</Text>
              {nearbySites.map((site, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => applySiteSuggestion(site.siteName)}
                >
                  <Text style={styles.suggestionName}>{site.siteName}</Text>
                  <Text style={styles.suggestionDistance}>
                    {Math.round(site.distance)}m away • Used {site.exposureCount} times
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* T111: Save This Site Button */}
          {location && siteName.trim() && (
            <TouchableOpacity style={styles.saveSiteButton} onPress={handleSaveThisSite}>
              <Text style={styles.saveSiteButtonText}>💾 Save "{siteName}" for future use</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Exposure'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exposure Type</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={EXPOSURE_TYPES}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setExposureType(item.value);
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                  {exposureType === item.value && <Text style={styles.modalItemCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  modalItemCheck: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  // Voice Entry Styles
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  voiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#dc3545',
  },
  voiceButtonIcon: {
    fontSize: 28,
  },
  voiceTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  voiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  voiceTranscript: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // T100: AI Scan Styles
  section: {
    marginBottom: spacing.lg,
  },
  aiLoadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  aiLoadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  aiErrorContainer: {
    padding: spacing.md,
    backgroundColor: colors.errorContainer,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  aiErrorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  // T110-T111: Site Name Styles
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestionLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  suggestions: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    padding: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  suggestionItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  suggestionDistance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveSiteButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  saveSiteButtonText: {
    fontSize: 13,
    color: colors.onSecondaryContainer,
    fontWeight: '600',
    textAlign: 'center',
  },
});
