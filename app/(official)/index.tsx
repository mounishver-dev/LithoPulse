import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { AlertBanner } from '../../src/components/AlertBanner';
import { SectorCard } from '../../src/components/SectorCard';
import { MOCK_ALERTS } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

export default function OfficialDashboard() {
  const { user, logout } = useAuthStore();
  const [time, setTime] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const sorted = [...MOCK_ALERTS].sort((a, b) => {
    const o = { critical: 0, warning: 1, stable: 2 };
    return o[a.threatLevel] - o[b.threatLevel];
  });
  const critical = MOCK_ALERTS.filter(a => a.threatLevel === 'critical');
  const warning = MOCK_ALERTS.filter(a => a.threatLevel === 'warning');

  useEffect(() => {
    const upd = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST');
    upd(); const i = setInterval(upd, 1000); return () => clearInterval(i);
  }, []);

  const onRefresh = async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 700)); setRefreshing(false); };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>DEOC Command Portal</Text>
          <Text style={s.headerSub}>Mizoram / NH-29 Corridor</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.liveTag}>
            <View style={s.liveDot} />
            <Text style={s.liveTime}>{time}</Text>
          </View>
          <TouchableOpacity onPress={logout}><Ionicons name="log-out-outline" size={20} color={Colors.text.tertiary} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Stat row */}
        <View style={s.statRow}>
          {[
            { val: critical.length, label: 'Critical', bg: Colors.status.criticalBg, border: Colors.status.criticalBorder, color: Colors.status.critical },
            { val: warning.length, label: 'Warning', bg: Colors.status.warningBg, border: Colors.status.warningBorder, color: Colors.status.warning },
            { val: MOCK_ALERTS.length, label: 'Sectors', bg: Colors.bg.card, border: Colors.border.default, color: Colors.text.primary },
            { val: 3, label: 'NDRF', bg: Colors.bg.card, border: Colors.border.default, color: Colors.primary },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: stat.bg, borderColor: stat.border }]}>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {critical[0] && <AlertBanner alert={critical[0]} />}

        {/* Dispatch shortcut */}
        <TouchableOpacity style={s.dispatchShortcut} onPress={() => router.push('/(official)/dispatch')}>
          <View style={s.dispLeft}>
            <Ionicons name="megaphone" size={18} color={Colors.status.critical} />
            <View>
              <Text style={s.dispTitle}>CAP Alert Ready to Broadcast</Text>
              <Text style={s.dispSub}>Sector 4A polygon pre-loaded · Tap to dispatch</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={16} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Triage queue */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Triage & Asset Vulnerability Queue</Text>
          <Text style={s.sectionSub}>Sorted by impact · Population · Time to failure</Text>
          {sorted.map((alert, i) => (
            <SectorCard key={alert.id} alert={alert} showPriority={i + 1} onPress={() => router.push('/(official)/telemetry')} />
          ))}
        </View>

        <View style={s.officerCard}>
          <Ionicons name="shield-checkmark-outline" size={15} color={Colors.text.tertiary} />
          <View>
            <Text style={s.officerName}>{user?.name}</Text>
            <Text style={s.officerRole}>{user?.role}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text.primary },
  headerSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.status.criticalBg, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.status.criticalBorder, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.critical },
  liveTime: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.status.critical, letterSpacing: 0.4 },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, borderRadius: Radius.md, borderWidth: 1, padding: 10, alignItems: 'center', gap: 3 },
  statVal: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  dispatchShortcut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.status.criticalBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.status.criticalBorder, padding: Spacing.md },
  dispLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dispTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  dispSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sectionSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: -4 },
  officerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, padding: Spacing.md },
  officerName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  officerRole: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
});
