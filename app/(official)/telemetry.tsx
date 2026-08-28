import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateTelemetry, MOCK_ALERTS } from '../../src/data/mockData';
import { LineChart } from '../../src/components/LineChart';
import { ThreatBadge } from '../../src/components/ThreatBadge';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

export default function TelemetryScreen() {
  const [sectorIdx, setSectorIdx] = useState(0);
  const [tele, setTele] = useState(generateTelemetry());
  const [lastUpd, setLastUpd] = useState('');

  const alert = MOCK_ALERTS[sectorIdx];

  useEffect(() => {
    const upd = () => { setTele(generateTelemetry()); setLastUpd(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })); };
    upd();
    const i = setInterval(upd, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.title}>Real-Time Analytics</Text>
        <View style={s.updateRow}>
          <View style={s.updateDot} />
          <Text style={s.updateTxt}>Updated {lastUpd}</Text>
        </View>
      </View>

      {/* Sector tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {MOCK_ALERTS.map((a, i) => (
          <TouchableOpacity key={a.id} style={[s.tab, i === sectorIdx && s.tabActive]} onPress={() => setSectorIdx(i)}>
            <View style={[s.tabDot, {
              backgroundColor: a.threatLevel === 'critical' ? Colors.status.critical
                : a.threatLevel === 'warning' ? Colors.status.warning : Colors.status.safe,
            }]} />
            <Text style={[s.tabTxt, i === sectorIdx && s.tabTxtActive]} numberOfLines={1}>
              {a.sectorName.split(' — ')[0].replace('NH-29 ', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.sectorRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectorName}>{alert.sectorName}</Text>
            <Text style={s.sectorTrigger}>{alert.trigger}</Text>
          </View>
          <ThreatBadge level={alert.threatLevel} />
        </View>

        {/* FoS */}
        <View style={s.fosCard}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={s.fosLabel}>Factor of Safety (FoS)</Text>
            <Text style={[s.fosValue, {
              color: alert.fos < 1.0 ? Colors.status.critical : alert.fos < 1.5 ? Colors.status.warning : Colors.status.safe,
            }]}>{alert.fos.toFixed(2)}</Text>
            <Text style={s.fosDesc}>
              {alert.fos < 1.0 ? 'Failure imminent — debris mobilisation expected'
                : alert.fos < 1.5 ? 'Marginal stability — active creep observed'
                : 'Stable — monitoring only'}
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Text style={[s.fosTTF, { color: alert.fos < 1.0 ? Colors.status.critical : Colors.status.warning }]}>{alert.timeToFailure}</Text>
            <Text style={s.fosTTFLabel}>to failure</Text>
          </View>
        </View>

        {/* Charts */}
        {[
          { data: tele.rainfall,      color: Colors.primary,         label: 'Rainfall Accumulation',        unit: ' mm/h',  id: 'rain'   },
          { data: tele.porePressure,  color: Colors.status.warning,  label: 'Soil Pore-Water Pressure',     unit: ' kPa',   id: 'pore'   },
          { data: tele.strainRate,    color: '#A78BFA',              label: 'DAS Fiber Strain Rate',        unit: ' με/s',  id: 'strain' },
          { data: tele.inverseVelocity, color: Colors.status.critical, label: 'Inverse Velocity (1/v)', unit: '',     id: 'inv'    },
        ].map(chart => (
          <View key={chart.id} style={s.chartCard}>
            <LineChart data={chart.data} color={chart.color} label={chart.label} unit={chart.unit} gradientId={chart.id} />
            {chart.id === 'inv' && (
              <Text style={s.chartNote}>↓ Approaching Fukuzono horizon · Failure at {alert.minutesToFailure <= 60 ? '15:15 IST' : '16:30 IST'}</Text>
            )}
          </View>
        ))}

        {/* Infrastructure */}
        <View style={s.infraCard}>
          <Text style={s.infraTitle}>Infrastructure at Risk</Text>
          {alert.infrastructure.map((item, i) => (
            <View key={i} style={s.infraRow}>
              <Ionicons name="alert-circle-outline" size={12} color={Colors.status.critical} />
              <Text style={s.infraTxt}>{item}</Text>
            </View>
          ))}
          {alert.villages.map((v, i) => (
            <View key={i} style={s.infraRow}>
              <Ionicons name="people-outline" size={12} color={Colors.status.warning} />
              <Text style={s.infraTxt}>{v} — isolated if failure occurs</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  updateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  updateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.safe },
  updateTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  tabRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border.default, backgroundColor: Colors.bg.card },
  tabActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.status.infoBorder },
  tabDot: { width: 6, height: 6, borderRadius: 3 },
  tabTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.secondary, maxWidth: 100 },
  tabTxtActive: { color: Colors.primary },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  sectorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  sectorName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sectorTrigger: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: 2 },
  fosCard: { flexDirection: 'row', backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: Spacing.md, alignItems: 'center' },
  fosLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  fosValue: { fontFamily: FontFamily.bold, fontSize: FontSize.xxl },
  fosDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary, lineHeight: 16 },
  fosTTF: { fontFamily: FontFamily.bold, fontSize: FontSize.xl },
  fosTTFLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  chartCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: 4 },
  chartNote: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.status.critical, lineHeight: 16 },
  infraCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: Spacing.sm },
  infraTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary, marginBottom: 4 },
  infraRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infraTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
});
