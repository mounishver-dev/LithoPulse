import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

export default function LoginScreen() {
  const [tab, setTab] = useState<'citizen' | 'official'>('citizen');
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginCitizen, loginOfficial, isLoading, error, clearError } = useAuthStore();
  const tabAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (t: typeof tab) => {
    setTab(t); clearError(); setEmail(''); setUsername(''); setPassword('');
    Animated.spring(tabAnim, { toValue: t === 'citizen' ? 0 : 1, useNativeDriver: false }).start();
  };

  const handleLogin = async () => {
    if (tab === 'official') {
      const ok = await loginOfficial(username, password);
      if (ok) router.replace('/(official)');
    } else {
      const ok = await loginCitizen(email, password);
      if (ok) router.replace('/(citizen)');
    }
  };

  const indicatorLeft = tabAnim.interpolate({ inputRange: [0, 1], outputRange: ['2%', '51%'] });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Branding */}
        <View style={s.brand}>
          <View style={s.logoWrap}>
            <View style={s.logoRing}><View style={s.logoDot} /></View>
          </View>
          <Text style={s.appName}>LithoPulse</Text>
          <Text style={s.tagline}>Disaster Intelligence Network</Text>
          <View style={s.liveChip}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>NH-29 Corridor · Active Monitoring</Text>
          </View>
        </View>

        {/* Card */}
        <View style={s.card}>
          {/* Tab switcher */}
          <View style={s.tabBar}>
            <Animated.View style={[s.tabIndicator, { left: indicatorLeft }]} />
            <TouchableOpacity style={s.tab} onPress={() => switchTab('citizen')}>
              <Text style={[s.tabText, tab === 'citizen' && s.tabTextActive]}>Citizen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tab} onPress={() => switchTab('official')}>
              <Text style={[s.tabText, tab === 'official' && s.tabTextActive]}>Official</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.desc}>
            {tab === 'citizen'
              ? 'Sign in to receive geo-targeted alerts and report hazards near you.'
              : 'Restricted access. Use your provisioned NDMA/SDMA credentials.'}
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={Colors.status.critical} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Inputs */}
          {tab === 'citizen' ? (
            <View style={s.field}>
              <Text style={s.label}>Email Address</Text>
              <View style={s.inputRow}>
                <Ionicons name="mail-outline" size={16} color={Colors.text.tertiary} />
                <TextInput style={s.input} value={email} onChangeText={setEmail}
                  placeholder="you@example.com" placeholderTextColor={Colors.text.tertiary}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
            </View>
          ) : (
            <View style={s.field}>
              <Text style={s.label}>Username</Text>
              <View style={s.inputRow}>
                <Ionicons name="shield-outline" size={16} color={Colors.text.tertiary} />
                <TextInput style={s.input} value={username} onChangeText={setUsername}
                  placeholder="e.g. dm_mizoram" placeholderTextColor={Colors.text.tertiary}
                  autoCapitalize="none" autoCorrect={false} />
              </View>
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.text.tertiary} />
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={Colors.text.tertiary}
                secureTextEntry={!showPwd} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={16} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={isLoading}>
            <LinearGradient colors={['#5A7AF8', Colors.primary, '#3A56D4']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.loginBtnInner}>
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Text style={s.loginBtnText}>Sign In</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></>}
            </LinearGradient>
          </TouchableOpacity>

          {tab === 'citizen' ? (
            <TouchableOpacity style={s.registerLink} onPress={() => router.push('/(auth)/register')}>
              <Text style={s.registerText}>New here?{' '}
                <Text style={{ color: Colors.primary }}>Create account</Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={s.officialNote}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.text.tertiary} />
              <Text style={s.officialNoteText}>Accounts are provisioned by NDMA/SDMA administrators only.</Text>
            </View>
          )}
        </View>

        <Text style={s.footer}>LithoPulse · NDMA Disaster Intelligence · v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: Colors.bg.primary, padding: Spacing.lg, paddingTop: 64 },
  brand: { alignItems: 'center', marginBottom: Spacing.xl, gap: 8 },
  logoWrap: { marginBottom: 8 },
  logoRing: {
    width: 54, height: 54, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.status.infoBorder,
    justifyContent: 'center', alignItems: 'center',
  },
  logoDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary },
  appName: { fontFamily: FontFamily.bold, fontSize: FontSize.xxl, color: Colors.text.primary, letterSpacing: -0.5 },
  tagline: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.tertiary, letterSpacing: 0.5 },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.status.safeBg, borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.status.safeBorder, paddingHorizontal: 12, paddingVertical: 5, marginTop: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.safe },
  liveText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.safe },
  card: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.xl, borderWidth: 1,
    borderColor: Colors.border.default, padding: Spacing.lg, gap: Spacing.md,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md, padding: 3, position: 'relative',
  },
  tabIndicator: {
    position: 'absolute', top: 3, bottom: 3, width: '48%',
    backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border.bright,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', zIndex: 1 },
  tabText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.tertiary },
  tabTextActive: { color: Colors.text.primary },
  desc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.tertiary, lineHeight: 18 },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: Colors.status.criticalBg, borderRadius: Radius.sm, borderWidth: 1,
    borderColor: Colors.status.criticalBorder, padding: Spacing.sm,
  },
  errorText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.status.critical, flex: 1, lineHeight: 17 },
  field: { gap: 6 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default,
    paddingHorizontal: Spacing.md, height: 48, gap: 10,
  },
  input: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text.primary },
  loginBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  loginBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, gap: 8 },
  loginBtnText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  registerLink: { alignItems: 'center', paddingVertical: 4 },
  registerText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
  officialNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  officialNoteText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, flex: 1, lineHeight: 16 },
  footer: { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: Spacing.xl },
});
