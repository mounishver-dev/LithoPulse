import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontFamily, Radius } from '../constants/theme';
import { ThreatLevel } from '../data/mockData';

const cfg = {
  critical: { label: 'CRITICAL', dot: Colors.status.critical, bg: Colors.status.criticalBg, border: Colors.status.criticalBorder, text: Colors.status.critical },
  warning:  { label: 'WARNING',  dot: Colors.status.warning,  bg: Colors.status.warningBg,  border: Colors.status.warningBorder,  text: Colors.status.warning },
  stable:   { label: 'STABLE',   dot: Colors.status.safe,     bg: Colors.status.safeBg,     border: Colors.status.safeBorder,     text: Colors.status.safe },
};

export const ThreatBadge: React.FC<{ level: ThreatLevel; size?: 'sm' | 'md' }> = ({ level, size = 'md' }) => {
  const c = cfg[level];
  const sm = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border, paddingHorizontal: sm ? 8 : 10, paddingVertical: sm ? 3 : 5 }]}>
      <View style={[styles.dot, { backgroundColor: c.dot, width: sm ? 5 : 6, height: sm ? 5 : 6 }]} />
      <Text style={[styles.text, { color: c.text, fontSize: sm ? FontSize.xs : FontSize.sm }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full, borderWidth: 1, gap: 5 },
  dot: { borderRadius: Radius.full },
  text: { fontFamily: FontFamily.semiBold, letterSpacing: 0.5 },
});
