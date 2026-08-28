import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Switch, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../../src/constants/theme';

type Lang = 'Mizo' | 'Assamese' | 'Hindi' | 'English';
const MSGS: Record<Lang, string> = {
  Mizo: 'SURAKSHA ALERT: Landslide a lo hul dawn. NH-29 hi sawn bawk rawh. Hmun him pana hruai rawh.',
  Assamese: 'SURAKSHA সতর্কতা: ভূমিধস আসন্ন। NH-29 পথ এড়িয়ে চলুন। নিরাপদ স্থানে যান।',
  Hindi: 'सुरक्षा चेतावनी: तत्काल भूस्खलन। NH-29 से बचें। सुरक्षित स्थान पर जाएं।',
  English: 'SURAKSHA ALERT: Imminent landslide at KM 14. Avoid NH-29. Evacuate to designated shelters.',
};

export default function DispatchScreen() {
  const [ch, setCh] = useState({ cbs: true, sms: true, app: true });
  const [langs, setLangs] = useState<Record<Lang, boolean>>({ Mizo: true, Assamese: true, Hindi: false, English: true });
  const [previewLang, setPreviewLang] = useState<Lang>('Mizo');
  const [showConfirm, setShowConfirm] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const broadcast = async () => {
    setShowConfirm(false); setDispatching(true);
    await new Promise(r => setTimeout(r, 2000));
    setDispatching(false); setDispatched(true);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.title}>CAP Broadcast Console</Text>
        <Text style={s.sub}>One-Click Emergency Alert Dispatch</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Target */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Ionicons name="location" size={15} color={Colors.status.critical} />
            <Text style={s.cardTitle}>Target Area</Text>
          </View>
          <Text style={s.targetName}>Sector 4A Polygon — NH-29 KM 14</Text>
          <View style={s.targetMeta}>
            <Text style={s.targetMetaTxt}>Pop: 1,840 · 2 villages · Bridge #4 at risk</Text>
          </View>
        </View>

        {/* Channels */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Broadcast Channels</Text>
          {[
            { key: 'cbs' as const, icon: 'radio-outline', name: 'C-DOT Cell Broadcast (CBS)', desc: 'Push to all phones in target area' },
            { key: 'sms' as const, icon: 'chatbubble-outline', name: 'SMS Gateway', desc: 'Registered citizens in district' },
            { key: 'app' as const, icon: 'phone-portrait-outline', name: 'LithoPulse App Push', desc: 'In-app alert + audio to all citizens' },
          ].map(item => (
            <View key={item.key} style={s.channelRow}>
              <View style={s.channelLeft}>
                <Ionicons name={item.icon as any} size={15} color={Colors.text.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={s.channelName}>{item.name}</Text>
                  <Text style={s.channelDesc}>{item.desc}</Text>
                </View>
              </View>
              <Switch value={ch[item.key]} onValueChange={v => setCh(p => ({ ...p, [item.key]: v }))}
                trackColor={{ false: Colors.border.default, true: Colors.primaryDark }}
                thumbColor={ch[item.key] ? Colors.primary : Colors.text.tertiary} />
            </View>
          ))}
        </View>

        {/* Languages */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Audio Languages (via Bhashini)</Text>
          <View style={s.langRow}>
            {(Object.keys(langs) as Lang[]).map(lang => (
              <TouchableOpacity key={lang} style={[s.langChip, langs[lang] && s.langChipOn]}
                onPress={() => { setLangs(p => ({ ...p, [lang]: !p[lang] })); setPreviewLang(lang); }}>
                <Text style={[s.langChipTxt, langs[lang] && s.langChipTxtOn]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message preview */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>CAP Message Preview</Text>
            <View style={s.previewTabs}>
              {(Object.keys(langs) as Lang[]).filter(l => langs[l]).map(lang => (
                <TouchableOpacity key={lang} style={[s.previewTab, previewLang === lang && s.previewTabOn]}
                  onPress={() => setPreviewLang(lang)}>
                  <Text style={[s.previewTabTxt, previewLang === lang && s.previewTabTxtOn]}>{lang.slice(0, 2)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={s.msgBox}>
            <Text style={s.msgTxt}>{MSGS[previewLang]}</Text>
          </View>
        </View>

        {dispatched ? (
          <View style={s.successCard}>
            <Ionicons name="checkmark-circle" size={26} color={Colors.status.safe} />
            <Text style={s.successTxt}>Alert Dispatched Successfully</Text>
            <Text style={s.successSub}>Reaching ~1,840 people across 2 villages via {Object.values(ch).filter(Boolean).length} channels</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.broadcastBtn} onPress={() => setShowConfirm(true)} disabled={dispatching}>
            <LinearGradient colors={['#D43030', Colors.status.critical, '#A02020']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.broadcastBtnInner}>
              {dispatching
                ? <ActivityIndicator color="#fff" />
                : <><Ionicons name="megaphone" size={17} color="#fff" /><Text style={s.broadcastBtnTxt}>BROADCAST CAP EVACUATION ALERT</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Ionicons name="warning" size={28} color={Colors.status.warning} />
            <Text style={s.modalTitle}>Confirm Emergency Broadcast</Text>
            <Text style={s.modalBody}>This will immediately push alerts to ~1,840 people. This action cannot be undone.</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={broadcast}>
                <Text style={s.confirmTxt}>Broadcast Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, gap: 2 },
  title: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.md, gap: Spacing.sm },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  targetName: { fontFamily: FontFamily.medium, fontSize: FontSize.base, color: Colors.text.primary },
  targetMeta: { backgroundColor: Colors.status.criticalBg, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.status.criticalBorder, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  targetMetaTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.status.critical },
  channelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderTopWidth: 1, borderTopColor: Colors.border.subtle },
  channelLeft: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', flex: 1, marginRight: 10 },
  channelName: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.primary },
  channelDesc: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, marginTop: 1 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border.default, backgroundColor: Colors.bg.secondary },
  langChipOn: { backgroundColor: Colors.primaryBg, borderColor: Colors.status.infoBorder },
  langChipTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  langChipTxtOn: { color: Colors.primary },
  previewTabs: { flexDirection: 'row', gap: 4 },
  previewTab: { width: 26, height: 20, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg.secondary },
  previewTabOn: { backgroundColor: Colors.primaryBg },
  previewTabTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.text.tertiary },
  previewTabTxtOn: { color: Colors.primary },
  msgBox: { backgroundColor: Colors.bg.secondary, borderRadius: Radius.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle },
  msgTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  broadcastBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  broadcastBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54, gap: 10 },
  broadcastBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#fff', letterSpacing: 0.4 },
  successCard: { alignItems: 'center', backgroundColor: Colors.status.safeBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.status.safeBorder, padding: Spacing.lg, gap: 6 },
  successTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.status.safe },
  successSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border.default, padding: Spacing.xl, alignItems: 'center', gap: Spacing.md, width: '100%' },
  modalTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.text.primary, textAlign: 'center' },
  modalBody: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border.default, alignItems: 'center' },
  cancelTxt: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.secondary },
  confirmBtn: { flex: 1.5, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.status.critical, alignItems: 'center' },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#fff' },
});
