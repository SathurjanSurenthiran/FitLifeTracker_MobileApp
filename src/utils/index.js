import dayjs from 'dayjs';

// BMI

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm === 0) return null;
  return (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  const val = parseFloat(bmi);
  if (isNaN(val)) return { label: 'Unknown', color: '#94A3B8' };
  if (val < 18.5) return { label: 'Underweight', color: '#38BDF8' };
  if (val < 25)   return { label: 'Normal',      color: '#10B981' };
  if (val < 30)   return { label: 'Overweight',  color: '#F59E0B' };
  return              { label: 'Obese',        color: '#EF4444' };
};

// Date

export const formatDate = (dateStr) => dayjs(dateStr).format('MMM D, YYYY');

export const formatTime = (dateStr) => dayjs(dateStr).format('h:mm A');

export const getRelativeDate = (dateStr) => {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  if (dateStr === today)     return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return dayjs(dateStr).format('MMM D');
};

export const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD'),
  );
};

export const getLast30Days = () => {
  return Array.from({ length: 30 }, (_, i) =>
    dayjs().subtract(29 - i, 'day').format('YYYY-MM-DD'),
  );
};

// Stopwatch

export const formatStopwatch = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

const pad = (n) => String(n).padStart(2, '0');

// Calories burned estimate
// MET-based rough estimate: calories = MET × weight(kg) × time(h)

const MET_VALUES = {
  Running: 9.8,
  Walking: 3.5,
  Cycling: 8.0,
  Swimming: 8.0,
  'Weight Training': 5.0,
  Yoga: 2.5,
  HIIT: 10.0,
  Pilates: 3.0,
  Boxing: 10.0,
  CrossFit: 10.0,
  Other: 5.0,
};

export const estimateCaloriesBurned = (workoutType, durationMin, weightKg = 70) => {
  const met = MET_VALUES[workoutType] || 5.0;
  return Math.round(met * weightKg * (durationMin / 60));
};

// Validation 

export const validatePositiveNumber = (val) => {
  const n = parseFloat(val);
  return !isNaN(n) && n > 0;
};

export const validateNonEmpty = (val) => {
  return typeof val === 'string' && val.trim().length > 0;
};

// Chart helpers 

/**
 * Fills in missing dates with 0 for chart display.
 * @param {Array} dbRows - rows from DB with {date, total}
 * @param {Array} allDates - full date range
 */
export const fillChartData = (dbRows, allDates) => {
  const map = {};
  dbRows.forEach((r) => { map[r.date] = r.total; });
  return allDates.map((d) => map[d] || 0);
};

export const getShortDayLabels = (dates) =>
  dates.map((d) => dayjs(d).format('ddd'));

// Achievement helpers

export const getAchievements = (streaks, totalWorkouts) => {
  const achievements = [];

  if (streaks.water_streak >= 3)  achievements.push({ icon: '💧', label: '3-Day Water Streak',   unlocked: true });
  if (streaks.water_streak >= 7)  achievements.push({ icon: '🌊', label: '7-Day Water Streak',   unlocked: true });
  if (streaks.water_streak >= 30) achievements.push({ icon: '🏆', label: '30-Day Water Streak',  unlocked: true });
  if (streaks.workout_streak >= 3) achievements.push({ icon: '🔥', label: '3-Day Workout Streak', unlocked: true });
  if (streaks.workout_streak >= 7) achievements.push({ icon: '⚡', label: '7-Day Workout Streak', unlocked: true });
  if (totalWorkouts >= 10)  achievements.push({ icon: '🎯', label: '10 Workouts Complete', unlocked: true });
  if (totalWorkouts >= 50)  achievements.push({ icon: '🥇', label: '50 Workouts Milestone', unlocked: true });
  if (totalWorkouts >= 100) achievements.push({ icon: '🏅', label: '100 Workouts Legend',  unlocked: true });

  return achievements;
};
