import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', error, multiline = false, numberOfLines = 1, style, inputStyle, maxLength, editable = true }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.focused, error && styles.errored, !editable && styles.disabled, multiline && { height: numberOfLines * 40, textAlignVertical: 'top' }, inputStyle]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.sm },
  label: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.md, paddingVertical: 12, color: COLORS.textPrimary, fontSize: SIZES.fontMd, borderWidth: 1.5, borderColor: COLORS.surfaceBorder },
  focused: { borderColor: COLORS.primary },
  errored: { borderColor: COLORS.error },
  disabled: { opacity: 0.5 },
  error: { color: COLORS.error, fontSize: SIZES.fontXs, marginTop: 4 },
});

export default InputField;
