import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

const PEERS = [
  { id: 'p1', name: 'Device A', signal: 'Strong', hops: 1 },
  { id: 'p2', name: 'Device B', signal: 'Medium', hops: 1 },
  { id: 'p3', name: 'Relay C',  signal: 'Weak',   hops: 2 },
  { id: 'p4', name: 'Device D', signal: 'Strong', hops: 2 },
  { id: 'p5', name: 'Device E', signal: 'Medium', hops: 3 },
  { id: 'p6', name: 'Relay F',  signal: 'Strong', hops: 3 },
];

const sigColor = (s: string) => s === 'Strong' ? Colors.status.safe : s === 'Medium' ? Colors.status.warning : Colors.status.critical;

export default function MeshScreen() {
  const [cellStatus, setCellStatus] = useState<'online' | 'offline'>('online');
  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.stagger(700, [
      Animated.sequence([
        Animated.timing(r1, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(r1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(r2, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(r2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const rippleStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const, width: 76, height: 76, borderRadius: 38,
    borderWidth: 1.5, borderColor: Colors.primary,
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.title}>Network Status</Text>
        <Text style={s.sub}>P2P BLE Mesh connectivity</Text>

        {/* Cell status toggle */}
        <TouchableOpacity
          style={[s.statusCard, cellStatus === 'online' ? s.cardOnline : s.cardOffline]}
          onPress={() => setCellStatus(c => c === 'online' ? 'offline' : 'online')}>
          <View style={s.statusLeft}>
            <Ionicons name={cellStatus === 'online' ? 'cellular' : 'cellular-outline'} size={22}
              color={cellStatus === 'online' ? Colors.status.safe : Colors.status.critical} />
            <View>
              <Text style={[s.statusLabel, { color: cellStatus === 'online' ? Colors.status.safe : Colors.status.critical }]}>
                CELL TOWER {cellStatus.toUpperCase()}
              </Text>
              <Text style={s.statusSub}>
                {cellStatus === 'online' ? 'Standard network active · Mesh on standby' : 'MESH MODE ACTIVE · All traffic via BLE'}
              </Text>
            </View>
          </View>
          <Ionicons name="swap-horizontal-outline" size={16} color={Colors.text.tertiary} />
        </TouchableOpacity>

        {/* Visualization */}
        <View style={s.vizCard}>
          <View style={s.vizCenter}>
            <Animated.View style={rippleStyle(r1)} />
            <Animated.View style={rippleStyle(r2)} />
            <View style={s.deviceHub}>
              <Ionicons name="phone-portrait" size={20} color={Colors.primary} />
              <Text style={s.youLabel}>YOU</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            {[
              { val: `${PEERS.length}`, label: 'Peers' },
              { val: '3', label: 'Max Hops' },
              { val: 'Active', label: 'Status', color: Colors.status.safe },
            ].map((stat, i, arr) => (
              <React.Fragment key={stat.label}>
                <View style={s.stat}>
                  <Text style={[s.statVal, stat.color ? { color: stat.color } : {}]}>{stat.val}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.statDiv} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Peer list */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Connected Peers</Text>
          {PEERS.map(peer => (
            <View key={peer.id} style={s.peerRow}>
              <View style={[s.peerDot, { backgroundColor: sigColor(peer.signal) }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.peerName}>{peer.name}</Text>
                <Text style={s.peerMeta}>{peer.hops} hop{peer.hops > 1 ? 's' : ''} · {peer.signal} signal</Text>
              </View>
              <Ionicons name="bluetooth" size={14} color={Colors.primary} />
            </View>
          ))}
        </View>

        <View style={s.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={s.infoTxt}>
            When cell towers collapse, LithoPulse switches to BLE mesh. SOS beacons and evacuation alerts hop through up to 10 devices to reach rescue teams.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: -6 },
  statusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md },
  cardOnline: { backgroundColor: Colors.status.safeBg, borderColor: Colors.status.safeBorder },
  cardOffline: { backgroundColor: Colors.status.criticalBg, borderColor: Colors.status.criticalBorder },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  statusLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, letterSpacing: 0.4 },
  statusSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 2 },
  vizCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.lg, alignItems: 'center', gap: Spacing.md },
  vizCenter: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  deviceHub: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.primaryBg, borderWidth: 1.5, borderColor: Colors.status.infoBorder, justifyContent: 'center', alignItems: 'center', gap: 2 },
  youLabel: { fontFamily: FontFamily.bold, fontSize: 8, color: Colors.primary, letterSpacing: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, borderRadius: Radius.md, padding: Spacing.md, width: '100%' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.text.primary },
  statLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  statDiv: { width: 1, height: 30, backgroundColor: Colors.border.default },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  peerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.subtle, paddingHorizontal: Spacing.md, paddingVertical: 10 },
  peerDot: { width: 8, height: 8, borderRadius: 4 },
  peerName: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.primary },
  peerMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  infoCard: { flexDirection: 'row', gap: 8, backgroundColor: Colors.primaryBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.status.infoBorder, padding: Spacing.md, alignItems: 'flex-start' },
  infoTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1, lineHeight: 19 },
});
