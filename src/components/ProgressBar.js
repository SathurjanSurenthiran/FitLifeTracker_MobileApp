import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const ProgressBar = ({ progress = 0, color = COLORS.primary, height = 8, style, rounded = true }) => {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const radius = rounded ? height / 2 : 0;
  return (
    <View style={[styles.track, { height, borderRadius: radius }, style]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color, borderRadius: radius, height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { backgroundColor: COLORS.surfaceLight, overflow: 'hidden', width: '100%' },
  fill: { position: 'absolute', left: 0, top: 0 },
});

export default ProgressBar;
