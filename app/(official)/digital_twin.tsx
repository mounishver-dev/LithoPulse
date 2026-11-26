import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Rect, Line, Circle, Polygon, Path, Text as SvgText,
  Defs, LinearGradient as SvgGradient, Stop, G,
} from 'react-native-svg';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const { width: W } = Dimensions.get('window');
const SVG_W = W - 32;
const SVG_H = 220;

// Simulated sensor nodes on the slope
const NODES = [
  { id: 'S1', label: 'Crown', x: SVG_W * 0.5, y: 28, fos: 1.05, disp: 12.4, moisture: 82, status: 'critical' },
  { id: 'S2', label: 'Mid-L', x: SVG_W * 0.25, y: 90, fos: 1.28, disp: 6.1, moisture: 68, status: 'warning' },
  { id: 'S3', label: 'Mid-R', x: SVG_W * 0.75, y: 95, fos: 1.31, disp: 5.8, moisture: 65, status: 'warning' },
  { id: 'S4', label: 'Toe-L', x: SVG_W * 0.15, y: 168, fos: 1.62, disp: 2.3, moisture: 44, status: 'safe' },
  { id: 'S5', label: 'Toe-R', x: SVG_W * 0.85, y: 172, fos: 1.59, disp: 2.1, moisture: 41, status: 'safe' },
  { id: 'S6', label: 'Base',  x: SVG_W * 0.5,  y: 195, fos: 2.14, disp: 0.4, moisture: 28, status: 'safe' },
];

const NODE_COLOR: Record<string, string> = {
  critical: '#E84040',
  warning:  '#F5A623',
  safe:     '#2ECC71',
};

// Topographic contour points
const SLOPE_POLY = `0,${SVG_H} 0,160 ${SVG_W*0.08},145 ${SVG_W*0.15},130 ${SVG_W*0.25},108 ${SVG_W*0.35},78 ${SVG_W*0.5},40 ${SVG_W*0.65},75 ${SVG_W*0.75},105 ${SVG_W*0.85},128 ${SVG_W*0.92},142 ${SVG_W},158 ${SVG_W},${SVG_H}`;
const SLIP_PATH = `M ${SVG_W*0.3},90 Q ${SVG_W*0.5},55 ${SVG_W*0.7},92`;

const METRICS = [
  { label: 'Global FoS', value: '1.18', unit: '', status: 'critical', icon: 'warning' },
  { label: 'Max Displacement', value: '12.4', unit: 'mm/day', status: 'critical', icon: 'trending-up' },
  { label: 'Avg Moisture', value: '61', unit: '%', status: 'warning', icon: 'water' },
  { label: 'Seismic PGV', value: '0.04', unit: 'g', status: 'safe', icon: 'pulse' },
];

const HISTORY = [
  { t: 'Day -4', fos: 1.68, disp: 2.1 },
  { t: 'Day -3', fos: 1.54, disp: 3.8 },
  { t: 'Day -2', fos: 1.41, disp: 6.2 },
  { t: 'Day -1', fos: 1.29, disp: 9.1 },
  { t: 'Now',    fos: 1.18, disp: 12.4 },
];

const CHART_W = SVG_W;
const CHART_H = 90;

