import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_ALERTS } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const SECTORS = [
  { id: 's1', fos: 0.88, fill: 'rgba(232,64,64,0.28)', stroke: 'rgba(232,64,64,0.85)', coords: [{ latitude: 23.720, longitude: 92.710 }, { latitude: 23.725, longitude: 92.722 }, { latitude: 23.718, longitude: 92.725 }, { latitude: 23.714, longitude: 92.716 }] },
  { id: 's2', fos: 1.12, fill: 'rgba(245,166,35,0.20)', stroke: 'rgba(245,166,35,0.75)', coords: [{ latitude: 24.228, longitude: 92.679 }, { latitude: 24.234, longitude: 92.689 }, { latitude: 24.229, longitude: 92.694 }, { latitude: 24.223, longitude: 92.685 }] },
  { id: 's3', fos: 1.31, fill: 'rgba(245,166,35,0.14)', stroke: 'rgba(245,166,35,0.55)', coords: [{ latitude: 22.886, longitude: 92.732 }, { latitude: 22.891, longitude: 92.741 }, { latitude: 22.887, longitude: 92.745 }, { latitude: 22.882, longitude: 92.737 }] },
  { id: 's4', fos: 1.87, fill: 'rgba(46,204,113,0.14)', stroke: 'rgba(46,204,113,0.45)', coords: [{ latitude: 23.460, longitude: 93.321 }, { latitude: 23.466, longitude: 93.330 }, { latitude: 23.462, longitude: 93.333 }, { latitude: 23.457, longitude: 93.325 }] },
];
type LayerKey = 'fos' | 'infra' | 'evac';

export default function OfficialMap() {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ fos: true, infra: true, evac: false });
  const [selected, setSelected] = useState<typeof SECTORS[0] | null>(null);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.title}>Terrain Risk Map</Text>
        <Text style={s.sub}>Dynamic FoS Overlay · NH-29</Text>
      </View>
      <View style={{ flex: 1 }}>
        <MapView style={s.map} mapType="terrain"
          initialRegion={{ latitude: 23.7271, longitude: 92.7176, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
          showsUserLocation showsCompass>
          {layers.fos && SECTORS.map(sec => (
            <Polygon key={sec.id} coordinates={sec.coords}
              fillColor={sec.fill} strokeColor={sec.stroke} strokeWidth={2}
              tappable onPress={() => setSelected(sec)} />
          ))}
          {MOCK_ALERTS.filter(a => a.threatLevel === 'critical').map(a => (
            <Marker key={a.id} coordinate={{ latitude: a.location.lat, longitude: a.location.lng }}
              title={a.sectorName} description={`FoS: ${a.fos} · ${a.timeToFailure}`}>
              <View style={s.critPin}>
                <Ionicons name="warning" size={12} color={Colors.status.critical} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Layer controls */}
        <View style={s.layerPanel}>
          {(['fos', 'infra', 'evac'] as LayerKey[]).map(k => (
            <TouchableOpacity key={k} style={[s.layerBtn, layers[k] && s.layerBtnOn]}
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

        {/* Sector popup */}
        {selected && (
          <View style={s.popup}>
            <View style={s.popupHeader}>
              <Text style={s.popupName}>Sector FoS: {selected.fos.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Ionicons name="close" size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={[s.popupStatus, { color: selected.fos < 1.0 ? Colors.status.critical : Colors.status.warning }]}>
              {selected.fos < 1.0 ? 'FAILURE IMMINENT' : 'MARGINAL STABILITY'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: 1 },
  map: { flex: 1 },
  layerPanel: { position: 'absolute', top: 12, left: 12, gap: 6 },
  layerBtn: { backgroundColor: 'rgba(13,15,20,0.85)', borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border.default, paddingHorizontal: 10, paddingVertical: 5 },
  layerBtnOn: { backgroundColor: Colors.primaryBg, borderColor: Colors.status.infoBorder },
  layerTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.tertiary },
  layerTxtOn: { color: Colors.primary },
  legend: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(13,15,20,0.88)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: 10, gap: 5 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary },
  critPin: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.status.criticalBg, borderWidth: 1, borderColor: Colors.status.critical, justifyContent: 'center', alignItems: 'center' },
  popup: { position: 'absolute', bottom: 12, right: 12, left: 130, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: 12, gap: 4 },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popupName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary, flex: 1 },
  popupStatus: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 0.5 },
});
