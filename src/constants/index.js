// Dark Navy + Teal/Cyan theme 

export const COLORS = {
  // Core brand
  primary: '#61a09d',         // Teal cyan
  primaryDark: '#02867d',
  primaryLight: '#61f1ec',
  primaryGlow: '#00D4C820',

  // Secondary accent
  accent: '#00FFD1',          // Bright mint
  accentDark: '#00C9A7',

  // Backgrounds (dark navy layers)
  background: '#0A0E1A',      // Deep navy
  surface: '#111827',         // Card surface
  surfaceMid: '#161D2E',      // Mid layer
  surfaceLight: '#1E2940',    // Elevated card
  surfaceBorder: '#243050',   // Border / divider

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B9CC8',
  textMuted: '#4B5E8A',
  textDim: '#2E3F6B',

  // Metric colors
  water: '#00D4C8',
  waterGlow: '#00D4C830',
  calorie: '#FF6B6B',
  calorieGlow: '#FF6B6B25',
  workout: '#FFB347',
  workoutGlow: '#FFB34725',
  progress: '#A78BFA',
  progressGlow: '#A78BFA25',

  // Status
  success: '#00D4C8',
  warning: '#FFB347',
  error: '#FF6B6B',
  info: '#7EB8FF',

  // Gradient arrays
  gradientCard:     ['#00D4C8', '#0099B4'],
  gradientWater:    ['#00D4C8', '#0099B4'],
  gradientCalorie:  ['#FF6B6B', '#FF4040'],
  gradientWorkout:  ['#FFB347', '#FF8C00'],
  gradientDark:     ['#161D2E', '#0A0E1A'],
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusXs: 6,
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 18,
  radiusXl: 24,
  radiusXxl: 32,
  radiusFull: 999,

  // Font sizes
  fontXs: 11,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 20,
  fontXxl: 26,
  fontDisplay: 38,
  fontHero: 48,

  // Icons
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
};

export const MOTIVATIONAL_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "Don't wish for it. Work for it.", author: "Unknown" },
  { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Dream it. Believe it. Build it.", author: "Unknown" },
];

export const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export const WORKOUT_TYPES = [
  'Running', 'Walking', 'Cycling', 'Swimming', 'Weight Training',
  'Yoga', 'HIIT', 'Pilates', 'Boxing', 'CrossFit', 'Other',
];

export const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete'];

export const WATER_PRESETS = [
  { label: '250ml', value: 250 },
  { label: '500ml', value: 500 },
  { label: '750ml', value: 750 },
  { label: '1000ml', value: 1000 },
];

export const ACHIEVEMENT_THRESHOLDS = {
  waterStreak: [3, 7, 14, 30],
  workoutStreak: [3, 7, 14, 30],
  totalWorkouts: [10, 25, 50, 100],
};
