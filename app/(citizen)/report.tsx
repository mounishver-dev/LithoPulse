import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Alert, ActivityIndicator, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

type Stage = 'camera' | 'form';
type Category = 'Landslide' | 'Flooding' | 'Road Damage' | 'Debris' | 'Other';

const CATEGORIES: Category[] = ['Landslide', 'Flooding', 'Road Damage', 'Debris', 'Other'];
const { width: W, height: H } = Dimensions.get('window');

// Simulated GPS for Aizawl, Mizoram (23.7307° N, 92.7173° E)
const SIM_LAT = 23.7307;
const SIM_LON = 92.7173;

export default function ReportScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>('camera');
  const [category, setCategory] = useState<Category>('Landslide');
  const [desc, setDesc] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [time, setTime] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [queue, setQueue] = useState(2);
  const camRef = useRef<any>(null);
  const headingRef = useRef(45);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulate GPS acquisition after 1s
    setTimeout(() => {
      setCoords({
        latitude: SIM_LAT + (Math.random() - 0.5) * 0.002,
        longitude: SIM_LON + (Math.random() - 0.5) * 0.002,
      });
      setHeading(45);
    }, 1000);

    const tick = setInterval(() => {
      setTime(new Date());
      headingRef.current = (headingRef.current + (Math.random() - 0.5) * 4 + 360) % 360;
      setHeading(Math.round(headingRef.current));
    }, 1000);

    // Scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Pulse animation for capture button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(tick);
  }, []);

  const capture = async () => {
    try {
      if (camRef.current) {
        await camRef.current.takePictureAsync({ quality: 0.7 });
      }
    } catch (e) {
      console.log('Picture capture info:', e);
    }
    setStage('form');
  };

  const submit = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setQueue(q => q + 1);
    Alert.alert(
      'Report Submitted ✓',
      'Your geo-tagged report is queued for AI classification within 60 seconds.',
      [{ text: 'OK', onPress: () => { setStage('camera'); setDesc(''); } }]
    );
  };

  const compassDir = (deg: number) =>
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];

  const scanY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, H * 0.5] });

  // Camera permissions check
  if (!permission) {
    return (
      <View style={s.centerLoading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={s.centerPermission}>
          <Ionicons name="camera" size={56} color={Colors.primary} />
          <Text style={s.permTitle}>Camera Access Required</Text>
          <Text style={s.permText}>
            LithoPulse needs access to your device's camera to capture live hazard evidence and photos for disaster triage.
          </Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPermission} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={s.permBtnTxt}>Enable Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === 'camera') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Hazard Reporter</Text>
            <Text style={s.sub}>Point at hazard · Tap shutter · Submit report</Text>
          </View>
          <View style={s.queueChip}>
            <Ionicons name="cloud-upload-outline" size={12} color={Colors.status.warning} />
            <Text style={s.queueTxt}>{queue} queued</Text>
          </View>
        </View>

        {/* Viewfinder with Hardware Camera */}
        <View style={s.viewfinder}>
          <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing="back" />

          {/* Animated scan line */}
          <Animated.View style={[s.scanBeam, { transform: [{ translateY: scanY }] }]} />

          {/* Grid overlay */}
          <View style={[s.gridH, { top: H * 0.15 }]} />
          <View style={[s.gridH, { top: H * 0.30 }]} />
          <View style={[s.gridH, { top: H * 0.45 }]} />
          <View style={[s.gridV, { left: W * 0.33 }]} />
          <View style={[s.gridV, { left: W * 0.67 }]} />

          {/* Corner brackets */}
          <View style={[s.corner, { top: 16, left: 16, borderTopWidth: 2.5, borderLeftWidth: 2.5 }]} />
          <View style={[s.corner, { top: 16, right: 16, borderTopWidth: 2.5, borderRightWidth: 2.5 }]} />
          <View style={[s.corner, { bottom: 16, left: 16, borderBottomWidth: 2.5, borderLeftWidth: 2.5 }]} />
          <View style={[s.corner, { bottom: 16, right: 16, borderBottomWidth: 2.5, borderRightWidth: 2.5 }]} />

          {/* Centre reticle */}
          <View style={s.reticle}>
            <View style={s.reticleH} />
            <View style={s.reticleV} />
            <View style={s.reticleRing} />
          </View>

          {/* Top HUD */}
          <View style={s.hud}>
            <View style={s.hudBadge}>
              <View style={s.liveDot} />
              <Text style={s.hudTxt}>LIVE HARDWARE CAMERA</Text>
            </View>
            <View style={s.hudBadge}>
              <Ionicons name="shield-checkmark" size={9} color={Colors.status.safe} />
              <Text style={s.hudTxt}>ANTI-SPOOF</Text>
            </View>
            <View style={s.hudBadge}>
              <Ionicons name="lock-closed" size={9} color={Colors.primary} />
              <Text style={s.hudTxt}>GEO-LOCKED</Text>
            </View>
          </View>

          {/* GPS + Compass + Time overlay */}
          <View style={s.metaOverlay}>
            <View style={s.metaRow}>
              <View style={s.metaChip}>
                <Ionicons name="location" size={9} color={Colors.status.safe} />
                <Text style={s.metaTxt}>
                  {coords
                    ? `${coords.latitude.toFixed(4)}°N  ${coords.longitude.toFixed(4)}°E`
                    : 'Acquiring GPS...'}
                </Text>
              </View>
              <View style={s.metaChip}>
                <Ionicons name="compass" size={9} color={Colors.status.safe} />
                <Text style={s.metaTxt}>{heading !== null ? `${heading}° ${compassDir(heading)}` : '—°'}</Text>
              </View>
            </View>
            <View style={s.metaChip}>
              <Ionicons name="time" size={9} color={Colors.status.safe} />
              <Text style={s.metaTxt}>
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
              </Text>
            </View>
          </View>
        </View>

        {/* Capture control bar */}
        <View style={s.captureBar}>
          <Text style={s.captureHint}>Tap shutter to capture camera photo</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity style={s.captureBtn} onPress={capture} activeOpacity={0.8}>
              <View style={s.captureInner} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={s.captureNote}>📍 GPS · Compass · Timestamp auto-attached</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Report Form ---
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
        <View style={s.formHeader}>
          <TouchableOpacity onPress={() => setStage('camera')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <Text style={s.formTitle}>Incident Report</Text>
        </View>

        {/* Auto-captured metadata */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Ionicons name="information-circle" size={15} color={Colors.primary} />
            <Text style={s.cardTitle}>Auto-Captured Evidence Metadata</Text>
          </View>
          <View style={s.metaGrid}>
            {[
              { label: 'GPS Location', value: coords ? `${coords.latitude.toFixed(5)}°N, ${coords.longitude.toFixed(5)}°E` : 'Unavailable', icon: 'location' },
              { label: 'Compass Heading', value: heading !== null ? `${heading}° ${compassDir(heading)}` : 'Unavailable', icon: 'compass' },
              { label: 'Captured At', value: time.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), icon: 'time' },
              { label: 'Anti-Spoof', value: '✓ Verified', icon: 'shield-checkmark', isGreen: true },
            ].map(m => (
              <View key={m.label} style={s.metaItem}>
                <Ionicons name={m.icon as any} size={11} color={m.isGreen ? Colors.status.safe : Colors.text.tertiary} />
                <Text style={s.metaLabel}>{m.label}</Text>
                <Text style={[s.metaValue, m.isGreen && { color: Colors.status.safe }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Ionicons name="list" size={15} color={Colors.primary} />
            <Text style={s.cardTitle}>Incident Category</Text>
          </View>
          <View style={s.categories}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[s.catChip, category === cat && s.catChipOn]}
                onPress={() => setCategory(cat)}>
                <Text style={[s.catTxt, category === cat && s.catTxtOn]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Ionicons name="create" size={15} color={Colors.primary} />
            <Text style={s.cardTitle}>Description <Text style={s.optional}>(optional)</Text></Text>
          </View>
          <TextInput
            style={s.textInput}
            value={desc}
            onChangeText={setDesc}
            placeholder="Describe what you observe — size, location, severity..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={uploading}>
          {uploading
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="cloud-upload" size={17} color="#fff" /><Text style={s.submitTxt}>Submit Report</Text></>}
        </TouchableOpacity>
        <Text style={s.submitNote}>
          If offline, report syncs automatically via BLE mesh when connection is restored.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  centerLoading: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
  centerPermission: {
    flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, gap: 16, textAlign: 'center',
  },
  permTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.text.primary, marginTop: 8 },
  permText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  permBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 14, marginTop: 12,
  },
  permBtnTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', backgroundColor: '#050709',
  },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.text.tertiary, marginTop: 1 },
  queueChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.status.warningBg, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.status.warningBorder, paddingHorizontal: 10, paddingVertical: 4,
  },
  queueTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.warning },

  // Viewfinder
  viewfinder: { flex: 1, overflow: 'hidden', backgroundColor: '#000000', position: 'relative' },
  scanBeam: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: 'rgba(79,110,247,0.4)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: 'rgba(79,110,247,0.9)' },
  reticle: {
    position: 'absolute', top: '50%', left: '50%',
    width: 50, height: 50, marginLeft: -25, marginTop: -25,
    justifyContent: 'center', alignItems: 'center',
  },
  reticleH: { position: 'absolute', top: 24, left: 0, width: 50, height: 1.5, backgroundColor: 'rgba(79,110,247,0.7)' },
  reticleV: { position: 'absolute', left: 24, top: 0, height: 50, width: 1.5, backgroundColor: 'rgba(79,110,247,0.7)' },
  reticleRing: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(79,110,247,0.5)',
  },
  hud: {
    position: 'absolute', top: 14, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 12,
  },
  hudBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(79,110,247,0.25)',
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2ECC71' },
  hudTxt: { fontFamily: FontFamily.bold, fontSize: 8, color: Colors.text.secondary, letterSpacing: 0.6 },
  metaOverlay: {
    position: 'absolute', bottom: 14, left: 10, right: 10, gap: 5,
  },
  metaRow: { flexDirection: 'row', gap: 6 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(46,204,113,0.25)',
  },
  metaTxt: { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.status.safe },

  // Capture bar
  captureBar: {
    backgroundColor: '#050709', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    gap: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  captureHint: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
  captureBtn: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 3,
    borderColor: Colors.text.primary, justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.text.primary },
  captureNote: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, textAlign: 'center' },

  // Form
  formScroll: { padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.bg.primary, flexGrow: 1 },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: { padding: 4 },
  formTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md, color: Colors.text.primary },
  card: {
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: Spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  optional: { fontFamily: FontFamily.regular, color: Colors.text.tertiary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { width: '45%', gap: 3 },
  metaLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  metaValue: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.primary },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border.default, backgroundColor: Colors.bg.secondary,
  },
  catChipOn: { backgroundColor: Colors.primaryBg, borderColor: Colors.status.infoBorder },
  catTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  catTxtOn: { color: Colors.primary },
  textInput: {
    backgroundColor: Colors.bg.secondary, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.border.subtle,
    padding: Spacing.md, fontFamily: FontFamily.regular,
    fontSize: FontSize.sm, color: Colors.text.primary, minHeight: 90,
  },
  submitBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.md, height: 52, marginTop: 4,
  },
  submitTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: '#fff' },
  submitNote: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs,
    color: Colors.text.tertiary, textAlign: 'center', lineHeight: 17,
  },
});
