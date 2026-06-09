// Global state management using React Context API + useReducer

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  openDatabase,
  getProfile,
  getGoals,
  getTotalWaterByDate,
  getWaterByDate,
  getTotalCaloriesByDate,
  getCaloriesByDate,
  getTotalWorkoutMinByDate,
  getWorkoutsByDate,
  getStreaks,
  getNotificationSettings,
  updateStreaks,
} from '../services/database';

// Initial State

const initialState = {
  isLoading: true,
  today: dayjs().format('YYYY-MM-DD'),

  // Profile
  profile: null,

  // Goals
  goals: {
    water_goal_ml: 2500,
    calorie_goal: 2000,
    workout_goal_min: 30,
  },

  // Today's data
  todayWater: 0,
  waterEntries: [],
  todayCalories: 0,
  calorieEntries: [],
  todayWorkoutMin: 0,
  workoutEntries: [],

  // Streaks
  streaks: { water_streak: 0, workout_streak: 0 },

  // Notification settings
  notificationSettings: null,

  // UI
  error: null,
};

// Reducer 

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_PROFILE':
      return { ...state, profile: action.payload };

    case 'SET_GOALS':
      return { ...state, goals: action.payload };

    case 'SET_TODAY_WATER':
      return { ...state, todayWater: action.payload };

    case 'SET_WATER_ENTRIES':
      return { ...state, waterEntries: action.payload };

    case 'SET_TODAY_CALORIES':
      return { ...state, todayCalories: action.payload };

    case 'SET_CALORIE_ENTRIES':
      return { ...state, calorieEntries: action.payload };

    case 'SET_TODAY_WORKOUT':
      return { ...state, todayWorkoutMin: action.payload };

    case 'SET_WORKOUT_ENTRIES':
      return { ...state, workoutEntries: action.payload };

    case 'SET_STREAKS':
      return { ...state, streaks: action.payload };

    case 'SET_NOTIFICATION_SETTINGS':
      return { ...state, notificationSettings: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'INIT_COMPLETE':
      return {
        ...state,
        profile: action.payload.profile,
        goals: action.payload.goals,
        todayWater: action.payload.todayWater,
        waterEntries: action.payload.waterEntries,
        todayCalories: action.payload.todayCalories,
        calorieEntries: action.payload.calorieEntries,
        todayWorkoutMin: action.payload.todayWorkoutMin,
        workoutEntries: action.payload.workoutEntries,
        streaks: action.payload.streaks,
        notificationSettings: action.payload.notificationSettings,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Context 

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const today = dayjs().format('YYYY-MM-DD');

  // Bootstrap

  const initApp = useCallback(async () => {
    try {
      await openDatabase();

      const [
        profile,
        goals,
        todayWater,
        waterEntries,
        todayCalories,
        calorieEntries,
        todayWorkoutMin,
        workoutEntries,
        streaks,
        notificationSettings,
      ] = await Promise.all([
        getProfile(),
        getGoals(),
        getTotalWaterByDate(today),
        getWaterByDate(today),
        getTotalCaloriesByDate(today),
        getCaloriesByDate(today),
        getTotalWorkoutMinByDate(today),
        getWorkoutsByDate(today),
        getStreaks(),
        getNotificationSettings(),
      ]);

      dispatch({
        type: 'INIT_COMPLETE',
        payload: {
          profile,
          goals,
          todayWater,
          waterEntries,
          todayCalories,
          calorieEntries,
          todayWorkoutMin,
          workoutEntries,
          streaks,
          notificationSettings,
        },
      });
    } catch (err) {
      console.error('App init error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [today]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Refresh helpers 

  const refreshWater = useCallback(async () => {
    const [total, entries] = await Promise.all([
      getTotalWaterByDate(today),
      getWaterByDate(today),
    ]);
    dispatch({ type: 'SET_TODAY_WATER', payload: total });
    dispatch({ type: 'SET_WATER_ENTRIES', payload: entries });

    // Update water streak
    const streaks = await getStreaks();
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    let newStreak = streaks.water_streak;

    if (streaks.last_water_date === yesterday) {
      newStreak += 1;
    } else if (streaks.last_water_date !== today) {
      newStreak = 1;
    }

    const updatedStreaks = {
      ...streaks,
      water_streak: newStreak,
      last_water_date: today,
    };
    await updateStreaks(updatedStreaks);
    dispatch({ type: 'SET_STREAKS', payload: updatedStreaks });
  }, [today]);

  const refreshCalories = useCallback(async () => {
    const [total, entries] = await Promise.all([
      getTotalCaloriesByDate(today),
      getCaloriesByDate(today),
    ]);
    dispatch({ type: 'SET_TODAY_CALORIES', payload: total });
    dispatch({ type: 'SET_CALORIE_ENTRIES', payload: entries });
  }, [today]);

  const refreshWorkouts = useCallback(async () => {
    const [total, entries] = await Promise.all([
      getTotalWorkoutMinByDate(today),
      getWorkoutsByDate(today),
    ]);
    dispatch({ type: 'SET_TODAY_WORKOUT', payload: total });
    dispatch({ type: 'SET_WORKOUT_ENTRIES', payload: entries });

    // Update workout streak
    const streaks = await getStreaks();
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    let newStreak = streaks.workout_streak;

    if (streaks.last_workout_date === yesterday) {
      newStreak += 1;
    } else if (streaks.last_workout_date !== today) {
      newStreak = 1;
    }

    const updatedStreaks = {
      ...streaks,
      workout_streak: newStreak,
      last_workout_date: today,
    };
    await updateStreaks(updatedStreaks);
    dispatch({ type: 'SET_STREAKS', payload: updatedStreaks });
  }, [today]);

  const refreshProfile = useCallback(async () => {
    const profile = await getProfile();
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const refreshGoals = useCallback(async () => {
    const goals = await getGoals();
    dispatch({ type: 'SET_GOALS', payload: goals });
  }, []);

  const refreshNotificationSettings = useCallback(async () => {
    const settings = await getNotificationSettings();
    dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: settings });
  }, []);

  // Computed values 

  const waterProgress = state.goals.water_goal_ml > 0
    ? Math.min((state.todayWater / state.goals.water_goal_ml) * 100, 100)
    : 0;

  const calorieProgress = state.goals.calorie_goal > 0
    ? Math.min((state.todayCalories / state.goals.calorie_goal) * 100, 100)
    : 0;

  const workoutProgress = state.goals.workout_goal_min > 0
    ? Math.min((state.todayWorkoutMin / state.goals.workout_goal_min) * 100, 100)
    : 0;

  // Daily fitness score (0-100) = avg of three progress values
  const dailyScore = Math.round((waterProgress + calorieProgress + workoutProgress) / 3);

  const bmi = state.profile
    ? (state.profile.weight / Math.pow(state.profile.height / 100, 2)).toFixed(1)
    : null;

  const value = {
    ...state,
    today,
    waterProgress,
    calorieProgress,
    workoutProgress,
    dailyScore,
    bmi,
    dispatch,
    initApp,
    refreshWater,
    refreshCalories,
    refreshWorkouts,
    refreshProfile,
    refreshGoals,
    refreshNotificationSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
