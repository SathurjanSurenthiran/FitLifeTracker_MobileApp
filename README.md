# FitLife Tracker 🏋️

A personal wellness & fitness tracking mobile app built with **React Native (Expo Go)** and **SQLite** for persistent local storage.

---

##  Features

| Screen | Highlights |
|---|---|
| **Dashboard** | Daily score, metric cards, streak tracker, quick actions, motivational quote |
| **Water Tracker** | Preset buttons (250–1000ml), custom input, circular progress, daily log |
| **Calorie Tracker** | Add meals by category, per-category summaries, daily progress |
| **Workout Tracker** | Log sessions, stopwatch timer, countdown timer, calorie auto-estimate |
| **Progress / Analytics** | 7-day & 30-day line + bar charts for all three metrics, achievements |
| **Goals** | Editable water, calorie, and workout daily targets with live progress |
| **Reminders** | Local notifications: water interval, workout time, daily check-in |
| **Profile** | Name, age, height, weight, BMI calculator, fitness level |
| **Onboarding** | 3-slide intro shown once on first launch |
| **Splash Screen** | Animated logo shown during DB initialisation |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + **Expo SDK 51** |
| Navigation | `@react-navigation/native` + bottom-tabs + stack |
| Database | **`expo-sqlite`** (SQLite, persists across app kills & reboots) |
| Notifications | **`expo-notifications`** + `expo-device` |
| Charts | `react-native-chart-kit` + `react-native-svg` |
| Icons | `@expo/vector-icons` (Ionicons) |
| State | React Context API + `useReducer` |
| Date utils | `dayjs` |

---

## 🚀 Setup & Run

### Prerequisites

- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- **Expo Go** app on a physical Android or iOS device

### 1. Install dependencies

```bash
cd FitLifeTracker
npm install
```

### 2. Start the dev server

```bash
npx expo start
```

### 3. Run on device

1. Open **Expo Go** on your phone
2. Scan the QR code shown in the terminal
3. App will bundle and launch

> ⚠️ **Important:** Push/local notifications only work on **physical devices**, not simulators.

---

## 📁 Folder Structure

```
FitLifeTracker/
├── App.js                    # Root entry point (splash → onboarding → app)
├── app.json                  # Expo config
├── babel.config.js
├── package.json
└── src/
    ├── assets/               # Images, fonts (placeholder)
    ├── components/           # Reusable UI components
    │   ├── Card.js
    │   ├── CustomButton.js
    │   ├── EmptyState.js
    │   ├── InputField.js
    │   ├── LoadingSpinner.js
    │   ├── ProgressBar.js
    │   ├── SectionHeader.js
    │   ├── StatCard.js
    │   └── index.js
    ├── constants/
    │   └── index.js          # Colors, sizes, quotes, enums
    ├── context/
    │   └── AppContext.js     # Global state (Context + useReducer)
    ├── hooks/
    │   └── index.js          # useStopwatch, useCountdown, useAsyncData, ...
    ├── navigation/
    │   └── AppNavigator.js   # Bottom tabs + stack navigator
    ├── screens/
    │   ├── DashboardScreen.js
    │   ├── WaterTrackerScreen.js
    │   ├── CalorieTrackerScreen.js
    │   ├── WorkoutTrackerScreen.js
    │   ├── ProgressScreen.js
    │   ├── GoalsScreen.js
    │   ├── ReminderScreen.js
    │   ├── ProfileScreen.js
    │   ├── OnboardingScreen.js
    │   └── SplashScreen.js
    ├── services/
    │   ├── database.js       # All SQLite CRUD operations
    │   └── notifications.js  # expo-notifications scheduling
    ├── storage/
    │   └── asyncStorage.js   # AsyncStorage wrapper for preferences
    ├── styles/
    │   └── globalStyles.js   # Shared typography, card, shadow tokens
    └── utils/
        └── index.js          # BMI calc, date helpers, chart helpers, achievements
```

---

## 🗄 Database Schema (SQLite)

| Table | Key columns |
|---|---|
| `user_profile` | name, age, height, weight, fitness_level |
| `water_entries` | amount_ml, date |
| `calorie_entries` | meal_name, calories, category, date |
| `workout_entries` | workout_type, duration_min, calories_burned, notes, date |
| `goals` | water_goal_ml, calorie_goal, workout_goal_min |
| `notification_settings` | water_reminder, water_interval_min, workout_time, daily_time |
| `streaks` | water_streak, workout_streak, last dates |

All data persists across app kills and device reboots (SQLite WAL mode).

---

##  Device Features Used

- **Local Notifications** — repeating water reminders + daily workout/check-in alerts (works when app is closed)
- **SQLite Persistent Storage** — all fitness data survives app restart and device reboot
- **BMI Calculator** — real-time from height + weight inputs

---

## 🎨 UI Design

Dark navy theme (`#0A0E1A`) with teal/cyan accent (`#00D4C8`) inspired by modern fintech/health app design. All screens use consistent card-based layouts, progress bars, and icon rings.

---

## 🧪 Viva Voce Prep Notes

- **Context API** is used instead of Redux for simplicity — `AppContext.js` holds all global state and refresh helpers
- **SQLite** is initialised in `database.js` using `expo-sqlite`'s `openDatabaseAsync` with WAL journal mode for performance
- **Notifications** are scheduled via `expo-notifications` and survive app closure because they are OS-level alarms
- **BMI** is calculated with the formula: `weight(kg) / height(m)²`
- **Calorie estimation** uses MET (Metabolic Equivalent of Task) values per activity type
- **Streak tracking** compares today's date to `last_water_date` / `last_workout_date` stored in SQLite

---

## 📦 Build for Submission

Before zipping, remove heavy folders:

```bash
# Remove before zipping
rm -rf node_modules
rm -rf .expo
```

