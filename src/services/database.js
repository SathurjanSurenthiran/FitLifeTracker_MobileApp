// expo-sqlite ~15.x  ·  Expo SDK 54
 
import * as SQLite from 'expo-sqlite';
 
let db = null;
 
// Open DB
export const openDatabase = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('fitlife.db');
  await initializeTables();
  return db;
};
 
// helper — ensures db is open before any query
const getDb = async () => {
  if (!db) await openDatabase();
  return db;
};
 
// Tables
const initializeTables = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
 
    CREATE TABLE IF NOT EXISTS user_profile (
      id            INTEGER PRIMARY KEY NOT NULL,
      name          TEXT    DEFAULT 'User',
      age           INTEGER DEFAULT 25,
      height        REAL    DEFAULT 170,
      weight        REAL    DEFAULT 70,
      fitness_level TEXT    DEFAULT 'Beginner',
      created_at    TEXT    DEFAULT (datetime('now')),
      updated_at    TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS water_entries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_ml  INTEGER NOT NULL,
      date       TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS calorie_entries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_name  TEXT    NOT NULL,
      calories   INTEGER NOT NULL,
      category   TEXT    NOT NULL,
      date       TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS workout_entries (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_type    TEXT    NOT NULL,
      duration_min    INTEGER NOT NULL,
      calories_burned INTEGER DEFAULT 0,
      notes           TEXT    DEFAULT '',
      date            TEXT    NOT NULL,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS goals (
      id               INTEGER PRIMARY KEY NOT NULL,
      water_goal_ml    INTEGER DEFAULT 2500,
      calorie_goal     INTEGER DEFAULT 2000,
      workout_goal_min INTEGER DEFAULT 30,
      updated_at       TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS notification_settings (
      id                 INTEGER PRIMARY KEY NOT NULL,
      water_reminder     INTEGER DEFAULT 1,
      water_interval_min INTEGER DEFAULT 60,
      workout_reminder   INTEGER DEFAULT 1,
      workout_time       TEXT    DEFAULT '07:00',
      daily_reminder     INTEGER DEFAULT 1,
      daily_time         TEXT    DEFAULT '08:00',
      updated_at         TEXT    DEFAULT (datetime('now'))
    );
 
    CREATE TABLE IF NOT EXISTS streaks (
      id                INTEGER PRIMARY KEY NOT NULL,
      water_streak      INTEGER DEFAULT 0,
      workout_streak    INTEGER DEFAULT 0,
      last_water_date   TEXT    DEFAULT '',
      last_workout_date TEXT    DEFAULT '',
      updated_at        TEXT    DEFAULT (datetime('now'))
    );
  `);
 
  await db.runAsync(`INSERT OR IGNORE INTO user_profile (id, name) VALUES (1, 'User')`);
  await db.runAsync(`INSERT OR IGNORE INTO goals (id) VALUES (1)`);
  await db.runAsync(`INSERT OR IGNORE INTO notification_settings (id) VALUES (1)`);
  await db.runAsync(`INSERT OR IGNORE INTO streaks (id) VALUES (1)`);
};
 
// User Profile
export const getProfile = async () => {
  const d = await getDb();
  return await d.getFirstAsync('SELECT * FROM user_profile WHERE id = 1');
};
 
export const updateProfile = async ({ name, age, height, weight, fitness_level }) => {
  const d = await getDb();
  await d.runAsync(
    `UPDATE user_profile SET name=?, age=?, height=?, weight=?, fitness_level=?, updated_at=datetime('now') WHERE id=1`,
    [name, age, height, weight, fitness_level]
  );
};
 
// Goals
export const getGoals = async () => {
  const d = await getDb();
  return await d.getFirstAsync('SELECT * FROM goals WHERE id = 1');
};
 
export const updateGoals = async ({ water_goal_ml, calorie_goal, workout_goal_min }) => {
  const d = await getDb();
  await d.runAsync(
    `UPDATE goals SET water_goal_ml=?, calorie_goal=?, workout_goal_min=?, updated_at=datetime('now') WHERE id=1`,
    [water_goal_ml, calorie_goal, workout_goal_min]
  );
};
 
// Water
export const addWaterEntry = async (amount_ml, date) => {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO water_entries (amount_ml, date) VALUES (?, ?)',
    [amount_ml, date]
  );
};
 
export const getWaterByDate = async (date) => {
  const d = await getDb();
  return await d.getAllAsync(
    'SELECT * FROM water_entries WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
};
 
export const getTotalWaterByDate = async (date) => {
  const d = await getDb();
  const result = await d.getFirstAsync(
    'SELECT SUM(amount_ml) as total FROM water_entries WHERE date = ?',
    [date]
  );
  return result?.total || 0;
};
 
export const deleteWaterEntry = async (id) => {
  const d = await getDb();
  await d.runAsync('DELETE FROM water_entries WHERE id = ?', [id]);
};
 
export const getWaterLast7Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(amount_ml) as total
    FROM water_entries
    WHERE date >= date('now', '-6 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
export const getWaterLast30Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(amount_ml) as total
    FROM water_entries
    WHERE date >= date('now', '-29 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
// Calories
export const addCalorieEntry = async (meal_name, calories, category, date) => {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO calorie_entries (meal_name, calories, category, date) VALUES (?, ?, ?, ?)',
    [meal_name, calories, category, date]
  );
};
 
export const getCaloriesByDate = async (date) => {
  const d = await getDb();
  return await d.getAllAsync(
    'SELECT * FROM calorie_entries WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
};
 
export const getTotalCaloriesByDate = async (date) => {
  const d = await getDb();
  const result = await d.getFirstAsync(
    'SELECT SUM(calories) as total FROM calorie_entries WHERE date = ?',
    [date]
  );
  return result?.total || 0;
};
 
export const deleteCalorieEntry = async (id) => {
  const d = await getDb();
  await d.runAsync('DELETE FROM calorie_entries WHERE id = ?', [id]);
};
 
export const getCaloriesLast7Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(calories) as total
    FROM calorie_entries
    WHERE date >= date('now', '-6 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
export const getCaloriesLast30Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(calories) as total
    FROM calorie_entries
    WHERE date >= date('now', '-29 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
// Workouts
export const addWorkoutEntry = async (workout_type, duration_min, calories_burned, notes, date) => {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO workout_entries (workout_type, duration_min, calories_burned, notes, date) VALUES (?, ?, ?, ?, ?)',
    [workout_type, duration_min, calories_burned, notes, date]
  );
};
 
export const getWorkoutsByDate = async (date) => {
  const d = await getDb();
  return await d.getAllAsync(
    'SELECT * FROM workout_entries WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
};
 
export const getTotalWorkoutMinByDate = async (date) => {
  const d = await getDb();
  const result = await d.getFirstAsync(
    'SELECT SUM(duration_min) as total FROM workout_entries WHERE date = ?',
    [date]
  );
  return result?.total || 0;
};
 
export const deleteWorkoutEntry = async (id) => {
  const d = await getDb();
  await d.runAsync('DELETE FROM workout_entries WHERE id = ?', [id]);
};
 
export const getWorkoutsLast7Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(duration_min) as total, COUNT(*) as count
    FROM workout_entries
    WHERE date >= date('now', '-6 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
export const getWorkoutsLast30Days = async () => {
  const d = await getDb();
  return await d.getAllAsync(`
    SELECT date, SUM(duration_min) as total, COUNT(*) as count
    FROM workout_entries
    WHERE date >= date('now', '-29 days')
    GROUP BY date ORDER BY date ASC
  `);
};
 
export const getTotalWorkoutCount = async () => {
  const d = await getDb();
  const result = await d.getFirstAsync('SELECT COUNT(*) as count FROM workout_entries');
  return result?.count || 0;
};
 
// Streaks
export const getStreaks = async () => {
  const d = await getDb();
  return await d.getFirstAsync('SELECT * FROM streaks WHERE id = 1');
};
 
export const updateStreaks = async ({ water_streak, workout_streak, last_water_date, last_workout_date }) => {
  const d = await getDb();
  await d.runAsync(
    `UPDATE streaks SET water_streak=?, workout_streak=?, last_water_date=?, last_workout_date=?, updated_at=datetime('now') WHERE id=1`,
    [water_streak, workout_streak, last_water_date, last_workout_date]
  );
};
 
// Notification Settings 
export const getNotificationSettings = async () => {
  const d = await getDb();
  return await d.getFirstAsync('SELECT * FROM notification_settings WHERE id = 1');
};
 
export const updateNotificationSettings = async ({ water_reminder, water_interval_min, workout_reminder, workout_time, daily_reminder, daily_time }) => {
  const d = await getDb();
  await d.runAsync(
    `UPDATE notification_settings SET water_reminder=?, water_interval_min=?, workout_reminder=?, workout_time=?, daily_reminder=?, daily_time=?, updated_at=datetime('now') WHERE id=1`,
    [water_reminder ? 1 : 0, water_interval_min, workout_reminder ? 1 : 0, workout_time, daily_reminder ? 1 : 0, daily_time]
  );
};
 