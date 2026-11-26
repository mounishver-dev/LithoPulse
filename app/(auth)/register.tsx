import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const DISTRICTS = [
  'Aizawl', 'Champhai', 'Kolasib', 'Lunglei', 'Mamit',
  'Serchhip', 'Lawngtlai', 'Saiha', 'Hnahthial', 'Khawzawl', 'Saitual',
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [showPicker, setShowPicker] = useState(false);
  const { registerCitizen, isLoading, error, clearError } = useAuthStore();

  useEffect(() => { return clearError; }, []);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    const ok = await registerCitizen(name.trim(), email.trim(), password, district);
    if (ok) router.replace('/(citizen)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text.secondary} />
          <Text style={s.backText}>Sign In</Text>
        </TouchableOpacity>

        <View style={s.titleArea}>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Select your district to receive geo-targeted disaster alerts for your area.</Text>
        </View>

        <View style={s.card}>
          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.status.critical} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {[
            { label: 'Full Name', icon: 'person-outline', value: name, setter: setName, placeholder: 'Your full name' },
            { label: 'Email Address', icon: 'mail-outline', value: email, setter: setEmail, placeholder: 'you@example.com', keyboard: 'email-address' as const, capitalize: 'none' as const },
          ].map(({ label, icon, value, setter, placeholder, keyboard, capitalize }) => (
            <View key={label} style={s.field}>
              <Text style={s.label}>{label}</Text>
              <View style={s.inputRow}>
                <Ionicons name={icon as any} size={16} color={Colors.text.tertiary} />
                <TextInput style={s.input} value={value} onChangeText={setter}
                  placeholder={placeholder} placeholderTextColor={Colors.text.tertiary}
                  keyboardType={keyboard} autoCapitalize={capitalize} autoCorrect={false} />
              </View>
            </View>
          ))}

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.text.tertiary} />
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                placeholder="Min. 8 characters" placeholderTextColor={Colors.text.tertiary}
                secureTextEntry={!showPwd} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={16} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* District picker */}
          <View style={s.field}>
            <Text style={s.label}>District / Area</Text>
            <TouchableOpacity style={[s.inputRow, s.inputRowActive]} onPress={() => setShowPicker(!showPicker)}>
              <Ionicons name="location" size={16} color={Colors.status.safe} />
              <Text style={[s.locText, s.locTextActive]}>{district}</Text>
              <Ionicons name={showPicker ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.text.tertiary} />
            </TouchableOpacity>
            {showPicker && (
              <View style={s.pickerList}>
                {DISTRICTS.map(d => (
                  <TouchableOpacity key={d} style={[s.pickerItem, d === district && s.pickerItemOn]}
                    onPress={() => { setDistrict(d); setShowPicker(false); }}>
                    <Ionicons name="location-outline" size={13} color={d === district ? Colors.primary : Colors.text.tertiary} />
                    <Text style={[s.pickerTxt, d === district && s.pickerTxtOn]}>{d}, Mizoram</Text>
                    {d === district && <Ionicons name="checkmark" size={13} color={Colors.primary} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={s.locHint}>📍 Used for proximity alerts in your district</Text>
          </View>

          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={isLoading}>
            <View style={s.btnInner}>
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.btnText}>Create Account</Text>}
            </View>
          </TouchableOpacity>

          <Text style={s.terms}>By registering, you agree to receive geo-targeted disaster alerts. No data is sold or shared.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: Colors.bg.primary, padding: Spacing.lg, paddingTop: 56 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.lg },
  backText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  titleArea: { gap: 8, marginBottom: Spacing.lg },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.text.primary },
  subtitle: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 19 },
  card: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.xl, borderWidth: 1,
    borderColor: Colors.border.default, padding: Spacing.lg, gap: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.status.criticalBg,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.status.criticalBorder, padding: Spacing.sm,
  },
  errorText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.status.critical, flex: 1, lineHeight: 17 },
  field: { gap: 6 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md, height: 48, gap: 10,
  },
  inputRowActive: { borderColor: Colors.status.safeBorder, backgroundColor: Colors.status.safeBg },
  input: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text.primary },
  locText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text.tertiary },
  locTextActive: { color: Colors.text.primary },
  locHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: -2 },
  pickerList: {
    backgroundColor: Colors.bg.secondary, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border.default, overflow: 'hidden', marginTop: -2,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.border.subtle,
  },
  pickerItemOn: { backgroundColor: Colors.primaryBg },
  pickerTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
  pickerTxtOn: { color: Colors.primary, fontFamily: FontFamily.medium },
  btn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  btnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, backgroundColor: Colors.primary, borderRadius: Radius.md },
  btnText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  terms: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, textAlign: 'center', lineHeight: 16 },
});
