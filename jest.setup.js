// Setup file for Jest
// Extend expect with custom matchers from @testing-library/react-native
// import '@testing-library/jest-native/extend-expect'; // Temporarily disabled due to Expo module issues

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Suppress console.error, console.warn in tests unless you need them
  error: jest.fn(),
  warn: jest.fn(),
  log: console.log, // Keep console.log for debugging
};

// Mock Expo modules
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  CameraView: 'CameraView',
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: -36.8485,
        longitude: 174.7633,
        accuracy: 10,
      },
    })
  ),
}));

jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
  removeAllListeners: jest.fn(),
  isAvailable: jest.fn(() => Promise.resolve(true)),
}));

// Mock Expo modules that cause import issues
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}), { virtual: true });

// Mock Expo's winter runtime
jest.mock('expo/src/winter/runtime.native.ts', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal.ts', () => ({}), { virtual: true });

jest.mock('expo-router', () => ({
  Slot: 'Slot',
  Stack: 'Stack',
  Tabs: 'Tabs',
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));
