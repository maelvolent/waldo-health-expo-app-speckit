/**
 * Tab Navigation Layout
 * Configures bottom tab navigation with icons and styling
 * T059: Haptic feedback on tab switches
 * T016: Glass effect on tab bar (003-liquid-glass)
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@constants/theme';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  // T059: Tab press handler with haptic feedback
  const handleTabPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptic feedback not available on this device
      console.warn('Haptic feedback not available:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // T016: Glass effect tab bar styling
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.surface,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={85}
              tint="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
              accessibilityLabel="Home tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'New',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color={color}
              accessibilityLabel="New exposure tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={24}
              color={color}
              accessibilityLabel="Exposure history tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: 'Export',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'download' : 'download-outline'}
              size={24}
              color={color}
              accessibilityLabel="Export data tab"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
              accessibilityLabel="Education and resources tab"
            />
          ),
        }}
      />
    </Tabs>
  );
}
