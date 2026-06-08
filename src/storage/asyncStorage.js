// Thin wrapper around AsyncStorage for non-SQLite key-value preferences
// (e.g. onboarding flag, last-opened date, theme preference)

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@fitlife_';

// Core helpers

export const storeItem = async (key, value) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(PREFIX + key, serialized);
  } catch (e) {
    console.error('[AsyncStorage] storeItem error:', e);
  }
};

export const getItem = async (key, defaultValue = null) => {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return raw; // plain string
    }
  } catch (e) {
    console.error('[AsyncStorage] getItem error:', e);
    return defaultValue;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.error('[AsyncStorage] removeItem error:', e);
  }
};

export const clearAll = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter((k) => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(appKeys);
  } catch (e) {
    console.error('[AsyncStorage] clearAll error:', e);
  }
};

// App-specific helpers

// Onboarding completed flag
export const setOnboardingDone = () => storeItem('onboarding_done', true);
export const isOnboardingDone  = () => getItem('onboarding_done', false);

// Last app-open date (for streak logic)
export const setLastOpenDate = (dateStr) => storeItem('last_open_date', dateStr);
export const getLastOpenDate  = () => getItem('last_open_date', null);

// Selected theme (future feature)
export const setTheme = (theme) => storeItem('theme', theme);
export const getTheme = () => getItem('theme', 'dark');

// Notification IDs (so we can cancel them later)
export const storeNotificationId = (type, id) => storeItem(`notif_id_${type}`, id);
export const getNotificationId   = (type) => getItem(`notif_id_${type}`, null);
export const clearNotificationId = (type) => removeItem(`notif_id_${type}`);

export default {
  storeItem,
  getItem,
  removeItem,
  clearAll,
  setOnboardingDone,
  isOnboardingDone,
  setLastOpenDate,
  getLastOpenDate,
  setTheme,
  getTheme,
  storeNotificationId,
  getNotificationId,
  clearNotificationId,
};
