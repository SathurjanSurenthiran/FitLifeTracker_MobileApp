// First-launch onboarding with 3 slides

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'fitness',
    iconColor: COLORS.primary,
    bgAccent: COLORS.primary,
    title: 'Track Your\nFitness Journey',
    subtitle: 'Monitor water intake, calories, workouts, and progress — all in one beautiful app.',
  },
  {
    id: '2',
    icon: 'bar-chart',
    iconColor: COLORS.workout,
    bgAccent: COLORS.workout,
    title: 'Visualise\nYour Progress',
    subtitle: 'Weekly and monthly charts show exactly how you\'re improving toward your goals.',
  },
  {
    id: '3',
    icon: 'notifications',
    iconColor: COLORS.calorie,
    bgAccent: COLORS.calorie,
    title: 'Smart\nReminders',
    subtitle: 'Get nudged to drink water and hit your daily workout — even when the app is closed.',
  },
];

const OnboardingScreen = ({ onDone }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onDone();
    }
  };

  const skip = () => onDone();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.id}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Large decorative circle */}
            <View style={[styles.deco, { backgroundColor: item.bgAccent + '12' }]} />
            <View style={[styles.decoSm, { backgroundColor: item.bgAccent + '08' }]} />

            {/* Icon blob */}
            <View style={[styles.iconBlob, { backgroundColor: item.bgAccent + '20', borderColor: item.bgAccent + '40' }]}>
              <View style={[styles.iconInner, { backgroundColor: item.bgAccent + '30' }]}>
                <Ionicons name={item.icon} size={60} color={item.iconColor} />
              </View>
            </View>

            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex
                  ? { width: 24, backgroundColor: COLORS.primary }
                  : { backgroundColor: COLORS.surfaceLight },
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity style={styles.ctaBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.ctaLabel}>
            {activeIndex === SLIDES.length - 1 ? "Let's Go! 🚀" : 'Next'}
          </Text>
          <View style={styles.ctaArrow}>
            <Ionicons
              name={activeIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="#0A0E1A"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: SIZES.lg,
    zIndex: 10,
    paddingHorizontal: SIZES.sm + 4,
    paddingVertical: SIZES.xs + 2,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },

  slide: {
    width: W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
    paddingTop: 100,
    gap: SIZES.lg,
    position: 'relative',
  },
  deco: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -60,
    right: -80,
  },
  decoSm: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 60,
    left: -50,
  },

  iconBlob: {
    width: 160,
    height: 160,
    borderRadius: 48,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  slideTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontDisplay,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: W * 0.78,
  },

  bottom: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: 50,
    gap: SIZES.lg,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: SIZES.xs,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    width: 8,
  },

  ctaBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  ctaLabel: {
    color: '#0A0E1A',
    fontSize: SIZES.fontLg,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0A0E1A25',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
