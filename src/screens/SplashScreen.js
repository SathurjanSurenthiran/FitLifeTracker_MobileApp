import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const SplashScreen = () => {
  const scaleAnim  = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      // Pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Background decorations */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />
      <View style={styles.deco3} />

      <Animated.View style={[styles.logoWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <Animated.View style={[styles.logoRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoCircle}>
            <Ionicons name="fitness" size={56} color={COLORS.primary} />
          </View>
        </Animated.View>

        <Text style={styles.appName}>FitLife</Text>
        <Text style={styles.tagline}>Your Personal Wellness Companion</Text>

        {/* Loading dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} style={[styles.loadDot, { opacity: opacityAnim }]} />
          ))}
        </View>
      </Animated.View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deco1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.primary + '08', top: -80, right: -80,
  },
  deco2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.primary + '06', bottom: 40, left: -60,
  },
  deco3: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.workout + '06', top: 120, left: 20,
  },

  logoWrap: { alignItems: 'center', gap: SIZES.sm },
  logoRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2, borderColor: COLORS.primary + '40',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center', alignItems: 'center',
  },

  appName: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: SIZES.xs + 2,
    marginTop: SIZES.lg,
  },
  loadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  version: {
    position: 'absolute',
    bottom: 40,
    color: COLORS.textMuted,
    fontSize: SIZES.fontXs,
  },
});

export default SplashScreen;
