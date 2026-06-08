import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import ProgressBar from './ProgressBar';

const StatCard = ({ icon, iconColor, label, value, unit, progress, progressColor, subtitle, style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.topRow}>
      <View style={[styles.iconRing, { borderColor: (iconColor || COLORS.primary) + '50' }]}>
        <View style={[styles.iconBg, { backgroundColor: (iconColor || COLORS.primary) + '25' }]}>
          <Ionicons name={icon} size={18} color={iconColor || COLORS.primary} />
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>
      {value}
      {unit ? <Text style={styles.unit}> {unit}</Text> : null}
    </Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {progress !== undefined && (
      <>
        <ProgressBar progress={progress} color={progressColor || iconColor || COLORS.primary} height={5} style={styles.bar} />
        <Text style={[styles.pct, { color: progressColor || iconColor || COLORS.primary }]}>
          {Math.round(progress)}%
        </Text>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceMid,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  iconBg: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  label: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '500', flex: 1 },
  value: { color: COLORS.textPrimary, fontSize: SIZES.fontXxl, fontWeight: '800', letterSpacing: -0.5 },
  unit: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '400' },
  subtitle: { color: COLORS.textMuted, fontSize: SIZES.fontXs },
  bar: { marginTop: 4 },
  pct: { fontSize: SIZES.fontXs, fontWeight: '700', textAlign: 'right' },
});

export default StatCard;
