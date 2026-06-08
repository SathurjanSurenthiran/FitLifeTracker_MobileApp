import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getWaterLast7Days, getWaterLast30Days, getCaloriesLast7Days, getCaloriesLast30Days, getWorkoutsLast7Days, getWorkoutsLast30Days, getTotalWorkoutCount } from '../services/database';
import { LoadingSpinner } from '../components';
import { COLORS, SIZES } from '../constants';
import { getLast7Days, getLast30Days, fillChartData, getShortDayLabels, getAchievements } from '../utils';

const { width: W } = Dimensions.get('window');
const CHART_W = W - SIZES.md * 2 - SIZES.md * 2;

const mkChartCfg = (color) => ({
  backgroundGradientFrom: COLORS.surfaceMid,
  backgroundGradientTo: COLORS.surfaceMid,
  backgroundGradientFromOpacity: 1,
  backgroundGradientToOpacity: 1,
  decimalPlaces: 0,
  color: (opacity = 1) => color + Math.round(opacity * 200).toString(16).padStart(2, '0'),
  labelColor: () => COLORS.textMuted,
  propsForDots: { r: '4', strokeWidth: '2', stroke: color },
  propsForBackgroundLines: { stroke: COLORS.surfaceBorder, strokeDasharray: '' },
  fillShadowGradient: color,
  fillShadowGradientOpacity: 0.15,
});