export default function DigitalTwinScreen() {
  const [selectedNode, setSelectedNode] = useState<typeof NODES[0] | null>(null);
  const [tab, setTab] = useState<'twin' | 'sensors' | 'history'>('twin');
  const [tick, setTick] = useState(0);
  const pulseAnims = useRef(NODES.map(() => new Animated.Value(1))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const interval = setInterval(() => setTick(t => t + 1), 2000);

    // Pulse critical nodes
    NODES.forEach((n, i) => {
      if (n.status === 'critical') {
        Animated.loop(Animated.sequence([
          Animated.timing(pulseAnims[i], { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnims[i], { toValue: 1, duration: 700, useNativeDriver: true }),
        ])).start();
      }
    });
    return () => clearInterval(interval);
  }, []);

  // Tiny live jitter on sensor values
  const jitter = (base: number, range: number) => (base + (Math.sin(tick) * range)).toFixed(1);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Digital Twin</Text>
          <Text style={s.sub}>NH-29 Km 14.2 · Mizo Hills Sector 4B · Live</Text>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveTxt}>LIVE</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['twin', 'sensors', 'history'] as const).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabOn]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtOn]}>
              {t === 'twin' ? '3D Model' : t === 'sensors' ? 'Sensors' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {tab === 'twin' && (
          <>
            {/* Global Failure Status */}
            <View style={s.alertBanner}>
              <Animated.View style={[s.alertDot, { transform: [{ scale: pulseAnims[0] }] }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertTitle}>⚠ IMMINENT SLOPE FAILURE — FoS 1.18</Text>
                <Text style={s.alertSub}>Crown displacement +12.4 mm/day · Evacuate 240m radius</Text>
              </View>
            </View>

            {/* 2D Topographic Cross-Section */}
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="layers" size={14} color={Colors.primary} />
                <Text style={s.cardTitle}>Slope Cross-Section — Failure Analysis</Text>
              </View>

              <Svg width={SVG_W} height={SVG_H} style={{ alignSelf: 'center' }}>
                <Defs>
                  <SvgGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#0A1018" stopOpacity="1" />
                    <Stop offset="1" stopColor="#050A0E" stopOpacity="1" />
                  </SvgGradient>
                  <SvgGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#1A2A16" stopOpacity="1" />
                    <Stop offset="1" stopColor="#0D1A0A" stopOpacity="1" />
                  </SvgGradient>
                </Defs>

                {/* Sky/background */}
                <Rect x={0} y={0} width={SVG_W} height={SVG_H} fill="url(#skyGrad)" rx={8} />

                {/* Slope polygon */}
                <Polygon points={SLOPE_POLY} fill="url(#soilGrad)" stroke="rgba(46,204,113,0.3)" strokeWidth={1.5} />

                {/* Rupture/slip surface */}
                <Path d={SLIP_PATH} stroke="rgba(232,64,64,0.85)" strokeWidth={2} fill="none" strokeDasharray="6,3" />

                {/* Mesh grid on slope */}
                {[0.25, 0.5, 0.75].map(x => (
                  <Line key={`mg${x}`}
                    x1={SVG_W * x} y1={20}
                    x2={SVG_W * x} y2={SVG_H - 2}
                    stroke="rgba(79,110,247,0.07)" strokeWidth={1} />
                ))}

                {/* Displacement arrows at critical node */}
                <Line x1={SVG_W * 0.5} y1={28} x2={SVG_W * 0.5} y2={60} stroke="#E84040" strokeWidth={2} markerEnd="url(#arr)" />

                {/* Sensor nodes */}
                {NODES.map((n, i) => {
                  const color = NODE_COLOR[n.status];
                  return (
                    <G key={n.id}>
                      <Circle
                        cx={n.x} cy={n.y} r={10}
                        fill={`${color}22`} stroke={color} strokeWidth={1.5}
                        onPress={() => setSelectedNode(selectedNode?.id === n.id ? null : n)}
                      />
                      <SvgText x={n.x} y={n.y + 4} fontSize={7} fill={color}
                        textAnchor="middle" fontWeight="bold">
                        {n.id}
                      </SvgText>
                    </G>
                  );
                })}

                {/* Slip surface label */}
                <SvgText x={SVG_W * 0.7} y={62} fontSize={8} fill="rgba(232,64,64,0.8)" textAnchor="middle">
                  Slip Surface (predicted)
                </SvgText>

                {/* Elevation labels */}
                <SvgText x={8} y={170} fontSize={8} fill="rgba(255,255,255,0.3)">370m</SvgText>
                <SvgText x={8} y={100} fontSize={8} fill="rgba(255,255,255,0.3)">420m</SvgText>
                <SvgText x={8} y={40}  fontSize={8} fill="rgba(255,255,255,0.3)">480m</SvgText>
              </Svg>

              {/* Legend */}
              <View style={s.legend}>
                {[
                  { color: '#E84040', label: 'Critical (FoS < 1.3)' },
                  { color: '#F5A623', label: 'Warning (1.3–1.5)' },
                  { color: '#2ECC71', label: 'Stable (FoS > 1.5)' },
                ].map(l => (
                  <View key={l.label} style={s.legendItem}>
                    <View style={[s.legendDot, { backgroundColor: l.color }]} />
                    <Text style={s.legendTxt}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Selected Node Detail */}
            {selectedNode && (
              <View style={[s.card, { borderColor: NODE_COLOR[selectedNode.status] + '55' }]}>
                <View style={s.cardHead}>
                  <View style={[s.nodeColorDot, { backgroundColor: NODE_COLOR[selectedNode.status] }]} />
                  <Text style={s.cardTitle}>Node {selectedNode.id} — {selectedNode.label}</Text>
                  <TouchableOpacity onPress={() => setSelectedNode(null)} style={{ marginLeft: 'auto' }}>
                    <Ionicons name="close" size={16} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
                <View style={s.nodeGrid}>
                  {[
                    { label: 'Factor of Safety', value: jitter(selectedNode.fos, 0.01), unit: '' },
                    { label: 'Displacement', value: jitter(selectedNode.disp, 0.3), unit: 'mm/day' },
                    { label: 'Soil Moisture', value: jitter(selectedNode.moisture, 1), unit: '%' },
                    { label: 'Status', value: selectedNode.status.toUpperCase(), unit: '' },
                  ].map(m => (
                    <View key={m.label} style={s.nodeMetric}>
                      <Text style={s.nodeLabel}>{m.label}</Text>
                      <Text style={[s.nodeValue, m.label === 'Status' && { color: NODE_COLOR[selectedNode.status] }]}>
                        {m.value}{m.unit ? ` ${m.unit}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Global Metrics */}
            <View style={s.metricsGrid}>
              {METRICS.map(m => (
                <View key={m.label} style={[s.metricCard, { borderColor: Colors.status[m.status as 'critical' | 'warning' | 'safe'] + '44' }]}>
                  <Ionicons name={m.icon as any} size={18} color={Colors.status[m.status as 'critical' | 'warning' | 'safe']} />
                  <Text style={[s.metricValue, { color: Colors.status[m.status as 'critical' | 'warning' | 'safe'] }]}>
                    {m.value}<Text style={s.metricUnit}>{m.unit}</Text>
                  </Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'sensors' && (
          <>
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="radio" size={14} color={Colors.primary} />
                <Text style={s.cardTitle}>Live Sensor Network — 6 Nodes Active</Text>
              </View>
              {NODES.map(n => (
                <View key={n.id} style={s.sensorRow}>
                  <View style={[s.sensorStatus, { backgroundColor: NODE_COLOR[n.status] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.sensorName}>{n.id} — {n.label}</Text>
                    <View style={s.sensorMeta}>
                      <Text style={s.sensorVal}>FoS: <Text style={[s.sensorBold, { color: NODE_COLOR[n.status] }]}>{jitter(n.fos, 0.01)}</Text></Text>
                      <Text style={s.sensorVal}>Disp: <Text style={s.sensorBold}>{jitter(n.disp, 0.2)} mm/d</Text></Text>
                      <Text style={s.sensorVal}>H₂O: <Text style={s.sensorBold}>{jitter(n.moisture, 1)}%</Text></Text>
                    </View>
                  </View>
                  {/* Mini bar */}
                  <View style={s.fosBar}>
                    <View style={[s.fosBarFill, {
                      width: `${Math.min(100, (n.fos / 2.5) * 100)}%`,
                      backgroundColor: NODE_COLOR[n.status],
                    }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Rainfall card */}
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="rainy" size={14} color={Colors.primary} />
                <Text style={s.cardTitle}>Antecedent Rainfall — 7 Day</Text>
              </View>
              {[
                { day: 'Day -6', mm: 8, pct: 16 },
                { day: 'Day -5', mm: 22, pct: 44 },
                { day: 'Day -4', mm: 14, pct: 28 },
                { day: 'Day -3', mm: 38, pct: 76 },
                { day: 'Day -2', mm: 47, pct: 94 },
                { day: 'Day -1', mm: 31, pct: 62 },
                { day: 'Today', mm: 19, pct: 38 },
              ].map(r => (
                <View key={r.day} style={s.rainRow}>
                  <Text style={s.rainDay}>{r.day}</Text>
                  <View style={s.rainBarBg}>
                    <View style={[s.rainBarFill, { width: `${r.pct}%`, backgroundColor: r.mm > 40 ? Colors.status.critical : Colors.primary }]} />
                  </View>
                  <Text style={s.rainMm}>{r.mm}mm</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'history' && (
          <>
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="trending-down" size={14} color={Colors.status.critical} />
                <Text style={s.cardTitle}>FoS Degradation Trend — 5 Days</Text>
              </View>
              {/* Simple SVG chart */}
              <Svg width={CHART_W} height={CHART_H + 20}>
                <Defs>
                  <SvgGradient id="fosGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={Colors.status.critical} stopOpacity="0.3" />
                    <Stop offset="1" stopColor={Colors.status.critical} stopOpacity="0" />
                  </SvgGradient>
                </Defs>
                {/* Gridlines */}
                {[0.25, 0.5, 0.75, 1].map(f => (
                  <Line key={f}
                    x1={0} y1={CHART_H * f}
                    x2={CHART_W} y2={CHART_H * f}
                    stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                ))}
                {/* FoS line */}
                {HISTORY.map((h, i) => {
                  if (i === 0) return null;
                  const prev = HISTORY[i - 1];
                  const x1 = (CHART_W / (HISTORY.length - 1)) * (i - 1);
                  const x2 = (CHART_W / (HISTORY.length - 1)) * i;
                  const yScale = (fos: number) => CHART_H - ((fos - 1) / 1.5) * CHART_H;
                  return (
                    <Line key={i}
                      x1={x1} y1={yScale(prev.fos)}
                      x2={x2} y2={yScale(h.fos)}
                      stroke={Colors.status.critical} strokeWidth={2.5} />
                  );
                })}
                {/* Points + labels */}
                {HISTORY.map((h, i) => {
                  const x = (CHART_W / (HISTORY.length - 1)) * i;
                  const y = CHART_H - ((h.fos - 1) / 1.5) * CHART_H;
                  return (
                    <G key={i}>
                      <Circle cx={x} cy={y} r={4} fill={Colors.status.critical} />
                      <SvgText x={x} y={CHART_H + 14} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="middle">
                        {h.t}
                      </SvgText>
                      <SvgText x={x} y={y - 8} fontSize={9} fill={Colors.status.critical} textAnchor="middle">
                        {h.fos}
                      </SvgText>
                    </G>
                  );
                })}
                {/* Failure threshold line */}
                <Line x1={0} y1={CHART_H * 0.88} x2={CHART_W} y2={CHART_H * 0.88}
                  stroke="rgba(232,64,64,0.4)" strokeWidth={1} strokeDasharray="6,3" />
                <SvgText x={CHART_W - 4} y={CHART_H * 0.84} fontSize={8}
                  fill="rgba(232,64,64,0.6)" textAnchor="end">Failure ≤ 1.0</SvgText>
              </Svg>
            </View>

            {/* Historical event log */}
            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="time" size={14} color={Colors.primary} />
                <Text style={s.cardTitle}>Event Log</Text>
              </View>
              {[
                { time: '2h ago',  icon: 'warning',         color: Colors.status.critical, msg: 'Crown sensor S1 exceeded 10mm/day threshold' },
                { time: '6h ago',  icon: 'water',           color: Colors.status.warning,  msg: 'Soil moisture exceeded 80% at S1 (crown)' },
                { time: '14h ago', icon: 'trending-up',     color: Colors.status.warning,  msg: 'FoS declined below 1.3 — monitoring elevated' },
                { time: '1d ago',  icon: 'rainy',           color: Colors.primary,         msg: '47mm rainfall recorded — highest in 30 days' },
                { time: '2d ago',  icon: 'analytics',       color: Colors.status.safe,     msg: 'Routine calibration completed — all sensors OK' },
              ].map((e, i) => (
                <View key={i} style={s.logRow}>
                  <View style={[s.logIcon, { backgroundColor: e.color + '22' }]}>
                    <Ionicons name={e.icon as any} size={13} color={e.color} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={s.logMsg}>{e.msg}</Text>
                    <Text style={s.logTime}>{e.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border.subtle,
  },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.text.tertiary, marginTop: 1 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.status.safeBg, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.status.safeBorder, paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.safe },
  liveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.status.safe, letterSpacing: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.bg.secondary,
    borderBottomWidth: 1, borderBottomColor: Colors.border.default,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Colors.primary },
  tabTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.tertiary },
  tabTxtOn: { color: Colors.primary },
  scroll: { padding: 16, gap: 12 },

  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.status.criticalBg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.status.criticalBorder, padding: Spacing.md,
  },
  alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.status.critical },
  alertTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.status.critical },
  alertSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 2 },

  card: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },

  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary },

  nodeColorDot: { width: 8, height: 8, borderRadius: 4 },
  nodeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  nodeMetric: { width: '45%', gap: 2 },
  nodeLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  nodeValue: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '47%', backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    borderWidth: 1, padding: Spacing.md, gap: 5, alignItems: 'flex-start',
  },
  metricValue: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  metricUnit: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  metricLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary },

  sensorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border.subtle,
  },
  sensorStatus: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  sensorName: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.primary },
  sensorMeta: { flexDirection: 'row', gap: 12, marginTop: 2 },
  sensorVal: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  sensorBold: { fontFamily: FontFamily.semiBold, color: Colors.text.primary },
  fosBar: {
    width: 50, height: 4, backgroundColor: Colors.bg.secondary, borderRadius: 2, overflow: 'hidden',
  },
  fosBarFill: { height: '100%', borderRadius: 2 },

  rainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rainDay: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, width: 52 },
  rainBarBg: { flex: 1, height: 6, backgroundColor: Colors.bg.secondary, borderRadius: 3, overflow: 'hidden' },
  rainBarFill: { height: '100%', borderRadius: 3 },
  rainMm: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.primary, width: 36, textAlign: 'right' },

  logRow: { flexDirection: 'row', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  logIcon: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  logMsg: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.primary, lineHeight: 16 },
  logTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
});
