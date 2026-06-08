import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { ProgressBar, LoadingSpinner } from '../components';
import { COLORS, SIZES, MOTIVATIONAL_QUOTES } from '../constants';

const { width: W } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { isLoading, profile, today, todayWater, goals, waterProgress, todayCalories, calorieProgress, todayWorkoutMin, workoutProgress, dailyScore, streaks } = useApp();

  const quote = useMemo(() => MOTIVATIONAL_QUOTES[new Date(today).getDate() % MOTIVATIONAL_QUOTES.length], [today]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (isLoading) return <LoadingSpinner message="Loading FitLife..." />;

  const scoreColor = dailyScore >= 80 ? COLORS.success : dailyScore >= 50 ? COLORS.warning : COLORS.error;

  const QUICK_ACTIONS = [
    { icon: 'water', label: 'Water', screen: 'WaterTracker',   color: COLORS.water },
    { icon: 'restaurant', label: 'Meals', screen: 'CalorieTracker', color: COLORS.calorie },
    { icon: 'barbell', label: 'Workout', screen: 'WorkoutTracker', color: COLORS.workout },
    { icon: 'bar-chart', label: 'Analytics', screen: 'Progress',  color: COLORS.progress },
    { icon: 'flag', label: 'Goals', screen: 'Goals',    color: COLORS.primary },
    { icon: 'notifications', label: 'Reminders', screen: 'Reminders', color: '#7EB8FF' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.nameText}>{profile?.name || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Reminders')}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* HERO SCORE CARD (teal card like reference) */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardInner}>
            {/* Decorative circles */}
            <View style={styles.heroDeco1} />
            <View style={styles.heroDeco2} />

            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroLabel}>Daily Fitness Score</Text>
                <Text style={styles.heroScore}>{dailyScore}</Text>
                <Text style={styles.heroScoreLabel}>out of 100</Text>
              </View>
              <View style={styles.heroRight}>
                <View style={styles.scoreRing}>
                  <Text style={styles.scoreRingPct}>{dailyScore}%</Text>
                </View>
              </View>
            </View>

            {/* Progress indicators */}
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{todayWater}ml</Text>
                <Text style={styles.heroStatLabel}>Water</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{todayCalories}kcal</Text>
                <Text style={styles.heroStatLabel}>Calories</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatVal}>{todayWorkoutMin}min</Text>
                <Text style={styles.heroStatLabel}>Workout</Text>
              </View>
            </View>
          </View>
        </View>

        {/* METRIC CARDS (2-column grid) */}
        <View style={styles.metricsGrid}>
          {[
            { icon: 'water', label: 'Hydration', val: todayWater, unit: 'ml', goal: goals.water_goal_ml, pct: waterProgress, color: COLORS.water, screen: 'WaterTracker' },
            { icon: 'flame', label: 'Calories', val: todayCalories, unit: 'kcal', goal: goals.calorie_goal, pct: calorieProgress, color: COLORS.calorie, screen: 'CalorieTracker' },
            { icon: 'barbell', label: 'Workout', val: todayWorkoutMin, unit: 'min', goal: goals.workout_goal_min, pct: workoutProgress, color: COLORS.workout, screen: 'WorkoutTracker' },
            { icon: 'trending-up', label: 'Score', val: dailyScore, unit: 'pts', goal: 100, pct: dailyScore, color: COLORS.progress, screen: 'Progress' },
          ].map((m) => (
            <TouchableOpacity key={m.screen} style={styles.metricCard} onPress={() => navigation.navigate(m.screen)} activeOpacity={0.8}>
              <View style={styles.metricCardTop}>
                <View style={[styles.metricIconWrap, { backgroundColor: m.color + '20' }]}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
              <Text style={styles.metricVal}>{m.val}<Text style={styles.metricUnit}> {m.unit}</Text></Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <ProgressBar progress={m.pct} color={m.color} height={4} style={{ marginTop: 8 }} />
              <Text style={[styles.metricGoal, { color: m.color }]}>{Math.round(m.pct)}% of {m.goal}{m.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STREAK ROW */}
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, { borderColor: COLORS.water + '40' }]}>
            <Text style={styles.streakEmoji}>💧</Text>
            <Text style={[styles.streakNum, { color: COLORS.water }]}>{streaks?.water_streak || 0}</Text>
            <Text style={styles.streakLbl}>Water Streak</Text>
          </View>
          <View style={[styles.streakCard, { borderColor: COLORS.workout + '40' }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakNum, { color: COLORS.workout }]}>{streaks?.workout_streak || 0}</Text>
            <Text style={styles.streakLbl}>Workout Streak</Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity key={a.screen} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75}>
              <View style={[styles.actionIconWrap, { backgroundColor: a.color + '20', borderColor: a.color + '40' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* QUOTE CARD */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SIZES.md, paddingTop: SIZES.md, paddingBottom: 100, gap: SIZES.md },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0A0E1A', fontSize: SIZES.fontLg, fontWeight: '800' },
  greetingText: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontWeight: '500' },
  nameText: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700' },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.surfaceBorder },

  // Hero card – teal gradient matching reference
  heroCard: { borderRadius: SIZES.radiusXl, overflow: 'hidden' },
  heroCardInner: { backgroundColor: COLORS.primary, padding: SIZES.lg, borderRadius: SIZES.radiusXl, overflow: 'hidden', minHeight: 160 },
  heroDeco1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#ffffff18', top: -40, right: -30 },
  heroDeco2: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#ffffff12', bottom: -20, right: 60 },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.md },
  heroLabel: { color: '#0A0E1A99', fontSize: SIZES.fontSm, fontWeight: '600', marginBottom: 2 },
  heroScore: { color: '#0A0E1A', fontSize: SIZES.fontHero, fontWeight: '900', lineHeight: 56 },
  heroScoreLabel: { color: '#0A0E1A80', fontSize: SIZES.fontXs, fontWeight: '600' },
  heroRight: { alignItems: 'center', justifyContent: 'center' },
  scoreRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#0A0E1A30', backgroundColor: '#0A0E1A20', justifyContent: 'center', alignItems: 'center' },
  scoreRingPct: { color: '#0A0E1A', fontSize: SIZES.fontLg, fontWeight: '800' },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0A0E1A15', borderRadius: SIZES.radiusMd, padding: SIZES.sm },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { color: '#0A0E1A', fontSize: SIZES.fontSm, fontWeight: '800' },
  heroStatLabel: { color: '#0A0E1A70', fontSize: 10, fontWeight: '500' },
  heroStatDivider: { width: 1, backgroundColor: '#0A0E1A25', height: 28 },

  // Metric cards grid
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  metricCard: {
    width: (W - SIZES.md * 2 - SIZES.sm) / 2,
    backgroundColor: COLORS.surfaceMid,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 4,
  },
  metricCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  metricIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  metricVal: { color: COLORS.textPrimary, fontSize: SIZES.fontXxl, fontWeight: '800' },
  metricUnit: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '400' },
  metricLabel: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontWeight: '500' },
  metricGoal: { fontSize: 10, fontWeight: '600', marginTop: 3 },

  // Streaks
  streakRow: { flexDirection: 'row', gap: SIZES.sm },
  streakCard: { flex: 1, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, alignItems: 'center', gap: 4, borderWidth: 1 },
  streakEmoji: { fontSize: 24 },
  streakNum: { fontSize: SIZES.fontXxl, fontWeight: '900' },
  streakLbl: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontWeight: '500' },

  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700', letterSpacing: 0.2 },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  actionCard: {
    width: (W - SIZES.md * 2 - SIZES.sm * 2) / 3,
    backgroundColor: COLORS.surfaceMid,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.sm + 2,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  actionLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, fontWeight: '500' },

  // Quote
  quoteCard: { flexDirection: 'row', backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, gap: SIZES.sm, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  quoteAccent: { width: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  quoteText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { color: COLORS.primary, fontSize: SIZES.fontXs, fontWeight: '600', marginTop: 4 },
});

export default DashboardScreen;
