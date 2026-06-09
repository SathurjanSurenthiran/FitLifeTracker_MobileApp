import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { updateProfile } from '../services/database';
import { InputField, CustomButton } from '../components';
import { COLORS, SIZES, FITNESS_LEVELS } from '../constants';
import { calculateBMI, getBMICategory } from '../utils';

const ProfileScreen = () => {
  const { profile, refreshProfile } = useApp();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(String(profile.age || ''));
      setHeight(String(profile.height || ''));
      setWeight(String(profile.weight || ''));
      setFitnessLevel(profile.fitness_level || 'Beginner');
    }
  }, [profile]);

  const currentBMI = calculateBMI(parseFloat(weight), parseFloat(height));
  const bmiCat = getBMICategory(currentBMI);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    const a = parseInt(age); if (isNaN(a) || a < 5 || a > 120) e.age = 'Enter valid age (5–120)';
    const h = parseFloat(height); if (isNaN(h) || h < 50 || h > 300) e.height = 'Enter height in cm (50–300)';
    const w = parseFloat(weight); if (isNaN(w) || w < 10 || w > 500) e.weight = 'Enter weight in kg (10–500)';
    setErrors(e); return Object.keys(e).length === 0;
  };

const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        fitness_level: fitnessLevel,
      });
      await refreshProfile();
      Alert.alert('✅ Saved', 'Profile updated successfully!');
    } catch (err) {
      console.error('Profile save error:', err);
      Alert.alert('Error', `Could not save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Level icons
  const LEVEL_ICONS = { Beginner: 'leaf', Intermediate: 'bicycle', Advanced: 'flash', Athlete: 'trophy' };
  const LEVEL_COLORS = { Beginner: '#06D6A0', Intermediate: '#FFD166', Advanced: COLORS.calorie, Athlete: COLORS.primary };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* PROFILE HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroDeco1} /><View style={styles.heroDeco2} />
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{name ? name[0].toUpperCase() : 'U'}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLORS[fitnessLevel] }]}>
              <Ionicons name={LEVEL_ICONS[fitnessLevel]} size={12} color="#0A0E1A" />
            </View>
          </View>
          <Text style={styles.heroName}>{name || 'Your Name'}</Text>
          <Text style={styles.heroLevel}>{fitnessLevel} Athlete</Text>

          {/* Quick stats row */}
          <View style={styles.quickStatsRow}>
            {[
              { label: 'Height', val: height ? `${height}cm` : '—', icon: 'body', color: '#5f636e' },
              { label: 'Weight', val: weight ? `${weight}kg` : '—', icon: 'fitness', color: '#1a7272' },
              { label: 'BMI', val: currentBMI || '—', icon: 'speedometer', color: '#3c7e4a'},
              { label: 'Age', val: age || '—', icon: 'calendar', color: '#7d5a9f' },
            ].map(s => (
              <View key={s.label} style={styles.quickStat}>
                <View style={[styles.quickStatIcon, { backgroundColor: s.color + '25' }]}>
                  <Ionicons name={s.icon} size={16} color={s.color} />
                </View>
                <Text style={[styles.quickStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.quickStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* BMI CARD */}
        {currentBMI && (
          <View style={styles.bmiCard}>
            <View style={styles.bmiLeft}>
              <Text style={styles.bmiLabel}>BMI Index</Text>
              <Text style={[styles.bmiVal, { color: bmiCat.color }]}>{currentBMI}</Text>
              <View style={[styles.bmiChip, { backgroundColor: bmiCat.color + '25', borderColor: bmiCat.color + '60' }]}>
                <Text style={[styles.bmiChipText, { color: bmiCat.color }]}>{bmiCat.label}</Text>
              </View>
            </View>
            <View style={styles.bmiScale}>
              {[
                { label: 'Underweight', range: '< 18.5', color: COLORS.info },
                { label: 'Normal', range: '18.5 – 24.9', color: COLORS.success },
                { label: 'Overweight', range: '25 – 29.9', color: COLORS.warning },
                { label: 'Obese', range: '≥ 30', color: COLORS.error },
              ].map(b => (
                <View key={b.label} style={styles.bmiScaleRow}>
                  <View style={[styles.bmiDot, { backgroundColor: b.color }]} />
                  <Text style={styles.bmiScaleText}>{b.label}: <Text style={{ color: COLORS.textSecondary }}>{b.range}</Text></Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* EDIT FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Edit Profile</Text>
          <InputField label="Full Name" value={name} onChangeText={t => { setName(t); setErrors(e => ({...e, name:''})); }} placeholder="Your name" error={errors.name} />
          <View style={styles.row}>
            <InputField label="Age (years)" value={age} onChangeText={t => { setAge(t); setErrors(e => ({...e, age:''})); }} keyboardType="numeric" placeholder="25" error={errors.age} style={{ flex: 1 }} />
            <InputField label="Height (cm)" value={height} onChangeText={t => { setHeight(t); setErrors(e => ({...e, height:''})); }} keyboardType="numeric" placeholder="170" error={errors.height} style={{ flex: 1 }} />
          </View>
          <InputField label="Weight (kg)" value={weight} onChangeText={t => { setWeight(t); setErrors(e => ({...e, weight:''})); }} keyboardType="numeric" placeholder="70" error={errors.weight} />

          <Text style={styles.fieldLabel}>Fitness Level</Text>
          <View style={styles.levelGrid}>
            {FITNESS_LEVELS.map(level => {
              const active = fitnessLevel === level;
              const color = LEVEL_COLORS[level];
              return (
                <TouchableOpacity key={level} style={[styles.levelChip, active && { backgroundColor: color + '20', borderColor: color }]} onPress={() => setFitnessLevel(level)}>
                  <Ionicons name={LEVEL_ICONS[level]} size={16} color={active ? color : COLORS.textMuted} />
                  <Text style={[styles.levelLabel, active && { color }]}>{level}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <CustomButton label="Save Profile" onPress={handleSave} loading={saving} size="lg" style={styles.saveBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.md, gap: SIZES.md, paddingBottom: 100 },

  heroCard: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusXl, padding: SIZES.lg, alignItems: 'center', gap: SIZES.sm, overflow: 'hidden' },
  heroDeco1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#ffffff15', top: -30, right: -20 },
  heroDeco2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffffff10', bottom: 10, left: -15 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0A0E1A30', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff40' },
  avatarInitial: { color: '#0A0E1A', fontSize: 36, fontWeight: '900' },
  levelBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  heroName: { color: '#0A0E1A', fontSize: SIZES.fontXxl, fontWeight: '900' },
  heroLevel: { color: '#0A0E1A80', fontSize: SIZES.fontSm, fontWeight: '600' },
  quickStatsRow: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.xs },
  quickStat: { flex: 1, alignItems: 'center', gap: 4 },
  quickStatIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickStatVal: { fontSize: SIZES.fontMd, fontWeight: '800' },
  quickStatLabel: { color: '#0A0E1A70', fontSize: 10, fontWeight: '500' },

  bmiCard: { flexDirection: 'row', gap: SIZES.md, backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceBorder, alignItems: 'center' },
  bmiLeft: { alignItems: 'center', gap: 6 },
  bmiLabel: { color: COLORS.textMuted, fontSize: SIZES.fontXs, fontWeight: '500' },
  bmiVal: { fontSize: 42, fontWeight: '900', lineHeight: 50 },
  bmiChip: { paddingHorizontal: SIZES.sm, paddingVertical: 3, borderRadius: SIZES.radiusFull, borderWidth: 1 },
  bmiChipText: { fontSize: SIZES.fontXs, fontWeight: '700' },
  bmiScale: { flex: 1, gap: SIZES.xs },
  bmiScaleRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  bmiDot: { width: 8, height: 8, borderRadius: 4 },
  bmiScaleText: { color: COLORS.textMuted, fontSize: SIZES.fontXs },

  formCard: { backgroundColor: COLORS.surfaceMid, borderRadius: SIZES.radiusLg, padding: SIZES.md, gap: 4, borderWidth: 1, borderColor: COLORS.surfaceBorder },
  formTitle: { color: COLORS.textPrimary, fontSize: SIZES.fontLg, fontWeight: '700', marginBottom: SIZES.sm },
  row: { flexDirection: 'row', gap: SIZES.sm },
  fieldLabel: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  levelChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SIZES.sm + 4, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusFull, borderWidth: 1.5, borderColor: COLORS.surfaceBorder, backgroundColor: COLORS.surfaceLight },
  levelLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '500' },
  saveBtn: { paddingVertical: 16 },
});

export default ProfileScreen;
