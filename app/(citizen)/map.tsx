import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon, Polyline, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../src/hooks/useLocation';
import { SHELTERS } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const DANGER_ZONE = [
  { latitude: 23.7200, longitude: 92.7100 },
  { latitude: 23.7250, longitude: 92.7220 },
  { latitude: 23.7180, longitude: 92.7250 },
  { latitude: 23.7140, longitude: 92.7160 },
];
const SAFE_ROUTE = [
  { latitude: 23.7270, longitude: 92.7178 },
  { latitude: 23.7295, longitude: 92.7210 },
  { latitude: 23.7330, longitude: 92.7240 },
  { latitude: 23.7367, longitude: 92.7178 },
];

export default function CitizenMap() {
  const { coords, isLoading } = useLocation();
  const [offlineMode, setOfflineMode] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.5, duration: 1300, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0.5, duration: 1300, useNativeDriver: true }),
    ])).start();
  }, []);

  const region = coords
    ? { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }
    : { latitude: 23.7271, longitude: 92.7176, latitudeDelta: 0.04, longitudeDelta: 0.04 };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={s.header}>
        <Text style={s.title}>Evacuation Map</Text>
        <TouchableOpacity
          style={[s.offlineBtn, offlineMode && s.offlineBtnOn]}
          onPress={() => setOfflineMode(!offlineMode)}>
          <Ionicons name={offlineMode ? 'cloud-offline' : 'cloud-done-outline'} size={13}
            color={offlineMode ? Colors.status.warning : Colors.status.safe} />
          <Text style={[s.offlineTxt, { color: offlineMode ? Colors.status.warning : Colors.status.safe }]}>
            {offlineMode ? 'OFFLINE' : 'ONLINE'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={s.loadingTxt}>Acquiring GPS lock...</Text>
        </View>
      ) : (
        <MapView style={s.map} region={region} mapType="hybrid"
          showsUserLocation showsMyLocationButton={false} showsCompass>
          <Polygon coordinates={DANGER_ZONE} fillColor="rgba(232,64,64,0.22)"
            strokeColor="rgba(232,64,64,0.9)" strokeWidth={2} />
          <Polyline coordinates={SAFE_ROUTE} strokeColor={Colors.status.safe} strokeWidth={3} />
          {SHELTERS.map(sh => (
            <Marker key={sh.id} coordinate={{ latitude: sh.lat, longitude: sh.lng }}
              title={sh.name} description={`Capacity: ${sh.capacity}`}>
              <View style={s.shelterPin}>
                <Ionicons name="home" size={11} color={Colors.status.safe} />
              </View>
            </Marker>
          ))}
          {coords && (
            <Circle center={{ latitude: coords.latitude, longitude: coords.longitude }}
              radius={60} fillColor="rgba(79,110,247,0.12)"
              strokeColor={Colors.primary} strokeWidth={1.5} />
          )}
        </MapView>
      )}

      {/* Bottom panel */}
      <View style={s.panel}>
        <View style={s.routeList}>
          {[
            { color: Colors.status.safe, label: 'Safe Route: Ridge Trail North (~850m)' },
            { color: Colors.status.critical, label: 'Danger Zone: Predicted Debris Path' },
            { color: Colors.status.info, label: `Safe Shelter: ${SHELTERS[0].name}` },
          ].map(item => (
            <View key={item.label} style={s.routeItem}>
              <View style={[s.routeDot, { backgroundColor: item.color }]} />
              <Text style={s.routeTxt}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.offlineNote}>
          <Ionicons name="checkmark-circle" size={13} color={Colors.status.safe} />
          <Text style={s.offlineNoteTxt}>Navigation available 100% offline · P2P Mesh enabled</Text>
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
  offlineBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.status.safeBorder, backgroundColor: Colors.status.safeBg,
  },
  offlineBtnOn: { borderColor: Colors.status.warningBorder, backgroundColor: Colors.status.warningBg },
  offlineTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 0.5 },
  map: { flex: 1 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: Colors.bg.secondary },
  loadingTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  shelterPin: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.status.safeBg,
    borderWidth: 1.5, borderColor: Colors.status.safe, justifyContent: 'center', alignItems: 'center',
  },
  panel: {
    backgroundColor: Colors.bg.secondary, borderTopWidth: 1, borderTopColor: Colors.border.default,
    padding: Spacing.md, gap: 10,
  },
  routeList: { gap: 5 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 7, height: 7, borderRadius: 4 },
  routeTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
  offlineNote: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border.subtle,
  },
  offlineNoteTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.safe },
});
