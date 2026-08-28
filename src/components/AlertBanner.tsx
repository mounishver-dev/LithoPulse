import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontFamily, Spacing, Radius } from '../constants/theme';
import { Alert } from '../data/mockData';

interface Props { alert: Alert | null; compact?: boolean; }

export const AlertBanner: React.FC<Props> = ({ alert, compact = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (alert?.threatLevel === 'critical') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])).start();
    }
  }, [alert]);

  if (!alert) return null;
  const isCritical = alert.threatLevel === 'critical';
  const accent = isCritical ? Colors.status.critical : Colors.status.warning;
  const gradColors: [string, string] = isCritical ? ['#280A0A', '#1A0505'] : ['#281A05', '#1A1005'];

  if (compact) {
    return (
      <Animated.View style={[styles.compact, { borderColor: accent, opacity: fadeAnim }]}>
        <Animated.View style={[styles.compactDot, { backgroundColor: accent, opacity: pulseAnim }]} />
        <Text style={[styles.compactText, { color: accent }]} numberOfLines={1}>
          {isCritical ? 'IMMINENT' : 'WATCH'}: {alert.sectorName}
        </Text>
        <Text style={styles.compactTime}>{alert.timeToFailure}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={gradColors} style={styles.gradient}>
        <View style={[styles.topBar, { backgroundColor: accent }]} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Ionicons name="warning" size={18} color={accent} />
            </Animated.View>
            <Text style={[styles.levelText, { color: accent }]}>
              {isCritical ? 'IMMINENT FAILURE' : 'HAZARD WATCH'}
            </Text>
          </View>
          <Text style={styles.sectorName}>{alert.sectorName}</Text>
          <Text style={styles.description}>{alert.description}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Time to Failure</Text>
              <Text style={[styles.metaValue, { color: accent }]}>{alert.timeToFailure}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Population</Text>
              <Text style={styles.metaValue}>{alert.population.toLocaleString()}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>FoS</Text>
              <Text style={[styles.metaValue, { color: accent }]}>{alert.fos.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: 0 },
  gradient: {},
  topBar: { height: 2, width: '100%' },
  content: { padding: Spacing.md, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, letterSpacing: 1.5 },
  sectorName: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  description: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 18 },
  meta: { flexDirection: 'row', marginTop: 4 },
  metaItem: { flex: 1, gap: 2 },
  metaLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  metaValue: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.text.primary },
  metaDivider: { width: 1, backgroundColor: Colors.border.subtle, marginHorizontal: 10 },
  compact: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.card,
    borderRadius: Radius.sm, borderWidth: 1, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, gap: 8,
  },
  compactDot: { width: 7, height: 7, borderRadius: Radius.full },
  compactText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, flex: 1 },
  compactTime: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary },
});
