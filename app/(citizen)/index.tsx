import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useLocation, getAlertsNearLocation } from '../../src/hooks/useLocation';
import { AlertBanner } from '../../src/components/AlertBanner';
import { SectorCard } from '../../src/components/SectorCard';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

export default function CitizenHome() {
  const { user, logout } = useAuthStore();
  const { coords, district, stateName, isLoading: locLoading, refresh } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState('');

  const alerts = getAlertsNearLocation(coords?.latitude ?? null, coords?.longitude ?? null);
  const critical = alerts.find(a => a.threatLevel === 'critical') ?? null;

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST');
    update();
    const i = setInterval(update, 30000);
    return () => clearInterval(i);
  }, []);

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false); };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.primary} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <View style={s.locRow}>
            <Ionicons name="location" size={11} color={Colors.primary} />
            <Text style={s.locText}>{locLoading ? 'Locating...' : `${district}${stateName ? `, ${stateName}` : ''}`}</Text>
          </View>
          <Text style={s.time}>{time}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={[s.statusChip, critical ? s.chipCritical : s.chipClear]}>
            <View style={[s.chipDot, { backgroundColor: critical ? Colors.status.critical : Colors.status.safe }]} />
            <Text style={[s.chipText, { color: critical ? Colors.status.critical : Colors.status.safe }]}>
              {critical ? `${alerts.filter(a => a.threatLevel === 'critical').length} CRITICAL` : 'ALL CLEAR'}
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        <View style={s.greetRow}>
          <View>
            <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0] || 'Citizen'}</Text>
            <Text style={s.subgreet}>{critical ? 'Immediate action may be required in your area.' : 'Stay prepared. Conditions are being monitored.'}</Text>
          </View>
        </View>

        {critical && <AlertBanner alert={critical} />}

        {/* Quick actions */}
        <View style={s.quickRow}>
          <TouchableOpacity style={[s.qBtn, s.qBtnPrimary]} onPress={() => router.push('/(citizen)/map')}>
            <Ionicons name="navigate" size={17} color="#fff" />
            <Text style={s.qBtnTextPrimary}>Evacuation Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.qBtn} onPress={() => router.push('/(citizen)/report')}>
            <Ionicons name="camera-outline" size={17} color={Colors.text.secondary} />
            <Text style={s.qBtnText}>Report Hazard</Text>
          </TouchableOpacity>
        </View>

        {/* Alert list */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Active Threats Near You</Text>
            <View style={s.countBadge}><Text style={s.countText}>{alerts.length}</Text></View>
          </View>
          {alerts.map((alert, i) => (
            <SectorCard key={alert.id} alert={alert} showPriority={i + 1} />
          ))}
        </View>

        {/* Tip */}
        <View style={s.tip}>
          <Ionicons name="bulb-outline" size={15} color={Colors.status.warning} />
          <Text style={s.tipText}>Keep your phone charged. Download offline evacuation maps from the Evacuate tab.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border.subtle,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 1 },
  locText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.primary },
  time: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  chipCritical: { backgroundColor: Colors.status.criticalBg, borderColor: Colors.status.criticalBorder },
  chipClear: { backgroundColor: Colors.status.safeBg, borderColor: Colors.status.safeBorder },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 0.4 },
  logoutBtn: { padding: 4 },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.text.primary },
  subgreet: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: 3, lineHeight: 18 },
  quickRow: { flexDirection: 'row', gap: Spacing.sm },
  qBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: Radius.md,
    backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.default,
  },
  qBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary, flex: 1.3 },
  qBtnTextPrimary: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: '#fff' },
  qBtnText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  section: { gap: Spacing.sm },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  sectionTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  countBadge: { backgroundColor: Colors.bg.elevated, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.text.tertiary },
  tip: {
    flexDirection: 'row', gap: 8, backgroundColor: Colors.status.warningBg,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.status.warningBorder,
    padding: Spacing.md, alignItems: 'flex-start',
  },
  tipText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1, lineHeight: 19 },
});
