import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontFamily, Radius, Spacing } from '../constants/theme';
import { Alert } from '../data/mockData';
import { ThreatBadge } from './ThreatBadge';

interface Props { alert: Alert; onPress?: () => void; showPriority?: number; }

export const SectorCard: React.FC<Props> = ({ alert, onPress, showPriority }) => {
  const borderColor = alert.threatLevel === 'critical' ? Colors.status.criticalBorder
    : alert.threatLevel === 'warning' ? Colors.status.warningBorder : Colors.border.default;

  return (
    <TouchableOpacity style={[styles.card, { borderColor }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.left}>
          {showPriority !== undefined && (
            <View style={styles.priority}><Text style={styles.priorityText}>P{showPriority}</Text></View>
          )}
          <ThreatBadge level={alert.threatLevel} size="sm" />
          {alert.distanceKm !== undefined && (
            <Text style={styles.distance}>{alert.distanceKm} km</Text>
          )}
        </View>
        <Text style={styles.time}>{alert.timeToFailure}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{alert.sectorName}</Text>
      <Text style={styles.desc} numberOfLines={2}>{alert.description}</Text>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="people-outline" size={11} color={Colors.text.tertiary} />
          <Text style={styles.footerText}>Pop: {alert.population.toLocaleString()}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="warning-outline" size={11} color={Colors.text.tertiary} />
          <Text style={styles.footerText} numberOfLines={1}>{alert.trigger}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, gap: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  priority: { backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.text.secondary },
  time: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text.secondary },
  distance: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary },
  name: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base, color: Colors.text.primary },
  desc: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 18 },
  footer: { flexDirection: 'row', gap: 14 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  footerText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.text.tertiary, flex: 1 },
});
