import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const SectionHeader = ({ title, actionLabel, onAction, style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  title: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700', letterSpacing: 0.2 },
  action: { color: COLORS.primary, fontSize: SIZES.fontSm, fontWeight: '600' },
});

export default SectionHeader;
