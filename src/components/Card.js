import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const Card = ({ children, style, padding = SIZES.md, variant = 'default' }) => {
  const bg = {
    default: COLORS.surface,
    elevated: COLORS.surfaceLight,
    dark: COLORS.surfaceMid,
  }[variant] || COLORS.surface;

  return (
    <View style={[styles.card, { backgroundColor: bg, padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
});

export default Card;
