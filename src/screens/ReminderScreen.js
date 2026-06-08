import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { updateNotificationSettings } from '../services/database';
import { applyNotificationSettings, requestNotificationPermission, sendTestNotification } from '../services/notifications';
import { CustomButton } from '../components';
import { COLORS, SIZES } from '../constants';

const WATER_INTERVALS = [{ label: '30m', value: 30 }, { label: '1h', value: 60 }, { label: '2h', value: 120 }, { label: '3h', value: 180 }];
const TIMES = ['06:00','07:00','08:00','09:00','18:00','19:00','20:00'];

const ReminderScreen = () => {
  const { notificationSettings, refreshNotificationSettings } = useApp();
  const [waterReminder, setWaterReminder] = useState(true);
  const [waterInterval, setWaterInterval] = useState(60);
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [workoutTime, setWorkoutTime] = useState('07:00');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [dailyTime, setDailyTime] = useState('08:00');
  const [saving, setSaving] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (notificationSettings) {
      setWaterReminder(!!notificationSettings.water_reminder);
      setWaterInterval(notificationSettings.water_interval_min || 60);
      setWorkoutReminder(!!notificationSettings.workout_reminder);
      setWorkoutTime(notificationSettings.workout_time || '07:00');
      setDailyReminder(!!notificationSettings.daily_reminder);
      setDailyTime(notificationSettings.daily_time || '08:00');
    }
    requestNotificationPermission().then(setGranted);
  }, [notificationSettings]);

  const handleSave = async () => {
    if (!granted) {
      const ok = await requestNotificationPermission();
      if (!ok) { Alert.alert('Permission Required', 'Enable notifications in device settings.'); return; }
      setGranted(true);
    }
    setSaving(true);
    try {
      const s = { water_reminder: waterReminder, water_interval_min: waterInterval, workout_reminder: workoutReminder, workout_time: workoutTime, daily_reminder: dailyReminder, daily_time: dailyTime };
      await updateNotificationSettings(s);
      await applyNotificationSettings(s);
      await refreshNotificationSettings();
      Alert.alert('✅ Saved', 'Reminders have been scheduled!');
    } catch { Alert.alert('Error', 'Could not save settings.'); } finally { setSaving(false); }
  };

  const SECTIONS = [
    {
      id: 'water', icon: 'water', color: COLORS.water, label: 'Water Reminders', sub: 'Get nudged to stay hydrated',
      enabled: waterReminder, onToggle: setWaterReminder,
      extra: waterReminder && (
        <View>
          <Text style={styles.subLabel}>Interval</Text>
          <View style={styles.chipRow}>
            {WATER_INTERVALS.map(o => (
              <TouchableOpacity key={o.value} style={[styles.chip, waterInterval === o.value && { backgroundColor: COLORS.water, borderColor: COLORS.water }]} onPress={() => setWaterInterval(o.value)}>
                <Text style={[styles.chipLabel, waterInterval === o.value && { color: '#0A0E1A' }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'workout', icon: 'barbell', color: COLORS.workout, label: 'Workout Reminder', sub: 'Daily push to hit your fitness goal',
      enabled: workoutReminder, onToggle: setWorkoutReminder,
      extra: workoutReminder && (
        <View>
          <Text style={styles.subLabel}>Time</Text>
          <View style={styles.chipRow}>
            {TIMES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, workoutTime === t && { backgroundColor: COLORS.workout, borderColor: COLORS.workout }]} onPress={() => setWorkoutTime(t)}>
                <Text style={[styles.chipLabel, workoutTime === t && { color: '#0A0E1A' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'daily', icon: 'sunny', color: COLORS.primary, label: 'Daily Check-in', sub: 'Morning reminder to log activities',
      enabled: dailyReminder, onToggle: setDailyReminder,
      extra: dailyReminder && (
        <View>
          <Text style={styles.subLabel}>Time</Text>
          <View style={styles.chipRow}>
            {['06:00','07:00','08:00','09:00','10:00'].map(t => (
              <TouchableOpacity key={t} style={[styles.chip, dailyTime === t && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} onPress={() => setDailyTime(t)}>
                <Text style={[styles.chipLabel, dailyTime === t && { color: '#0A0E1A' }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Permission banner */}
        <TouchableOpacity style={[styles.permBanner, { backgroundColor: granted ? COLORS.primary + '15' : COLORS.warning + '15', borderColor: granted ? COLORS.primary + '50' : COLORS.warning + '50' }]} onPress={() => requestNotificationPermission().then(setGranted)}>
          <Ionicons name={granted ? 'checkmark-circle' : 'warning'} size={18} color={granted ? COLORS.primary : COLORS.warning} />
          <Text style={[styles.permText, { color: granted ? COLORS.primary : COLORS.warning }]}>
            {granted ? 'Notifications are enabled' : 'Tap to enable notification permissions'}
          </Text>
        </TouchableOpacity>

        {/* Sections */}
        {SECTIONS.map(s => (
          <View key={s.id} style={[styles.section, s.enabled && { borderColor: s.color + '40' }]}>
            <View style={styles.sectionTop}>
              <View style={[styles.sectionIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>{s.label}</Text>
                <Text style={styles.sectionSub}>{s.sub}</Text>
              </View>
              <Switch value={s.enabled} onValueChange={s.onToggle} trackColor={{ false: COLORS.surfaceLight, true: s.color + '88' }} thumbColor={s.enabled ? s.color : COLORS.textMuted} />
            </View>
            {s.extra}
          </View>
        ))}

        <CustomButton label="Save & Schedule Reminders" onPress={handleSave} loading={saving} size="lg" style={styles.saveBtn} />

        <TouchableOpacity style={styles.testBtn} onPress={async () => { if (!granted) { Alert.alert('Enable notifications first'); return; } await sendTestNotification(); Alert.alert('Test Sent', 'Check in 2 seconds!'); }}>
          <Ionicons name="notifications" size={18} color={COLORS.textSecondary} />
          <Text style={styles.testBtnText}>Send Test Notification</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={16} color={COLORS.info} />
          <Text style={styles.infoText}>Reminders work even when the app is closed. Water reminders repeat at your chosen interval throughout the day.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  permBanner: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, borderRadius: SIZES.radiusMd, padding: SIZES.md, borderWidth: 1 },
  permText: { fontSize: SIZES.fontSm, fontWeight: '600', flex: 1 },

  section: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, gap: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  sectionTop: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  sectionIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sectionLabel: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '700' },
  sectionSub: { color: COLORS.textMuted, fontSize: SIZES.fontXs, marginTop: 1 },
  subLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, fontWeight: '600', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs + 2 },
  chip: { paddingHorizontal: SIZES.sm + 4, paddingVertical: SIZES.xs + 2, borderRadius: SIZES.radiusFull, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, backgroundColor: COLORS.surfaceLight },
  chipLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '600' },

  saveBtn: { paddingVertical: 16 },
  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusMd, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  testBtnText: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600' },
  infoCard: { flexDirection: 'row', gap: SIZES.sm, alignItems: 'flex-start', backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusMd, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  infoText: { color: COLORS.textMuted, fontSize: SIZES.fontSm, flex: 1, lineHeight: 20 },
});

export default ReminderScreen;
