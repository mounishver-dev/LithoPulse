import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon as SvgPolygon, Polyline as SvgPolyline, Circle as SvgCircle, Rect, Path, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../src/hooks/useLocation';
import { SHELTERS } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 380;

export default function CitizenMap() {
  const { coords, isLoading, address } = useLocation();
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<typeof SHELTERS[0] | null>(null);

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Tactical Evacuation Map</Text>
          <Text style={s.sub}>{address ? address.district : 'NH-29 Corridor · Sector 4A'}</Text>
        </View>
        <TouchableOpacity
          style={[s.offlineBtn, offlineMode && s.offlineBtnOn]}
          onPress={() => setOfflineMode(!offlineMode)}>
          <Ionicons
            name={offlineMode ? 'cloud-offline' : 'cloud-done-outline'}
            size={13}
            color={offlineMode ? Colors.status.warning : Colors.status.safe}
          />
          <Text style={[s.offlineTxt, { color: offlineMode ? Colors.status.warning : Colors.status.safe }]}>
            {offlineMode ? 'OFFLINE' : 'LIVE GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Viewport */}
      {isLoading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={s.loadingTxt}>Acquiring Satellite GPS Lock...</Text>
        </View>
      ) : (
        <View style={s.mapContainer}>
          <Svg width={width} height={MAP_HEIGHT} style={s.svgMap}>
            {/* Dark Tactical Grid Background */}
            <Rect width="100%" height="100%" fill="#0B0D12" />

            {/* Topo Contour Lines */}
            <Path d="M 0,60 Q 100,20 200,80 T 400,50" stroke="#1A202C" strokeWidth="1" fill="none" />
            <Path d="M 0,140 Q 120,100 240,160 T 400,120" stroke="#1E2638" strokeWidth="1.5" fill="none" />
            <Path d="M 0,220 Q 80,180 220,250 T 400,200" stroke="#1A202C" strokeWidth="1" fill="none" />
            <Path d="M 0,310 Q 150,260 280,320 T 400,290" stroke="#161C2A" strokeWidth="1" fill="none" />

            {/* Grid Mesh */}
            {Array.from({ length: 9 }).map((_, i) => (
              <Path key={`v-${i}`} d={`M ${i * 45},0 L ${i * 45},${MAP_HEIGHT}`} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <Path key={`h-${i}`} d={`M 0,${i * 50} L ${width},${i * 50}`} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}

            {/* Highway Line (NH-29) */}
            <Path d="M 10,340 C 90,280 140,210 210,170 C 280,130 310,80 390,30" stroke="#334155" strokeWidth="6" strokeLinecap="round" fill="none" />
            <Path d="M 10,340 C 90,280 140,210 210,170 C 280,130 310,80 390,30" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" fill="none" />

            {/* Danger Zone Polygon */}
            <SvgPolygon
              points="140,190 230,140 290,220 210,270 150,240"
              fill="rgba(239, 68, 68, 0.25)"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
            <SvgText x="180" y="215" fill="#EF4444" fontSize="10" fontWeight="bold" opacity={0.9}>
              DEBRIS RUNOUT ZONE
            </SvgText>

            {/* Safe Evacuation Route Polyline */}
            <SvgPolyline
              points="90,290 120,230 110,170 160,110 240,80 320,60"
              fill="none"
              stroke="#10B981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <SvgPolyline
              points="90,290 120,230 110,170 160,110 240,80 320,60"
              fill="none"
              stroke="#A7F3D0"
              strokeWidth="1.5"
              strokeDasharray="5,3"
            />

            {/* User GPS Location Marker */}
            <G transform="translate(90, 290)">
              <SvgCircle r="18" fill="rgba(79, 110, 247, 0.2)" stroke="#4F6EF7" strokeWidth="1" />
              <SvgCircle r="7" fill="#4F6EF7" stroke="#FFFFFF" strokeWidth="2" />
            </G>

            {/* Shelter Markers */}
            <G transform="translate(320, 60)">
              <SvgCircle r="14" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="2" />
              <SvgCircle r="5" fill="#10B981" />
              <SvgText x="-35" y="-18" fill="#10B981" fontSize="9" fontWeight="bold">
                SHELTER #1
              </SvgText>
            </G>

            <G transform="translate(240, 80)">
              <SvgCircle r="12" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1.5" />
              <SvgCircle r="4" fill="#10B981" />
            </G>
          </Svg>

          {/* Compass & Overlay Controls */}
          <View style={s.overlayControls}>
            <View style={s.compassBox}>
              <Ionicons name="compass-outline" size={22} color={Colors.primary} />
              <Text style={s.compassTxt}>N</Text>
            </View>
            <View style={s.badgeBox}>
              <View style={s.liveDot} />
              <Text style={s.badgeTxt}>VECTOR TWIN ACTIVE</Text>
            </View>
          </View>
        </View>
      )}

      {/* Route & Shelter Detail Panel */}
      <View style={s.panel}>
        <View style={s.routeList}>
          {[
            { color: Colors.status.safe, title: 'Recommended Evac Path', label: 'Ridge Trail North → Shelter #1 (~850m)' },
            { color: Colors.status.critical, title: 'Hazard Warning', label: 'Sector 4A Mudflow Zone (FoS 0.88)' },
            { color: Colors.status.info, title: 'Nearest Rescue Point', label: `${SHELTERS[0].name} (Cap: 400)` },
          ].map(item => (
            <View key={item.title} style={s.routeItem}>
              <View style={[s.routeDot, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.routeTitle}>{item.title}</Text>
                <Text style={s.routeTxt}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.offlineNote}>
          <Ionicons name="shield-checkmark" size={15} color={Colors.status.safe} />
          <Text style={s.offlineNoteTxt}>100% Standalone & Offline Ready · Zero API Dependency</Text>
        </View>
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
  offlineBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.status.safeBorder, backgroundColor: Colors.status.safeBg,
  },
  offlineBtnOn: { borderColor: Colors.status.warningBorder, backgroundColor: Colors.status.warningBg },
  offlineTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 0.5 },
  mapContainer: { height: MAP_HEIGHT, position: 'relative', backgroundColor: '#0B0D12' },
  svgMap: { width: '100%', height: '100%' },
  loadingBox: { height: MAP_HEIGHT, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: Colors.bg.secondary },
  loadingTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  overlayControls: {
    position: 'absolute', top: 12, left: 12, right: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    pointerEvents: 'none',
  },
  compassBox: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(13,15,20,0.85)', borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border.default,
  },
  compassTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.primary },
  badgeBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(13,15,20,0.85)', borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border.default,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.safe },
  badgeTxt: { fontFamily: FontFamily.bold, fontSize: 10, color: Colors.text.secondary, letterSpacing: 0.5 },
  panel: {
    flex: 1, backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.default,
    padding: Spacing.md, justifyContent: 'space-between',
  },
  routeList: { gap: Spacing.sm },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  routeTitle: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.tertiary },
  routeTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  offlineNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border.subtle,
  },
  offlineNoteTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.safe },
});
