// Bottom tab + stack navigation using React Navigation v6

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen    from '../screens/DashboardScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import WorkoutTrackerScreen from '../screens/WorkoutTrackerScreen';
import ProgressScreen     from '../screens/ProgressScreen';
import GoalsScreen        from '../screens/GoalsScreen';
import ReminderScreen     from '../screens/ReminderScreen';
import ProfileScreen      from '../screens/ProfileScreen';

import { COLORS, SIZES } from '../constants';

const Tab  = createBottomTabNavigator();
const Stack = createStackNavigator();

// Shared header style 

const SCREEN_OPTIONS = {
  headerStyle: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    elevation: 0,
    shadowOpacity: 0,
    height: Platform.OS === 'ios' ? 96 : 62,
  },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: COLORS.background },
};

// Individual screen tab configs 

const TAB_SCREENS = [
  {
    name: 'Dashboard',
    component: DashboardScreen,
    icon: 'home',
    label: 'Home',
    headerTitle: 'FitLife',
    showHeaderRight: true,
  },
  {
    name: 'WaterTracker',
    component: WaterTrackerScreen,
    icon: 'water',
    label: 'Water',
    headerTitle: 'Water Tracker',
  },
  {
    name: 'CalorieTracker',
    component: CalorieTrackerScreen,
    icon: 'restaurant',
    label: 'Calories',
    headerTitle: 'Calorie Tracker',
  },
  {
    name: 'WorkoutTracker',
    component: WorkoutTrackerScreen,
    icon: 'barbell',
    label: 'Workout',
    headerTitle: 'Workout Tracker',
  },
  {
    name: 'Progress',
    component: ProgressScreen,
    icon: 'bar-chart',
    label: 'Progress',
    headerTitle: 'Analytics',
  },
];

// Custom tab bar icon 

const TabIcon = ({ name, focused, size }) => {
  const color = focused ? COLORS.primary : COLORS.textMuted;
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
    </View>
  );
};

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusSm,
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary + '20',
  },
});

// Bottom Tab Navigator 

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      ...SCREEN_OPTIONS,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceBorder,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 25 : 8,
        paddingTop: 8,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
      },
      tabBarIcon: ({ focused, size }) => (
        <TabIcon name={route.name === 'CalorieTracker' ? 'restaurant' :
                       route.name === 'WaterTracker'   ? 'water'      :
                       route.name === 'WorkoutTracker' ? 'barbell'    :
                       route.name === 'Progress'       ? 'bar-chart'  : 'home'}
          focused={focused} size={size - 2} />
      ),
    })}
  >
    {TAB_SCREENS.map(screen => (
      <Tab.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
        options={{
          tabBarLabel: screen.label,
          headerTitle: screen.headerTitle,
          headerRight: screen.showHeaderRight
            ? () => (
                <View style={headerStyles.rightWrap}>
                  <Text style={headerStyles.appBadge}>FitLife</Text>
                </View>
              )
            : undefined,
        }}
      />
    ))}
  </Tab.Navigator>
);

// Root Stack (tabs + modal screens)

const AppNavigator = () => (
  <NavigationContainer
    theme={{
      dark: true,
      colors: {
        primary: COLORS.primary,
        background: COLORS.background,
        card: COLORS.surface,
        text: COLORS.textPrimary,
        border: COLORS.surfaceBorder,
        notification: COLORS.primary,
      },
    }}
  >
    <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
      {/* Main tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Extra screens accessible from tab nav */}
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ headerTitle: 'Goals & Targets' }}
      />
      <Stack.Screen
        name="Reminders"
        component={ReminderScreen}
        options={{ headerTitle: 'Reminders' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerTitle: 'My Profile' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const headerStyles = StyleSheet.create({
  rightWrap: {
    marginRight: SIZES.md,
  },
  appBadge: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: '800',
    letterSpacing: 0.5,
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
});

export default AppNavigator;
