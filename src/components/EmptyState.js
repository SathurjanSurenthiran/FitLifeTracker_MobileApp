import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const EmptyState = ({ icon = 'cube-outline', title, subtitle, style }) => (
  <View style={[styles.container, style]}>
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={40} color={COLORS.textMuted} />
    </View>
    {title && <Text style={styles.title}>{title}</Text>}
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.xxl, gap: SIZES.sm },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  title: { color: COLORS.textSecondary, fontSize: SIZES.fontMd, fontWeight: '600', textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: SIZES.fontSm, textAlign: 'center' },
});

export default EmptyState;
