// Handles scheduling and cancelling local notifications

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications are shown while app is in foreground
// Wrapped in try-catch for SDK 53 compatibility with Expo Go
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (err) {
  console.warn('Notification handler setup failed:', err.message);
}

// Permission 

export const requestNotificationPermission = async () => {
  if (!Device.isDevice) {
    console.warn('Notifications only work on physical devices.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// Cancel all scheduled

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const cancelNotificationById = async (id) => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

// Water reminders
// Repeating interval reminder to drink water

export const scheduleWaterReminders = async (intervalMinutes = 60) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Time to Hydrate!',
      body: "Don't forget to drink water. Stay on track with your daily goal!",
      sound: true,
      data: { type: 'water_reminder' },
    },
    trigger: {
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });

  return id;
};

// Daily workout reminder

export const scheduleWorkoutReminder = async (timeString = '07:00') => {
  const [hour, minute] = timeString.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏋️ Workout Time!',
      body: "It's time to crush your workout. Every rep counts!",
      sound: true,
      data: { type: 'workout_reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
};

// Daily summary reminder

export const scheduleDailyReminder = async (timeString = '08:00') => {
  const [hour, minute] = timeString.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌟 FitLife Daily Check-in',
      body: 'Track your water, meals, and workouts to reach your goals today!',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  return id;
};

// Apply settings from DB

export const applyNotificationSettings = async (settings) => {
  await cancelAllNotifications();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (settings.water_reminder) {
    await scheduleWaterReminders(settings.water_interval_min || 60);
  }

  if (settings.workout_reminder) {
    await scheduleWorkoutReminder(settings.workout_time || '07:00');
  }

  if (settings.daily_reminder) {
    await scheduleDailyReminder(settings.daily_time || '08:00');
  }
};

// Instant test notification

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Notifications Active',
      body: 'FitLife reminders are set up and working!',
      sound: true,
    },
    trigger: { seconds: 2 },
  });
};
