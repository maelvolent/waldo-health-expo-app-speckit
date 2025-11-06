/**
 * Tab Navigation Layout
 * Configures bottom tab navigation with icons and styling
 */

import { Text } from 'react-native';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: 'New',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📸</Text>,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'History',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: 'Export',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📄</Text>,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: 'Learn',
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📚</Text>,
        }}
      />
    </Tabs>
  );
}
