import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { addCalorieEntry, deleteCalorieEntry } from '../services/database';
import { ProgressBar, EmptyState, CustomButton } from '../components';
import { COLORS, SIZES, MEAL_CATEGORIES } from '../constants';

const CAT_CONFIG = {
  Breakfast: { icon: 'sunny',       color: '#FFD166' },
  Lunch:     { icon: 'restaurant',  color: '#06D6A0' },
  Dinner:    { icon: 'moon',        color: '#A78BFA' },
  Snack:     { icon: 'cafe',        color: COLORS.calorie },
};

const CalorieTrackerScreen = () => {
  const { today, todayCalories, goals, calorieEntries, calorieProgress, refreshCalories } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [category, setCategory] = useState('Breakfast');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const remaining = Math.max(goals.calorie_goal - todayCalories, 0);

  const validate = () => {
    const e = {};
    if (!mealName.trim()) e.mealName = 'Meal name required';
    const c = parseInt(calories);
    if (isNaN(c) || c <= 0) e.calories = 'Enter valid calories';
    if (c > 5000) e.calories = 'Max 5000 per entry';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addCalorieEntry(mealName.trim(), parseInt(calories), category, today);
      await refreshCalories();
      setModalVisible(false);
      setMealName(''); setCalories(''); setCategory('Breakfast'); setErrors({});
    } catch { Alert.alert('Error', 'Could not save. Try again.'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this meal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCalorieEntry(id); await refreshCalories(); } },
    ]);
  };

  const grouped = MEAL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = calorieEntries.filter((e) => e.category === cat);
    return acc;
  }, {});

  // Per-category totals for the summary circles
  const catTotals = MEAL_CATEGORIES.map((cat) => ({
    cat,
    total: grouped[cat].reduce((s, e) => s + e.calories, 0),
    ...CAT_CONFIG[cat],
  }));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* SUMMARY HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco} />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Today's Calories</Text>
              <Text style={styles.heroVal}>{todayCalories}<Text style={styles.heroUnit}> kcal</Text></Text>
            </View>
            <View style={styles.remainBubble}>
              <Text style={styles.remainVal}>{remaining}</Text>
              <Text style={styles.remainLbl}>remaining</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Goal: {goals.calorie_goal} kcal</Text>
            <Text style={[styles.progressPct, { color: COLORS.calorie }]}>{Math.round(calorieProgress)}%</Text>
          </View>
          <ProgressBar progress={calorieProgress} color={COLORS.calorie} height={10} />

          {/* Cat summary chips */}
          <View style={styles.catSummaryRow}>
            {catTotals.map(({ cat, total, icon, color }) => (
              <View key={cat} style={styles.catSummaryChip}>
                <View style={[styles.catSummaryIcon, { backgroundColor: color + '22' }]}>
                  <Ionicons name={icon} size={14} color={color} />
                </View>
                <View>
                  <Text style={[styles.catSummaryVal, { color }]}>{total}</Text>
                  <Text style={styles.catSummaryLbl}>{cat}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity style={styles.addMealBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={22} color={COLORS.primary} />
          <Text style={styles.addMealText}>Log a Meal</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* GROUPED ENTRIES */}
        {MEAL_CATEGORIES.map((cat) => {
          const entries = grouped[cat];
          if (!entries.length) return null;
          const { icon, color } = CAT_CONFIG[cat];
          const total = entries.reduce((s, e) => s + e.calories, 0);
          return (
            <View key={cat}>
              <View style={styles.catGroupHeader}>
                <View style={[styles.catGroupIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text style={[styles.catGroupTitle, { color }]}>{cat}</Text>
                <View style={{ flex: 1 }} />
                <Text style={[styles.catGroupTotal, { color }]}>{total} kcal</Text>
              </View>
              <View style={styles.entriesList}>
                {entries.map((entry, idx) => (
                  <View key={entry.id} style={[styles.entryItem, idx > 0 && styles.entryBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.entryName}>{entry.meal_name}</Text>
                      <Text style={styles.entryTime}>{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.calBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[styles.calBadgeText, { color }]}>{entry.calories} kcal</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(entry.id)} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={15} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {calorieEntries.length === 0 && (
          <EmptyState icon="restaurant-outline" title="No meals logged" subtitle="Tap 'Log a Meal' to start tracking" />
        )}
      </ScrollView>

      {/* ADD MEAL MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log a Meal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Meal Name</Text>
            <TextInput value={mealName} onChangeText={(t) => { setMealName(t); setErrors(e => ({...e, mealName:''})); }} placeholder="e.g. Oatmeal with banana" placeholderTextColor={COLORS.textMuted} style={[styles.input, errors.mealName && styles.inputErr]} />
            {errors.mealName ? <Text style={styles.errText}>{errors.mealName}</Text> : null}

            <Text style={styles.fieldLabel}>Calories (kcal)</Text>
            <TextInput value={calories} onChangeText={(t) => { setCalories(t); setErrors(e => ({...e, calories:''})); }} placeholder="e.g. 350" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" style={[styles.input, errors.calories && styles.inputErr]} />
            {errors.calories ? <Text style={styles.errText}>{errors.calories}</Text> : null}

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catGrid}>
              {MEAL_CATEGORIES.map((cat) => {
                const { icon, color } = CAT_CONFIG[cat];
                const active = category === cat;
                return (
                  <TouchableOpacity key={cat} style={[styles.catChip, active && { backgroundColor: color + '22', borderColor: color }]} onPress={() => setCategory(cat)}>
                    <Ionicons name={icon} size={16} color={active ? color : COLORS.textMuted} />
                    <Text style={[styles.catChipLabel, active && { color }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <CustomButton label="Save Meal" onPress={handleAdd} loading={loading} style={styles.saveBtn} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  heroCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusXl, padding: SIZES.lg, gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  heroDeco: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.calorie + '08', top: -50, right: -30 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '500', marginBottom: 4 },
  heroVal: { color: COLORS.textPrimary, fontSize: SIZES.fontDisplay, fontWeight: '900' },
  heroUnit: { color: COLORS.textSecondary, fontSize: SIZES.fontLg, fontWeight: '400' },
  remainBubble: { backgroundColor: COLORS.calorie + '20', borderRadius: SIZES.radiusMd, padding: SIZES.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.calorie + '40' },
  remainVal: { color: COLORS.calorie, fontSize: SIZES.fontXxl, fontWeight: '800' },
  remainLbl: { color: COLORS.calorie + 'AA', fontSize: 10, fontWeight: '500' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },
  progressPct: { fontSize: SIZES.fontSm, fontWeight: '700' },
  catSummaryRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,},
  catSummaryChip: {flex: 1,height: 72, backgroundColor: COLORS.surfaceLight,  borderRadius: SIZES.radiusMd, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.surfaceBorder, marginHorizontal: 3, padding:6,},
  catSummaryIcon: {width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 4,},
  catSummaryVal: {fontSize: SIZES.fontSm, fontWeight: '800', textAlign: 'center',},
  catSummaryLbl: {color: COLORS.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center',},

  addMealBtn: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.primary + '40' },
  addMealText: { flex: 1, color: COLORS.primary, fontSize: SIZES.fontMd, fontWeight: '600' },

  catGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.xs },
  catGroupIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  catGroupTitle: { fontSize: SIZES.fontMd, fontWeight: '700' },
  catGroupTotal: { fontSize: SIZES.fontSm, fontWeight: '700' },
  entriesList: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden', marginBottom: 4 },
  entryItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  entryBorder: { borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder },
  entryName: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '600' },
  entryTime: { color: COLORS.textMuted, fontSize: SIZES.fontXs },
  calBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  calBadgeText: { fontSize: SIZES.fontXs, fontWeight: '700' },

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
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SIZES.sm + 4, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusFull, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, backgroundColor: COLORS.surfaceLight },
  catChipLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '500' },
  saveBtn: { marginTop: SIZES.sm, paddingVertical: 14 },
});

export default CalorieTrackerScreen;
