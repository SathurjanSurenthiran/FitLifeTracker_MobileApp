import React, { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { addWorkoutEntry, deleteWorkoutEntry } from '../services/database';
import { ProgressBar, EmptyState, CustomButton } from '../components';
import { COLORS, SIZES, WORKOUT_TYPES } from '../constants';
import { formatStopwatch, estimateCaloriesBurned } from '../utils';

const WorkoutTrackerScreen = () => {
  const { today, todayWorkoutMin, goals, workoutEntries, workoutProgress, profile, refreshWorkouts } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [workoutType, setWorkoutType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swSeconds, setSwSeconds] = useState(0);
  const swRef = useRef(null);

  // Countdown
  const [cdRunning, setCdRunning] = useState(false);
  const [cdSeconds, setCdSeconds] = useState(0);
  const [cdTarget, setCdTarget] = useState('5');
  const cdRef = useRef(null);

  useEffect(() => {
    if (swRunning) { swRef.current = setInterval(() => setSwSeconds(s => s + 1), 1000); }
    else clearInterval(swRef.current);
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  useEffect(() => {
    if (cdRunning) {
      cdRef.current = setInterval(() => {
        setCdSeconds(s => {
          if (s <= 1) { clearInterval(cdRef.current); setCdRunning(false); Alert.alert('⏱ Done!', 'Countdown finished!'); return 0; }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(cdRef.current);
    return () => clearInterval(cdRef.current);
  }, [cdRunning]);

  const startCD = () => {
    const m = parseInt(cdTarget);
    if (isNaN(m) || m <= 0) { Alert.alert('Invalid', 'Enter valid minutes'); return; }
    setCdSeconds(m * 60); setCdRunning(true);
  };

  useEffect(() => {
    if (duration) setCaloriesBurned(String(estimateCaloriesBurned(workoutType, parseInt(duration) || 0, profile?.weight || 70)));
  }, [workoutType, duration]);

  const validate = () => {
    const e = {};
    const d = parseInt(duration);
    if (isNaN(d) || d <= 0) e.duration = 'Enter valid duration (minutes)';
    if (d > 600) e.duration = 'Max 600 minutes';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addWorkoutEntry(workoutType, parseInt(duration), parseInt(caloriesBurned) || 0, notes.trim(), today);
      await refreshWorkouts();
      setModalVisible(false);
      setDuration(''); setCaloriesBurned(''); setNotes(''); setErrors({});
    } catch { Alert.alert('Error', 'Could not save.'); } finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteWorkoutEntry(id); await refreshWorkouts(); } },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* SUMMARY HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco} />
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Workout Today</Text>
              <Text style={styles.heroVal}>{todayWorkoutMin}<Text style={styles.heroUnit}> min</Text></Text>
              <Text style={styles.heroSub}>{workoutEntries.length} session{workoutEntries.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.heroCircle}>
              <Ionicons name="barbell" size={30} color={COLORS.workout} />
              <Text style={[styles.circPct, { color: COLORS.workout }]}>{Math.round(workoutProgress)}%</Text>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Goal: {goals.workout_goal_min} min</Text>
              <Text style={[styles.progressPct, { color: COLORS.workout }]}>{Math.round(workoutProgress)}%</Text>
            </View>
            <ProgressBar progress={workoutProgress} color={COLORS.workout} height={10} />
          </View>
        </View>

        {/* TIMERS */}
        <Text style={styles.sectionTitle}>Timers</Text>
        <View style={styles.timersRow}>
          {/* Stopwatch */}
          <View style={styles.timerCard}>
            <Text style={styles.timerType}>Stopwatch</Text>
            <Text style={[styles.timerDisplay, swRunning && { color: COLORS.primary }]}>{formatStopwatch(swSeconds)}</Text>
            <View style={styles.timerBtns}>
              <TouchableOpacity style={[styles.timerBtn, { backgroundColor: swRunning ? COLORS.error + '25' : COLORS.primary + '25' }]} onPress={() => setSwRunning(!swRunning)}>
                <Ionicons name={swRunning ? 'pause' : 'play'} size={18} color={swRunning ? COLORS.error : COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.timerBtn, { backgroundColor: COLORS.surfaceLight }]} onPress={() => { setSwRunning(false); setSwSeconds(0); }}>
                <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Countdown */}
          <View style={styles.timerCard}>
            <Text style={styles.timerType}>Countdown</Text>
            <Text style={[styles.timerDisplay, cdRunning && cdSeconds < 10 && { color: COLORS.error }]}>
              {cdRunning || cdSeconds > 0 ? formatStopwatch(cdSeconds) : `${cdTarget || 0}:00`}
            </Text>
            {!cdRunning && cdSeconds === 0 && (
              <View style={styles.cdInputRow}>
                <TextInput value={cdTarget} onChangeText={setCdTarget} placeholder="min" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" style={styles.cdInput} />
                <Text style={styles.cdMinLabel}>min</Text>
              </View>
            )}
            <View style={styles.timerBtns}>
              {!cdRunning && cdSeconds === 0 ? (
                <TouchableOpacity style={[styles.timerBtn, { backgroundColor: COLORS.primary + '25' }]} onPress={startCD}>
                  <Ionicons name="play" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.timerBtn, { backgroundColor: cdRunning ? COLORS.error + '25' : COLORS.primary + '25' }]} onPress={() => setCdRunning(!cdRunning)}>
                  <Ionicons name={cdRunning ? 'pause' : 'play'} size={18} color={cdRunning ? COLORS.error : COLORS.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.timerBtn, { backgroundColor: COLORS.surfaceLight }]} onPress={() => { setCdRunning(false); setCdSeconds(0); }}>
                <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* LOG BUTTON */}
        <TouchableOpacity style={styles.logBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={22} color={COLORS.workout} />
          <Text style={[styles.logBtnText, { color: COLORS.workout }]}>Log Workout</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* HISTORY */}
        <Text style={styles.sectionTitle}>Today's Sessions</Text>
        {workoutEntries.length === 0 ? (
          <EmptyState icon="barbell-outline" title="No workouts yet" subtitle="Tap Log Workout to get started" />
        ) : (
          <View style={styles.historyList}>
            {workoutEntries.map((entry, idx) => (
              <View key={entry.id} style={[styles.historyItem, idx > 0 && styles.historyBorder]}>
                <View style={styles.historyIcon}>
                  <Ionicons name="barbell" size={16} color={COLORS.workout} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyType}>{entry.workout_type}</Text>
                  <Text style={styles.historyMeta}>{entry.duration_min} min · {entry.calories_burned} kcal burned</Text>
                  {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{entry.duration_min}m</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Workout Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SIZES.sm }}>
              <View style={{ flexDirection: 'row', gap: SIZES.xs }}>
                {WORKOUT_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeChip, workoutType === t && styles.typeChipActive]} onPress={() => setWorkoutType(t)}>
                    <Text style={[styles.typeChipLabel, workoutType === t && { color: '#0A0E1A' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Duration (minutes) *</Text>
            <TextInput value={duration} onChangeText={(t) => { setDuration(t); setErrors(e => ({...e, duration:''})); }} placeholder="e.g. 30" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" style={[styles.input, errors.duration && styles.inputErr]} />
            {errors.duration ? <Text style={styles.errText}>{errors.duration}</Text> : null}

            <Text style={styles.fieldLabel}>Calories Burned (auto-estimated)</Text>
            <TextInput value={caloriesBurned} onChangeText={setCaloriesBurned} placeholder="Auto-calculated" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" style={styles.input} />

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="How did it go?" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} style={[styles.input, { height: 80, textAlignVertical: 'top' }]} />

            <CustomButton label="Save Workout" onPress={handleAdd} loading={loading} style={styles.saveBtn} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  heroCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusXl, padding: SIZES.lg, gap: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  heroDeco: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.workout + '08', top: -60, right: -40 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, marginBottom: 4 },
  heroVal: { color: COLORS.textPrimary, fontSize: SIZES.fontDisplay, fontWeight: '900' },
  heroUnit: { color: COLORS.textSecondary, fontSize: SIZES.fontLg, fontWeight: '400' },
  heroSub: { color: COLORS.textMuted, fontSize: SIZES.fontXs, marginTop: 2 },
  heroCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.workout + '50', justifyContent: 'center', alignItems: 'center', gap: 2 },
  circPct: { fontSize: SIZES.fontSm, fontWeight: '800' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },
  progressPct: { fontSize: SIZES.fontSm, fontWeight: '700' },

  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700' },

  timersRow: { flexDirection: 'row', gap: SIZES.sm },
  timerCard: { flex: 1, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, alignItems: 'center', gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  timerType: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  timerDisplay: { color: COLORS.textPrimary, fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerBtns: { flexDirection: 'row', gap: SIZES.sm },
  timerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cdInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cdInput: { backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusSm, paddingHorizontal: SIZES.sm, paddingVertical: 4, color: COLORS.textPrimary, fontSize: SIZES.fontMd, borderWidth: 1, borderColor: COLORS.surfaceBorder, width: 55, textAlign: 'center' },
  cdMinLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm },

  logBtn: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.workout + '40' },
  logBtnText: { flex: 1, fontSize: SIZES.fontMd, fontWeight: '600' },

  historyList: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  historyBorder: { borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder },
  historyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.workout + '20', justifyContent: 'center', alignItems: 'center' },
  historyType: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '600' },
  historyMeta: { color: COLORS.textMuted, fontSize: SIZES.fontXs },
  historyNotes: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, marginTop: 1 },
  durationBadge: { backgroundColor: COLORS.workout + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  durationText: { color: COLORS.workout, fontSize: SIZES.fontXs, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: SIZES.radiusXxl, borderTopRightRadius: SIZES.radiusXxl, padding: SIZES.lg, paddingTop: SIZES.md, gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.surfaceBorder, borderRadius: 2, alignSelf: 'center', marginBottom: SIZES.sm },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontXl, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  fieldLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '600', marginTop: 4 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.md, paddingVertical: 12, color: COLORS.textPrimary, fontSize: SIZES.fontMd, borderWidth: 1.5, borderColor: COLORS.surfaceBorder },
  inputErr: { borderColor: COLORS.error },
  errText: { color: COLORS.error, fontSize: SIZES.fontXs },
  typeChip: { paddingHorizontal: SIZES.sm + 2, paddingVertical: SIZES.xs + 2, borderRadius: SIZES.radiusFull, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, backgroundColor: COLORS.surfaceLight },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '500' },
  saveBtn: { marginTop: SIZES.sm, paddingVertical: 14 },
});

export default WorkoutTrackerScreen;
