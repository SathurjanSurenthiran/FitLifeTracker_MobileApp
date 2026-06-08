import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SIZES } from '../constants';

const CustomButton = ({ label, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, style, textStyle, leftIcon }) => {
  const configs = {
    primary:   { bg: COLORS.primary, text: '#0A0E1A', border: COLORS.primary },
    secondary: { bg: COLORS.surfaceLight, text: COLORS.textPrimary, border: COLORS.surfaceBorder },
    ghost:     { bg: 'transparent', text: COLORS.primary, border: COLORS.surfaceBorder },
    danger:    { bg: COLORS.error, text: '#fff', border: COLORS.error },
    teal:      { bg: COLORS.primary + '20', text: COLORS.primary, border: COLORS.primary + '50' },
  };
  const { bg, text, border } = configs[variant] || configs.primary;
  const pv = { sm: 9, md: 13, lg: 16 }[size];
  const fs = { sm: SIZES.fontSm, md: SIZES.fontMd, lg: SIZES.fontLg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.btn, { backgroundColor: bg, paddingVertical: pv, borderColor: border }, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={text} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {leftIcon}
          <Text style={[styles.label, { color: text, fontSize: fs }, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: SIZES.radiusMd, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.md, borderWidth: 1 },
  label: { fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.45 },
});

export default CustomButton;
