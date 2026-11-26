import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon as SvgPolygon, Circle as SvgCircle, Rect, Path, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_ALERTS } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 400;

const SECTORS = [
  { id: 's1', name: 'NH-29 Sector 4A', fos: 0.88, fill: 'rgba(239, 68, 68, 0.35)', stroke: '#EF4444', points: '80,180 180,120 260,190 170,260 90,230', status: 'CRITICAL FAILURE' },
  { id: 's2', name: 'Tuivai Embankment', fos: 1.12, fill: 'rgba(245, 158, 11, 0.30)', stroke: '#F59E0B', points: '240,80 320,50 380,110 310,160 250,120', status: 'MARGINAL CREEP' },
  { id: 's3', name: 'Tlawng Riverbank', fos: 1.31, fill: 'rgba(245, 158, 11, 0.20)', stroke: '#F59E0B', points: '40,260 140,240 210,330 110,370 30,310', status: 'STABILITY WATCH' },
  { id: 's4', name: 'Champhai Ridge', fos: 1.87, fill: 'rgba(16, 185, 129, 0.20)', stroke: '#10B981', points: '280,220 370,180 390,280 300,320', status: 'STABLE' },
];

type LayerKey = 'fos' | 'infra' | 'evac';

export default function OfficialMap() {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ fos: true, infra: true, evac: false });
  const [selected, setSelected] = useState<typeof SECTORS[0] | null>(SECTORS[0]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Terrain Risk Twin Map</Text>
          <Text style={s.sub}>Dynamic FoS Vector Mesh · NH-29 Corridor</Text>
        </View>
        <View style={s.statusTag}>
          <View style={s.statusDot} />
          <Text style={s.statusTxt}>TELEMETRY LIVE</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* Vector Digital Twin Map Viewport */}
        <View style={s.mapContainer}>
          <Svg width={width} height={MAP_HEIGHT} style={s.svgMap}>
            {/* Dark Terrain Background */}
            <Rect width="100%" height="100%" fill="#0A0C10" />

            {/* Grid Mesh lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <Path key={`v-${i}`} d={`M ${i * 42},0 L ${i * 42},${MAP_HEIGHT}`} stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <Path key={`h-${i}`} d={`M 0,${i * 45} L ${width},${i * 45}`} stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            ))}

            {/* Contour Terrain Elevation Lines */}
            <Path d="M 0,50 Q 150,10 300,70 T 400,30" stroke="#171E2C" strokeWidth="1.5" fill="none" />
            <Path d="M 0,160 Q 180,100 320,180 T 400,140" stroke="#1E283A" strokeWidth="1.5" fill="none" />
            <Path d="M 0,270 Q 140,210 280,290 T 400,240" stroke="#171E2C" strokeWidth="1.5" fill="none" />

            {/* Sector Polygons */}
            {layers.fos && SECTORS.map(sec => (
              <G key={sec.id} onPress={() => setSelected(sec)}>
                <SvgPolygon
                  points={sec.points}
                  fill={sec.fill}
                  stroke={sec.stroke}
                  strokeWidth={selected?.id === sec.id ? "3" : "1.5"}
                  strokeDasharray={sec.fos < 1.0 ? "6,3" : undefined}
                />
              </G>
            ))}

            {/* Critical Alert Pins */}
            <G transform="translate(170, 190)">
              <SvgCircle r="16" fill="rgba(239, 68, 68, 0.3)" stroke="#EF4444" strokeWidth="1.5" />
              <SvgCircle r="6" fill="#EF4444" />
              <SvgText x="-24" y="-22" fill="#EF4444" fontSize="10" fontWeight="bold">
                FoS 0.88
              </SvgText>
            </G>

            <G transform="translate(290, 110)">
              <SvgCircle r="12" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" strokeWidth="1.5" />
              <SvgCircle r="4" fill="#F59E0B" />
            </G>
          </Svg>

          {/* Layer toggle controls overlay */}
          <View style={s.layerPanel}>
            {(['fos', 'infra', 'evac'] as LayerKey[]).map(k => (
              <TouchableOpacity
                key={k}
                style={[s.layerBtn, layers[k] && s.layerBtnOn]}
                onPress={() => setLayers(prev => ({ ...prev, [k]: !prev[k] }))}>
                <Text style={[s.layerTxt, layers[k] && s.layerTxtOn]}>
                  {k === 'fos' ? 'FoS Mesh' : k === 'infra' ? 'Infrastructure' : 'Evac Routes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Legend */}
          <View style={s.legend}>
            {[
              { color: Colors.status.critical, label: 'Critical FoS < 1.0' },
              { color: Colors.status.warning, label: 'Warning 1.0–1.5' },
              { color: Colors.status.safe, label: 'Stable > 1.5' },
            ].map(item => (
              <View key={item.label} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: item.color }]} />
                <Text style={s.legendTxt}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected Sector Details Box */}
        {selected && (
          <View style={s.popup}>
            <View style={s.popupHeader}>
              <Text style={s.popupName}>{selected.name}</Text>
              <Text style={[s.popupFos, { color: selected.stroke }]}>
                FoS {selected.fos.toFixed(2)}
              </Text>
            </View>

            <Text style={[s.popupStatus, { color: selected.stroke }]}>
              {selected.status}
            </Text>

            <View style={s.sectorMetaRow}>
              <View style={s.metaPill}>
                <Ionicons name="alert-circle-outline" size={12} color={Colors.text.tertiary} />
                <Text style={s.metaPillTxt}>
                  {selected.fos < 1.0 ? 'Time to Failure: ~45 min' : 'Monitoring Normal'}
                </Text>
              </View>
              <View style={s.metaPill}>
                <Ionicons name="people-outline" size={12} color={Colors.text.tertiary} />
                <Text style={s.metaPillTxt}>Pop: 1,840</Text>
              </View>
            </View>
          </View>
        )}
      </View>
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
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: 1 },
  statusTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.status.infoBorder, backgroundColor: Colors.primaryBg,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  statusTxt: { fontFamily: FontFamily.bold, fontSize: 10, color: Colors.primary, letterSpacing: 0.5 },
  mapContainer: { height: MAP_HEIGHT, position: 'relative', backgroundColor: '#0A0C10' },
  svgMap: { width: '100%', height: '100%' },
  layerPanel: { position: 'absolute', top: 12, left: 12, gap: 6 },
  layerBtn: {
    backgroundColor: 'rgba(13,15,20,0.88)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border.default, paddingHorizontal: 10, paddingVertical: 5,
  },
  layerBtnOn: { backgroundColor: Colors.primaryBg, borderColor: Colors.status.infoBorder },
  layerTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.tertiary },
  layerTxtOn: { color: Colors.primary },
  legend: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(13,15,20,0.9)', borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.default, padding: 8, gap: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary },
  popup: {
    flex: 1, backgroundColor: Colors.bg.card, margin: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: 6, justifyContent: 'center',
  },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popupName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  popupFos: { fontFamily: FontFamily.bold, fontSize: FontSize.base },
  popupStatus: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 0.8 },
  sectorMetaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.bg.secondary,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border.subtle,
  },
  metaPillTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.secondary },
});
