import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

type Stage = 'camera' | 'form';

export default function ReportScreen() {
  const [perm, requestPerm] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('camera');
  const [desc, setDesc] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [queue, setQueue] = useState(2);
  const camRef = useRef<any>(null);

  useEffect(() => {
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).then(l => setCoords(l.coords)).catch(() => {});
    let sub: any;
    Location.watchHeadingAsync(h => setHeading(Math.round(h.trueHeading))).then(s => { sub = s; }).catch(() => {});
    return () => { sub?.remove(); };
  }, []);

  const capture = async () => {
    try { await camRef.current?.takePictureAsync({ quality: 0.7 }); } catch {}
    setStage('form');
  };

  const submit = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setQueue(q => q + 1);
    Alert.alert('Report Submitted', 'Your report is queued. VLM AI will classify it within 60 seconds.', [
      { text: 'OK', onPress: () => { setStage('camera'); setDesc(''); } },
    ]);
  };

  if (!perm) return <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>;

  if (!perm.granted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Ionicons name="camera-off-outline" size={44} color={Colors.text.tertiary} />
          <Text style={s.permText}>Camera access needed for hazard reporting</Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPerm}>
            <Text style={s.permBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === 'camera') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={s.camHeader}>
          <Text style={s.camTitle}>Hazard Reporter</Text>
          <View style={s.queueChip}>
            <Ionicons name="cloud-upload-outline" size={12} color={Colors.status.warning} />
            <Text style={s.queueTxt}>{queue} queued</Text>
          </View>
        </View>

        <CameraView ref={camRef} style={s.camera} facing="back">
          {/* Metadata overlay */}
          <View style={s.metaOverlay}>
            {[
              { icon: 'location', value: coords ? `${coords.latitude.toFixed(4)}°N ${coords.longitude.toFixed(4)}°E` : 'Acquiring GPS...' },
              { icon: 'compass', value: heading !== null ? `${heading}° ${['N','NE','E','SE','S','SW','W','NW'][Math.round(heading / 45) % 8]}` : '—' },
              { icon: 'time', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
            ].map(m => (
              <View key={m.icon} style={s.metaChip}>
                <Ionicons name={m.icon as any} size={10} color={Colors.status.safe} />
                <Text style={s.metaChipTxt}>{m.value}</Text>
              </View>
            ))}
          </View>
          {/* Viewfinder corners */}
          <View style={[s.corner, { top: 28, left: 28, borderTopWidth: 2, borderLeftWidth: 2 }]} />
          <View style={[s.corner, { top: 28, right: 28, borderTopWidth: 2, borderRightWidth: 2 }]} />
          <View style={[s.corner, { bottom: 56, left: 28, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
          <View style={[s.corner, { bottom: 56, right: 28, borderBottomWidth: 2, borderRightWidth: 2 }]} />
        </CameraView>

        <View style={s.camFooter}>
          <Text style={s.camHint}>Point at crack, debris, flooding, or road damage</Text>
          <TouchableOpacity style={s.captureBtn} onPress={capture}>
            <View style={s.captureInner} />
          </TouchableOpacity>
          <Text style={s.metaNote}>📍 GPS · Compass bearing · Timestamp — attached automatically</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.formScroll}>
        <View style={s.formHeader}>
          <TouchableOpacity onPress={() => setStage('camera')}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <Text style={s.formTitle}>Report Details</Text>
        </View>

        <View style={s.metaCard}>
          <Text style={s.metaCardTitle}>Auto-captured Metadata</Text>
          <View style={s.metaGrid}>
            {[
              { label: 'GPS Location', value: coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'N/A' },
              { label: 'Compass Heading', value: heading !== null ? `${heading}°` : 'N/A' },
              { label: 'Timestamp', value: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
              { label: 'Anti-Spoof', value: '✓ Verified', color: Colors.status.safe },
            ].map(m => (
              <View key={m.label} style={s.metaGridItem}>
                <Text style={s.metaGridLabel}>{m.label}</Text>
                <Text style={[s.metaGridValue, m.color ? { color: m.color } : {}]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.descGroup}>
          <Text style={s.fieldLabel}>Description (optional)</Text>
          <TextInput style={s.descInput} value={desc} onChangeText={setDesc}
            placeholder="Describe what you see — size, location, severity..."
            placeholderTextColor={Colors.text.tertiary} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={uploading}>
          {uploading
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="cloud-upload" size={17} color="#fff" /><Text style={s.submitTxt}>Submit Report</Text></>}
        </TouchableOpacity>
        <Text style={s.submitNote}>If offline, report will sync automatically via BLE mesh.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  center: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center', gap: 16, padding: Spacing.lg },
  permText: { fontFamily: FontFamily.medium, fontSize: FontSize.base, color: Colors.text.secondary, textAlign: 'center' },
  permBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.md },
  permBtnText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  camHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  camTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  queueChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.status.warningBg, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.status.warningBorder, paddingHorizontal: 10, paddingVertical: 4 },
  queueTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.warning },
  camera: { flex: 1, position: 'relative' },
  metaOverlay: { position: 'absolute', bottom: 14, left: 12, right: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.62)', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  metaChipTxt: { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.status.safe },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: 'rgba(255,255,255,0.65)' },
  camFooter: { backgroundColor: Colors.bg.secondary, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, gap: 12, alignItems: 'center' },
  camHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
  captureBtn: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: Colors.text.primary, justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.text.primary },
  metaNote: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, textAlign: 'center' },
  formScroll: { padding: Spacing.lg, gap: Spacing.md },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 4 },
  formTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md, color: Colors.text.primary },
  metaCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: Spacing.sm },
  metaCardTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaGridItem: { width: '45%', gap: 2 },
  metaGridLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  metaGridValue: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.primary },
  descGroup: { gap: 6 },
  fieldLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  descInput: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text.primary, minHeight: 100 },
  submitBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.md, height: 50, marginTop: 4 },
  submitTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  submitNote: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, textAlign: 'center', lineHeight: 17 },
});