const ProgressScreen = () => {
  const { streaks, goals } = useApp();
  const [period, setPeriod] = useState('7');
  const [chartData, setChartData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const is7 = period === '7';
      const allDates = is7 ? getLast7Days() : getLast30Days();
      const [wRows, cRows, woRows, totalWo] = await Promise.all([
        is7 ? getWaterLast7Days() : getWaterLast30Days(),
        is7 ? getCaloriesLast7Days() : getCaloriesLast30Days(),
        is7 ? getWorkoutsLast7Days() : getWorkoutsLast30Days(),
        getTotalWorkoutCount(),
      ]);
      const labels = is7 ? getShortDayLabels(allDates) : allDates.map((d, i) => i % 6 === 0 ? new Date(d).getDate().toString() : '');
      setChartData({
        water: fillChartData(wRows, allDates),
        calorie: fillChartData(cRows, allDates),
        workout: fillChartData(woRows, allDates),
        labels,
      });
      setAchievements(getAchievements(streaks, totalWo));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading || !chartData) return <LoadingSpinner message="Crunching your data..." />;

  const safeData = (arr) => arr.every(v => v === 0) ? [0, 0] : arr;

  const avg = (arr) => { const nonZero = arr.filter(Boolean); return nonZero.length ? Math.round(nonZero.reduce((a,b) => a+b, 0) / nonZero.length) : 0; };
  const sum = (arr) => arr.reduce((a,b) => a+b, 0);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* PERIOD TOGGLE */}
        <View style={styles.toggle}>
          {['7', '30'].map(p => (
            <TouchableOpacity key={p} style={[styles.toggleBtn, period === p && styles.toggleBtnActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.toggleLabel, period === p && styles.toggleLabelActive]}>
                {p === '7' ? 'Week' : 'Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUMMARY MINI CARDS */}
        <View style={styles.miniCards}>
          {[
            { label: 'Avg Water', val: avg(chartData.water), unit: 'ml', color: COLORS.water, icon: 'water' },
            { label: 'Avg Cal', val: avg(chartData.calorie), unit: 'kcal', color: COLORS.calorie, icon: 'flame' },
            { label: 'Total Workout', val: sum(chartData.workout), unit: 'min', color: COLORS.workout, icon: 'barbell' },
          ].map(m => (
            <View key={m.label} style={styles.miniCard}>
              <View style={[styles.miniIcon, { backgroundColor: m.color + '20' }]}>
                <Ionicons name={m.icon} size={16} color={m.color} />
              </View>
              <Text style={[styles.miniVal, { color: m.color }]}>{m.val}</Text>
              <Text style={styles.miniUnit}>{m.unit}</Text>
              <Text style={styles.miniLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* WATER CHART */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={[styles.chartDot, { backgroundColor: COLORS.water }]} />
            <Text style={styles.chartTitle}>Water Intake</Text>
            <Text style={[styles.chartAvg, { color: COLORS.water }]}>{avg(chartData.water)} ml avg</Text>
          </View>
          <View style={styles.chartCard}>
            <LineChart
              data={{ labels: chartData.labels, datasets: [{ data: safeData(chartData.water) }] }}
              width={CHART_W} height={170} chartConfig={mkChartCfg(COLORS.water)} bezier
              style={styles.chart} withHorizontalLines withVerticalLines={false} withDots withShadow
            />
          </View>
        </View>

        {/* CALORIE CHART */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={[styles.chartDot, { backgroundColor: COLORS.calorie }]} />
            <Text style={styles.chartTitle}>Calorie Intake</Text>
            <Text style={[styles.chartAvg, { color: COLORS.calorie }]}>{avg(chartData.calorie)} kcal avg</Text>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: chartData.labels, datasets: [{ data: safeData(chartData.calorie) }] }}
              width={CHART_W} height={170} chartConfig={mkChartCfg(COLORS.calorie)}
              style={styles.chart} withHorizontalLabels withInnerLines showValuesOnTopOfBars={false}
            />
          </View>
        </View>

        {/* WORKOUT CHART */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View style={[styles.chartDot, { backgroundColor: COLORS.workout }]} />
            <Text style={styles.chartTitle}>Workout Duration</Text>
            <Text style={[styles.chartAvg, { color: COLORS.workout }]}>{sum(chartData.workout)} min total</Text>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: chartData.labels, datasets: [{ data: safeData(chartData.workout) }] }}
              width={CHART_W} height={170} chartConfig={mkChartCfg(COLORS.workout)}
              style={styles.chart} withHorizontalLabels withInnerLines showValuesOnTopOfBars={false}
            />
          </View>
        </View>

        {/* STREAKS */}
        <View style={styles.streakCards}>
          {[
            { label: 'Water Streak', val: streaks?.water_streak || 0, icon: '💧', color: COLORS.water },
            { label: 'Workout Streak', val: streaks?.workout_streak || 0, icon: '🔥', color: COLORS.workout },
          ].map(s => (
            <View key={s.label} style={[styles.streakCard, { borderColor: s.color + '30' }]}>
              <Text style={styles.streakEmoji}>{s.icon}</Text>
              <Text style={[styles.streakNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.streakLbl}>{s.label}</Text>
              <Text style={styles.streakDays}>days</Text>
            </View>
          ))}
        </View>

        {/* ACHIEVEMENTS */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.length === 0 ? (
          <View style={styles.noAchCard}>
            <Text style={styles.noAchText}>🏅 Keep going — achievements unlock as you build streaks!</Text>
          </View>
        ) : (
          <View style={styles.achGrid}>
            {achievements.map((a, i) => (
              <View key={i} style={styles.achCard}>
                <Text style={styles.achEmoji}>{a.icon}</Text>
                <Text style={styles.achLabel}>{a.label}</Text>
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

  toggle: { flexDirection: 'row', backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusMd, padding: 4, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  toggleBtn: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderRadius: SIZES.radiusSm },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleLabel: { color: COLORS.textMuted, fontSize: SIZES.fontMd, fontWeight: '600' },
  toggleLabelActive: { color: '#0A0E1A', fontWeight: '700' },

  miniCards: { flexDirection: 'row', gap: SIZES.sm },
  miniCard: { flex: 1, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.sm + 2, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  miniIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 3 },
  miniVal: { fontSize: SIZES.fontXl, fontWeight: '800' },
  miniUnit: { color: COLORS.textMuted, fontSize: 10 },
  miniLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '500', textAlign: 'center' },

  chartSection: { gap: SIZES.sm },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  chartDot: { width: 10, height: 10, borderRadius: 5 },
  chartTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700', flex: 1 },
  chartAvg: { fontSize: SIZES.fontSm, fontWeight: '700' },
  chartCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder, overflow: 'hidden' },
  chart: { borderRadius: SIZES.radiusMd, marginLeft: -SIZES.sm },

  streakCards: { flexDirection: 'row', gap: SIZES.sm },
  streakCard: { flex: 1, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, alignItems: 'center', gap: 3, borderWidth: 1 },
  streakEmoji: { fontSize: 28 },
  streakNum: { fontSize: 36, fontWeight: '900', lineHeight: 44 },
  streakLbl: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '600' },
  streakDays: { color: COLORS.textMuted, fontSize: SIZES.fontXs },

  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700' },
  noAchCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.lg, borderWidth: 1, borderColor: COLORS.surfaceBorder, alignItems: 'center' },
  noAchText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, textAlign: 'center', lineHeight: 22 },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  achCard: { width: '48%', backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, alignItems: 'center', gap: SIZES.xs, borderWidth: 1, borderColor: COLORS.primary + '30' },
  achEmoji: { fontSize: 30 },
  achLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, textAlign: 'center', fontWeight: '600' },
});

export default ProgressScreen;
