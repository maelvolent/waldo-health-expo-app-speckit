/**
 * T082: Voice Language Checker
 * Verifies NZ English (en-NZ) voice recognition support on app launch
 * Shows warning if not available, suggests AU English (en-AU) fallback
 *
 * Note: Gracefully handles Expo Go environment where native modules aren't available
 */

import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Dynamically import Voice to handle Expo Go gracefully
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (error) {
  console.warn('[Voice] Native voice module not available (likely running in Expo Go)');
}

export function VoiceLanguageChecker() {
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    async function checkVoiceLanguageSupport() {
      // Only check once per app launch
      if (hasChecked) return;

      // Skip if Voice module not available (Expo Go)
      if (!Voice) {
        setHasChecked(true);
        return;
      }

      try {
        // Check if voice recognition is available
        const available = await Voice.isAvailable();
        if (available !== 1) {
          console.warn('[Voice] Speech recognition not available on this device');
          setHasChecked(true);
          return;
        }

        // Get list of supported languages
        const languages = await Voice.getSupportedLanguages();

        if (!languages || languages.length === 0) {
          console.warn('[Voice] No languages available for speech recognition');
          setHasChecked(true);
          return;
        }

        // Check for NZ English (en-NZ)
        const hasNZEnglish = languages.some(
          lang => lang.toLowerCase() === 'en-nz' || lang.toLowerCase() === 'en_nz'
        );

        // Check for AU English (en-AU) as fallback
        const hasAUEnglish = languages.some(
          lang => lang.toLowerCase() === 'en-au' || lang.toLowerCase() === 'en_au'
        );

        if (!hasNZEnglish && !hasAUEnglish) {
          // Show warning if neither NZ nor AU English is available
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Alert.alert(
              'Voice Recognition Setup',
              'For best results with voice entry, please install the English (New Zealand) language pack in your device settings.\n\nAlternatively, English (Australia) can be used as a fallback.',
              [{ text: 'OK', style: 'default' }]
            );
          }

          console.warn('[Voice] Neither en-NZ nor en-AU language pack found');
          console.warn('[Voice] Available languages:', languages);
        } else if (!hasNZEnglish && hasAUEnglish) {
          console.log('[Voice] NZ English not found, will use AU English as fallback');
        } else {
          console.log('[Voice] NZ English language pack detected');
        }

        setHasChecked(true);
      } catch (error) {
        console.error('[Voice] Error checking language support:', error);
        setHasChecked(true);
      }
    }

    // Check after a short delay to avoid blocking app startup
    const timer = setTimeout(checkVoiceLanguageSupport, 2000);

    return () => clearTimeout(timer);
  }, [hasChecked]);

  // This component doesn't render anything
  return null;
}
