// Root entry point: initialises DB, shows splash → onboarding → main app

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { AppProvider } from './src/context/AppContext';
import AppNavigator     from './src/navigation/AppNavigator';
import SplashScreen     from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { openDatabase } from './src/services/database';
import { requestNotificationPermission } from './src/services/notifications';
import { isOnboardingDone, setOnboardingDone, setLastOpenDate } from './src/storage/asyncStorage';
import { COLORS } from './src/constants';

// Suppress known harmless warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Sending `onAnimatedValueUpdate`',
  'expo-notifications: Android Push notifications',
  'expo-notifications',
  'functionality is not fully supported in ExpoGo',
]);

// Global notification tap handler (wrapped in try-catch for SDK 53 compatibility)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (err) {
  console.warn('Notification handler setup failed (expected on Expo Go):', err.message);
}

// App states
// 'splash'      → loading DB and preferences
// 'onboarding'  → first-time user slides
// 'app'         → main app

const App = () => {
  const [appState, setAppState] = useState('splash');

  const init = useCallback(async () => {
    try {
      // 1. Open / create SQLite DB and tables
      await openDatabase();

      // 2. Track today as last-open date
      const today = new Date().toISOString().split('T')[0];
      await setLastOpenDate(today);

      // 3. Request notification permission (non-blocking)
      requestNotificationPermission().catch(() => {});

      // 4. Check if onboarding has been seen
      const done = await isOnboardingDone();

      // Small delay so splash is visible
      await new Promise((r) => setTimeout(r, 1800));

      setAppState(done ? 'app' : 'onboarding');
    } catch (err) {
      console.error('App init failed:', err);
      // Fall back to app even on error so user isn't stuck
      setAppState('app');
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleOnboardingDone = useCallback(async () => {
    await setOnboardingDone();
    setAppState('app');
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      {appState === 'splash' && <SplashScreen />}

      {appState === 'onboarding' && (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}

      {appState === 'app' && (
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
