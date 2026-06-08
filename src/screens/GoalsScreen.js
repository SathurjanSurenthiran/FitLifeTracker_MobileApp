import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { updateGoals } from '../services/database';
import { ProgressBar, CustomButton, InputField } from '../components';
import { COLORS, SIZES } from '../constants';

const GOAL_CFG = [
  { key: 'water', dbKey: 'water_goal_ml', icon: 'water', label: 'Daily Water', unit: 'ml', color: COLORS.water, min: 500, max: 10000, hint: 'Recommended: 2000–3000 ml/day', todayKey: 'todayWater' },
  { key: 'calorie', dbKey: 'calorie_goal', icon: 'flame', label: 'Daily Calories', unit: 'kcal', color: COLORS.calorie, min: 500, max: 10000, hint: 'Avg adult: 1800–2500 kcal/day', todayKey: 'todayCalories' },
  { key: 'workout', dbKey: 'workout_goal_min', icon: 'barbell', label: 'Daily Workout', unit: 'min', color: COLORS.workout, min: 5, max: 480, hint: 'WHO recommends 30+ min/day', todayKey: 'todayWorkoutMin' },
];

const GoalsScreen = () => {
  const { goals, todayWater, todayCalories, todayWorkoutMin, refreshGoals } = useApp();
  const todayValues = { todayWater, todayCalories, todayWorkoutMin };

  const [editing, setEditing] = useState(null);
  const [vals, setVals] = useState({ water_goal_ml: '', calorie_goal: '', workout_goal_min: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVals({ water_goal_ml: String(goals.water_goal_ml), calorie_goal: String(goals.calorie_goal), workout_goal_min: String(goals.workout_goal_min) });
  }, [goals]);

  const handleSave = async () => {
    const e = {};
    GOAL_CFG.forEach(({ dbKey, min, max, label }) => {
      const v = parseInt(vals[dbKey]);
      if (isNaN(v) || v < min) e[dbKey] = `Min ${min} for ${label}`;
      if (v > max) e[dbKey] = `Max ${max} for ${label}`;
    });
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await updateGoals({ water_goal_ml: parseInt(vals.water_goal_ml), calorie_goal: parseInt(vals.calorie_goal), workout_goal_min: parseInt(vals.workout_goal_min) });
      await refreshGoals();
      setEditing(null);
      Alert.alert('✅ Saved', 'Your goals have been updated!');
    } catch { Alert.alert('Error', 'Could not save. Try again.'); }
    finally { setSaving(false); }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.heroDeco} />
          <Text style={styles.headerTitle}>Your Fitness Goals</Text>
          <Text style={styles.headerSub}>Set realistic daily targets to build lasting habits</Text>
        </View>

        {/* Goal cards */}
        {GOAL_CFG.map(({ key, dbKey, icon, label, unit, color, hint, todayKey }) => {
          const goal = parseInt(vals[dbKey]) || 1;
          const today = todayValues[todayKey] || 0;
          const pct = Math.min((today / goal) * 100, 100);
          const isEditing = editing === key;

          return (
            <View key={key}>
              <TouchableOpacity style={[styles.goalCard, isEditing && { borderColor: color + '60' }]} onPress={() => setEditing(isEditing ? null : key)} activeOpacity={0.85}>
                <View style={styles.goalCardTop}>
                  <View style={[styles.goalIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalLabel}>{label}</Text>
                    <View style={styles.goalValRow}>
                      <Text style={[styles.goalCurrent, { color }]}>{today}</Text>
                      <Text style={styles.goalSlash}> / </Text>
                      <Text style={styles.goalTarget}>{vals[dbKey]} {unit}</Text>
                    </View>
                  </View>
                  <View style={[styles.editBadge, isEditing && { backgroundColor: color + '20' }]}>
                    <Ionicons name={isEditing ? 'chevron-up' : 'pencil'} size={16} color={isEditing ? color : COLORS.textMuted} />
                  </View>
                </View>
                <ProgressBar progress={pct} color={color} height={6} />
                <View style={styles.goalFooter}>
                  <Text style={styles.goalPct}>{Math.round(pct)}% complete</Text>
                  <Text style={[styles.goalRemain, { color }]}>{Math.max(goal - today, 0)} {unit} left</Text>
                </View>
              </TouchableOpacity>

              {isEditing && (
                <View style={[styles.editCard, { borderColor: color + '40' }]}>
                  <InputField
                    label={`${label} Goal (${unit})`}
                    value={vals[dbKey]}
                    onChangeText={(t) => { setVals(v => ({...v, [dbKey]: t})); setErrors(e => ({...e, [dbKey]: ''})); }}
                    keyboardType="numeric"
                    error={errors[dbKey]}
                  />
                  <Text style={styles.hintText}>💡 {hint}</Text>
                </View>
              )}
            </View>
          );
        })}

        <CustomButton label="Save All Goals" onPress={handleSave} loading={saving} size="lg" style={styles.saveBtn} />

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Goal Setting Guide</Text>
          {[
            { icon: 'water', color: COLORS.water, tip: 'Increase water goal by 250ml every 2 weeks.' },
            { icon: 'flame', color: COLORS.calorie, tip: 'Calorie goals depend on your weight and activity level.' },
            { icon: 'barbell', color: COLORS.workout, tip: 'Start with 20–30 min/day and increase gradually.' },
            { icon: 'trending-up', color: COLORS.progress, tip: 'Consistency over intensity — small daily habits win.' },
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: t.color + '20' }]}>
                <Ionicons name={t.icon} size={14} color={t.color} />
              </View>
              <Text style={styles.tipText}>{t.tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  headerCard: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, padding: SIZES.lg, overflow: 'hidden' },
  heroDeco: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#ffffff15', top: -30, right: -20 },
  headerTitle: { color: '#0A0E1A', fontSize: SIZES.fontXxl, fontWeight: '900', marginBottom: 4 },
  headerSub: { color: '#0A0E1A99', fontSize: SIZES.fontSm },

  goalCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  goalCardTop: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  goalIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  goalLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '500', marginBottom: 2 },
  goalValRow: { flexDirection: 'row', alignItems: 'baseline' },
  goalCurrent: { fontSize: SIZES.fontXxl, fontWeight: '800' },
  goalSlash: { color: COLORS.textMuted, fontSize: SIZES.fontMd },
  goalTarget: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600' },
  editBadge: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalPct: { color: COLORS.textMuted, fontSize: SIZES.fontXs },
  goalRemain: { fontSize: SIZES.fontXs, fontWeight: '700' },

  editCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, marginTop: -SIZES.sm, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  hintText: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontStyle: 'italic' },

  saveBtn: { paddingVertical: 16 },

  tipsCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, gap: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  tipsTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '700' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm },
  tipIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  tipText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, flex: 1, lineHeight: 20 },
});

export default GoalsScreen;
