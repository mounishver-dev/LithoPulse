import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { Colors, FontSize, FontFamily } from '../constants/theme';

interface DataPoint { time: string; value: number; }
interface Props {
  data: DataPoint[];
  color?: string;
  label?: string;
  unit?: string;
  height?: number;
  gradientId: string;
}

export const LineChart: React.FC<Props> = ({ data, color = Colors.primary, label, unit = '', height = 80, gradientId }) => {
  if (!data || data.length < 2) return null;

  const W = 300;
  const pad = { t: 8, r: 8, b: 18, l: 4 };
  const cw = W - pad.l - pad.r;
  const ch = height - pad.t - pad.b;

  const vals = data.map(d => d.value);
  const min = Math.min(...vals) * 0.92;
  const max = Math.max(...vals) * 1.06;
  const rng = max - min || 1;

  const px = (i: number) => pad.l + (i / (data.length - 1)) * cw;
  const py = (v: number) => pad.t + ch - ((v - min) / rng) * ch;

  const pts = data.map((d, i) => ({ x: px(i), y: py(d.value) }));
  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }, '');
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;
  const latest = vals[vals.length - 1];

  return (
    <View style={styles.wrap}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, { color }]}>{latest.toFixed(1)}{unit}</Text>
        </View>
      )}
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        <Defs>
          <SvgGrad id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </SvgGrad>
        </Defs>
        <Line x1={pad.l} y1={pad.t + ch / 2} x2={W - pad.r} y2={pad.t + ch / 2}
          stroke={Colors.border.subtle} strokeWidth="0.5" strokeDasharray="3,4" />
        <Path d={fillPath} fill={`url(#${gradientId})`} />
        <Path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={styles.timeRow}>
        {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
          <Text key={i} style={styles.timeLabel}>{data[i]?.time}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text.secondary },
  value: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  timeLabel: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.text.tertiary },
});
