/**
 * T079: useVoice Hook
 * React hook for managing voice recognition state and lifecycle
 *
 * Features:
 * - Voice session management (start/stop)
 * - Real-time transcription updates
 * - Automatic parsing of voice input to exposure fields
 * - Error handling and permissions
 * - NZ English locale support
 *
 * Note: Gracefully handles Expo Go environment where native modules aren't available
 */

import { useState, useEffect, useCallback } from 'react';
import { parseTranscript, ParsedExposure } from '@/lib/voice';

// Dynamically import Voice to handle Expo Go gracefully
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (error) {
  console.warn('[useVoice] Native voice module not available (likely running in Expo Go)');
}

interface VoiceState {
  isListening: boolean;
  isRecognizing: boolean;
  transcript: string;
  parsedData: ParsedExposure;
  error: string | null;
  isAvailable: boolean;
}

interface UseVoiceReturn extends VoiceState {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  clearTranscript: () => void;
}

/**
 * Hook for voice recognition with intelligent parsing
 *
 * @example
 * const { isListening, transcript, parsedData, startListening, stopListening } = useVoice();
 *
 * // Start voice recognition
 * await startListening();
 *
 * // Access real-time transcript
 * console.log(transcript); // "worked for 3 hours cutting concrete"
 *
 * // Access parsed exposure data
 * console.log(parsedData.duration); // { hours: 3, minutes: 0 }
 * console.log(parsedData.workActivity); // "cutting concrete"
 */
export function useVoice(): UseVoiceReturn {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isRecognizing: false,
    transcript: '',
    parsedData: {},
    error: null,
    isAvailable: false,
  });

  /**
   * Initialize voice recognition and set up event listeners
   */
  useEffect(() => {
    // Skip if Voice module not available (Expo Go)
    if (!Voice) {
      return;
    }

    // Check if voice recognition is available
    Voice.isAvailable()
      .then((available: number) => {
        setState(prev => ({ ...prev, isAvailable: available === 1 }));
      })
      .catch((error: any) => {
        console.error('Error checking voice availability:', error);
        setState(prev => ({ ...prev, isAvailable: false }));
      });

    // Event: Speech start
    Voice.onSpeechStart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    // Event: Speech end
    Voice.onSpeechEnd = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    // Event: Speech recognized
    Voice.onSpeechRecognized = () => {
      setState(prev => ({ ...prev, isRecognizing: true }));
    };

    // Event: Partial results (real-time transcription)
    Voice.onSpeechPartialResults = (event: any) => {
      const partialTranscript = event.value?.[0] || '';
      setState(prev => ({
        ...prev,
        transcript: partialTranscript,
        parsedData: parseTranscript(partialTranscript),
      }));
    };

    // Event: Final results
    Voice.onSpeechResults = (event: any) => {
      const finalTranscript = event.value?.[0] || '';
      setState(prev => ({
        ...prev,
        transcript: finalTranscript,
        parsedData: parseTranscript(finalTranscript),
        isRecognizing: false,
      }));
    };

    // Event: Error
    Voice.onSpeechError = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({
        ...prev,
        error: event.error?.message || 'Speech recognition error',
        isListening: false,
        isRecognizing: false,
      }));
    };

    // Cleanup on unmount
    return () => {
      Voice.destroy()
        .then(() => {
          Voice.removeAllListeners();
        })
        .catch((error: any) => {
          console.error('Error destroying voice:', error);
        });
    };
  }, []);

  /**
   * Start listening for voice input
   * Uses NZ English (en-NZ) with fallback to AU English (en-AU)
   */
  const startListening = useCallback(async () => {
    // Skip if Voice module not available
    if (!Voice) {
      setState(prev => ({
        ...prev,
        error: 'Voice recognition not available',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null, transcript: '', parsedData: {} }));

      // Try NZ English first
      try {
        await Voice.start('en-NZ');
      } catch {
        // Fallback to AU English if NZ not available
        await Voice.start('en-AU');
      }
    } catch (error: any) {
      console.error('Error starting voice recognition:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to start voice recognition',
        isListening: false,
      }));
    }
  }, []);

  /**
   * Stop listening for voice input
   */
  const stopListening = useCallback(async () => {
    // Skip if Voice module not available
    if (!Voice) {
      return;
    }

    try {
      await Voice.stop();
    } catch (error: any) {
      console.error('Error stopping voice recognition:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to stop voice recognition',
      }));
    }
  }, []);

  /**
   * Clear transcript and parsed data
   */
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      parsedData: {},
      error: null,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    clearTranscript,
  };
}
