import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_INCIDENTS, Incident } from '../../src/data/mockData';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

type Col = 'pending' | 'verified' | 'dismissed';
const COLS: { key: Col; label: string; color: string }[] = [
  { key: 'pending',   label: 'Pending',   color: Colors.status.warning },
  { key: 'verified',  label: 'Verified',  color: Colors.status.safe },
  { key: 'dismissed', label: 'Dismissed', color: Colors.text.tertiary },
];

const confColor = (c: string) => {
  const n = parseInt(c);
  return n >= 80 ? Colors.status.critical : n >= 60 ? Colors.status.warning : Colors.text.tertiary;
};

export default function KanbanScreen() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [col, setCol] = useState<Col>('pending');

  const move = (id: string, to: Col) => setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: to } : i));
  const counts = { pending: incidents.filter(i => i.status === 'pending').length, verified: incidents.filter(i => i.status === 'verified').length, dismissed: incidents.filter(i => i.status === 'dismissed').length };
  const filtered = incidents.filter(i => i.status === col);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.title}>VLM Incident Board</Text>
        <Text style={s.sub}>Crowdsourced · AI-Triaged (Qwen 2.5)</Text>
      </View>

      {/* Column tabs */}
      <View style={s.colBar}>
        {COLS.map(c => (
          <TouchableOpacity key={c.key} style={[s.colTab, col === c.key && { borderBottomColor: c.color, borderBottomWidth: 2 }]}
            onPress={() => setCol(c.key)}>
            <Text style={[s.colTabTxt, col === c.key && { color: c.color }]}>{c.label}</Text>
            <View style={[s.colBadge, col === c.key && { backgroundColor: c.color + '22', borderColor: c.color + '44' }]}>
              <Text style={[s.colBadgeTxt, col === c.key && { color: c.color }]}>{counts[c.key]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={Colors.text.tertiary} />
            <Text style={s.emptyTxt}>No {col} incidents</Text>
          </View>
        ) : (
          <React.Fragment>
            {filtered.map(inc => (
              <View key={inc.id} style={s.card}>
                {/* Photo placeholder */}
                <View style={s.photo}>
                  <Ionicons name="image-outline" size={22} color={Colors.text.tertiary} />
                  <Text style={s.photoTxt}>Photo</Text>
                </View>
                <View style={s.cardContent}>
                  <View style={s.cardTop}>
                    <Text style={[s.confidence, { color: confColor(inc.confidence) }]}>{inc.confidence} conf.</Text>
                    <Text style={s.time}>{inc.reportedAt}</Text>
                  </View>
                  <Text style={s.tag}>{inc.tag}</Text>
                  <Text style={s.desc} numberOfLines={2}>{inc.description}</Text>
                  <View style={s.meta}>
                    {[
                      { icon: 'person-outline', val: inc.reporterType },
                      { icon: 'location-outline', val: inc.district },
                    ].map(m => (
                      <View key={m.icon} style={s.metaItem}>
                        <Ionicons name={m.icon as any} size={10} color={Colors.text.tertiary} />
                        <Text style={s.metaTxt}>{m.val}</Text>
                      </View>
                    ))}
                  </View>
                  {col === 'pending' && (
                    <View style={s.actions}>
                      <TouchableOpacity style={s.verifyBtn} onPress={() => move(inc.id, 'verified')}>
                        <Ionicons name="checkmark" size={12} color={Colors.status.safe} />
                        <Text style={s.verifyTxt}>Verify</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.dismissBtn} onPress={() => move(inc.id, 'dismissed')}>
                        <Ionicons name="close" size={12} color={Colors.text.tertiary} />
                        <Text style={s.dismissTxt}>Dismiss</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.mapBtn}>
                        <Ionicons name="map-outline" size={12} color={Colors.primary} />
                        <Text style={s.mapTxt}>Map</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {col === 'verified' && (
                    <View style={s.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color={Colors.status.safe} />
                      <Text style={s.verifiedTxt}>Verified · Placed on map</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </React.Fragment>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, gap: 2 },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  colBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  colTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 6, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  colTabTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.tertiary },
  colBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: Colors.bg.elevated, borderWidth: 1, borderColor: Colors.border.default, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  colBadgeTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.text.tertiary },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: 12 },
  emptyTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text.tertiary },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, flexDirection: 'row', overflow: 'hidden' },
  photo: { width: 70, backgroundColor: Colors.bg.elevated, justifyContent: 'center', alignItems: 'center', gap: 3 },
  photoTxt: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.text.tertiary },
  cardContent: { flex: 1, padding: Spacing.md, gap: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  confidence: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  time: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  tag: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  desc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.secondary, lineHeight: 16 },
  meta: { flexDirection: 'row', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  actions: { flexDirection: 'row', gap: 6, marginTop: 2 },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.status.safeBg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.status.safeBorder, paddingHorizontal: 9, paddingVertical: 4 },
  verifyTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.status.safe },
  dismissBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bg.secondary, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border.default, paddingHorizontal: 9, paddingVertical: 4 },
  dismissTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.text.tertiary },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryBg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.status.infoBorder, paddingHorizontal: 9, paddingVertical: 4 },
  mapTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.xs, color: Colors.primary },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.safe },
});
