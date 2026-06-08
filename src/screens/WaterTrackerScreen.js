import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { addWaterEntry, deleteWaterEntry } from '../services/database';
import { ProgressBar, EmptyState, CustomButton } from '../components';
import { COLORS, SIZES, WATER_PRESETS } from '../constants';

const { width: W } = Dimensions.get('window');

const WaterTrackerScreen = () => {
  const { today, todayWater, goals, waterEntries, waterProgress, refreshWater } = useApp();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');

  const remaining = Math.max(goals.water_goal_ml - todayWater, 0);
  const glasses = Math.floor(todayWater / 250);

  const handleAdd = async (amount) => {
    const ml = parseInt(amount);
    if (isNaN(ml) || ml <= 0) { setInputError('Enter a valid amount'); return; }
    if (ml > 5000) { setInputError('Maximum 5000 ml'); return; }
    setInputError('');
    setLoading(true);
    try {
      await addWaterEntry(ml, today);
      await refreshWater();
      setCustomAmount('');
    } catch { Alert.alert('Error', 'Could not save. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteWaterEntry(id); await refreshWater(); } },
    ]);
  };

  const pct = Math.round(waterProgress);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* CIRCULAR PROGRESS HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco1} /><View style={styles.heroDeco2} />
          <View style={styles.heroInner}>
            <View style={styles.circleWrap}>
              <View style={styles.circleOuter}>
                <View style={styles.circleInner}>
                  <Ionicons name="water" size={28} color={COLORS.water} style={{ marginBottom: 4 }} />
                  <Text style={styles.circleVal}>{todayWater}</Text>
                  <Text style={styles.circleUnit}>ml</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{goals.water_goal_ml}</Text>
                <Text style={styles.heroStatLbl}>Goal (ml)</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={[styles.heroStatVal, { color: remaining === 0 ? COLORS.success : COLORS.warning }]}>{remaining}</Text>
                <Text style={styles.heroStatLbl}>Remaining</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{glasses}</Text>
                <Text style={styles.heroStatLbl}>Glasses</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Daily Progress</Text>
              <Text style={[styles.progressPct, { color: COLORS.primary }]}>{pct}%</Text>
            </View>
            <ProgressBar progress={waterProgress} color={COLORS.primary} height={10} />
          </View>
          {remaining === 0 && (
            <View style={styles.goalBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.goalBadgeText}>Goal Reached! 🎉</Text>
            </View>
          )}
        </View>

        {/* PRESET QUICK ADD */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.presetGrid}>
          {WATER_PRESETS.map((p) => (
            <TouchableOpacity key={p.value} style={styles.presetBtn} onPress={() => handleAdd(p.value)} activeOpacity={0.75}>
              <Ionicons name="water" size={18} color={COLORS.primary} />
              <Text style={styles.presetLabel}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CUSTOM INPUT */}
        <Text style={styles.sectionTitle}>Custom Amount</Text>
        <View style={styles.customCard}>
          <View style={styles.customInputRow}>
            <View style={styles.customInputWrap}>
              <TextInput
                value={customAmount}
                onChangeText={(t) => { setCustomAmount(t); setInputError(''); }}
                placeholder="Amount in ml"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                style={styles.customInput}
              />
              <Text style={styles.mlBadge}>ml</Text>
            </View>
            <CustomButton label="Add" onPress={() => handleAdd(customAmount)} loading={loading} style={styles.addBtn} />
          </View>
          {inputError ? <Text style={styles.inputError}>{inputError}</Text> : null}
        </View>

        {/* HISTORY */}
        <Text style={styles.sectionTitle}>Today's Log</Text>
        {waterEntries.length === 0 ? (
          <EmptyState icon="water-outline" title="No entries yet" subtitle="Add your first water intake above" />
        ) : (
          <View style={styles.historyList}>
            {waterEntries.map((entry, idx) => (
              <View key={entry.id} style={[styles.historyItem, idx > 0 && styles.historyBorder]}>
                <View style={styles.historyIcon}>
                  <Ionicons name="water" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyAmount}>{entry.amount_ml} ml</Text>
                  <Text style={styles.historyTime}>
                    {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>+{entry.amount_ml}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  heroCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusXl, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden', gap: SIZES.md },
  heroDeco1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary + '10', top: -30, right: -20 },
  heroDeco2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '08', bottom: 10, left: -20 },
  heroInner: { flexDirection: 'row', alignItems: 'center', gap: SIZES.lg },
  circleWrap: { alignItems: 'center' },
  circleOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary + '50', justifyContent: 'center', alignItems: 'center' },
  circleInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  circleVal: { color: COLORS.textPrimary, fontSize: SIZES.fontXxl, fontWeight: '800', lineHeight: 28 },
  circleUnit: { color: COLORS.primary, fontSize: SIZES.fontXs, fontWeight: '600' },
  heroStats: { flex: 1, flexDirection: 'row', gap: 0 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '800' },
  heroStatLbl: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500', textAlign: 'center' },
  heroStatDiv: { width: 1, height: 28, backgroundColor: COLORS.surfaceBorder },
  progressSection: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '500' },
  progressPct: { fontSize: SIZES.fontSm, fontWeight: '800' },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary + '15', padding: SIZES.sm, borderRadius: SIZES.radiusMd },
  goalBadgeText: { color: COLORS.primary, fontSize: SIZES.fontSm, fontWeight: '700' },

  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700' },

  presetGrid: { flexDirection: 'row', gap: SIZES.sm },
  presetBtn: { flex: 1, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
  presetLabel: { color: COLORS.primary, fontSize: SIZES.fontSm, fontWeight: '700' },

  customCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  customInputRow: { flexDirection: 'row', gap: SIZES.sm, alignItems: 'center' },
  customInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusMd, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, paddingHorizontal: SIZES.md, overflow: 'hidden' },
  customInput: { flex: 1, color: COLORS.textPrimary, fontSize: SIZES.fontMd, paddingVertical: 11 },
  mlBadge: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '600' },
  addBtn: { paddingVertical: 12, paddingHorizontal: SIZES.lg },
  inputError: { color: COLORS.error, fontSize: SIZES.fontXs, marginTop: 6 },

  historyList: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  historyBorder: { borderTopWidth: 1, borderTopColor: COLORS.surfaceBorder },
  historyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  historyAmount: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '600' },
  historyTime: { color: COLORS.textMuted, fontSize: SIZES.fontXs },
  historyBadge: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  historyBadgeText: { color: COLORS.primary, fontSize: SIZES.fontXs, fontWeight: '700' },
  deleteBtn: { padding: 4 },
});

export default WaterTrackerScreen;
