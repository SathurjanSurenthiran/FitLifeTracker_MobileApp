// Shared style tokens and mixins used across screens

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants';

// Typography presets

export const typography = StyleSheet.create({
  hero: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontHero,
    fontWeight: '900',
    letterSpacing: -1,
  },
  display: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontDisplay,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h1: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontXxl,
    fontWeight: '800',
  },
  h2: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontXl,
    fontWeight: '700',
  },
  h3: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    lineHeight: 22,
  },
  bodySmall: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    lineHeight: 18,
  },
  caption: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontXs,
    lineHeight: 16,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  numericLarge: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontDisplay,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
});

// Layout helpers

export const layout = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
  screenPadding: { paddingHorizontal: SIZES.md },
});

// Card variants

export const cards = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  elevated: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...Platform.select({
      android: { elevation: 4 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    overflow: 'hidden',
  },
});

// Badge / chip styles

export const badges = StyleSheet.create({
  pill: {
    paddingHorizontal: SIZES.sm + 4,
    paddingVertical: SIZES.xs + 2,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Input styles

export const inputs = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  error: {
    borderColor: COLORS.error,
  },
});

// Shadow helpers

export const shadows = {
  sm: Platform.select({
    android: { elevation: 2 },
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  }),
  md: Platform.select({
    android: { elevation: 4 },
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  }),
  lg: Platform.select({
    android: { elevation: 8 },
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  }),
  primary: Platform.select({
    android: { elevation: 6 },
    ios: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  }),
};

export default { typography, layout, cards, badges, inputs, shadows };
