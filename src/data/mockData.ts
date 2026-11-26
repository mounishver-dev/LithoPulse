export type ThreatLevel = 'critical' | 'warning' | 'stable';

export interface Alert {
  id: string;
  sectorName: string;
  threatLevel: ThreatLevel;
  fos: number;
  timeToFailure: string;
  minutesToFailure: number;
  location: { lat: number; lng: number };
  infrastructure: string[];
  population: number;
  villages: string[];
  trigger: string;
  description: string;
  distanceKm?: number;
}

export interface TelemetryPoint {
  time: string;
  value: number;
}

export interface TelemetryFeed {
  rainfall: TelemetryPoint[];
  porePressure: TelemetryPoint[];
  strainRate: TelemetryPoint[];
  inverseVelocity: TelemetryPoint[];
}

export interface Incident {
  id: string;
  status: 'pending' | 'verified' | 'dismissed';
  lat: number;
  lng: number;
  tag: string;
  confidence: string;
  description: string;
  reportedAt: string;
  reporterType: string;
  district: string;
}

export const OFFICIAL_CREDENTIALS = [
  { username: 'mounish@admin', password: 'mounish123', name: 'Mounish Admin', role: 'System Administrator' },
  { username: 'dm_mizoram', password: 'NDMA@2025', name: 'DM — Aizawl, Mizoram', role: 'District Magistrate' },
  { username: 'sdma_assam', password: 'SDMA@secure', name: 'SDMA — Assam EOC', role: 'SDMA Official' },
  { username: 'eoc_ndrf', password: 'EOC@ndrf1', name: 'NDRF Team 3 — EOC', role: 'EOC Operator' },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    sectorName: 'NH-29 Sector 4A (KM 14)',
    threatLevel: 'critical',
    fos: 0.88,
    timeToFailure: '~45 min',
    minutesToFailure: 45,
    location: { lat: 23.7271, lng: 92.7176 },
    infrastructure: ['Bridge #4 (NH-29)', 'NH-29 Highway'],
    population: 1840,
    villages: ['Hunthar Veng', 'Sihphir Veng'],
    trigger: 'Rainfall 42mm/h + DAS Creep',
    description: 'Debris flow will sever NH-29 at Bridge #4, isolating 2 villages.',
  },
  {
    id: 'a2',
    sectorName: 'Tuivai Valley — Kolasib',
    threatLevel: 'warning',
    fos: 1.12,
    timeToFailure: '~3 hr',
    minutesToFailure: 180,
    location: { lat: 24.2319, lng: 92.6831 },
    infrastructure: ['State Road SR-14'],
    population: 620,
    villages: ['Kolasib Town'],
    trigger: 'River rise + Soil saturation',
    description: 'Tuivai River rising. Embankment stability at risk.',
  },
  {
    id: 'a3',
    sectorName: 'Tlawng Riverbank — Lunglei',
    threatLevel: 'warning',
    fos: 1.31,
    timeToFailure: '~6 hr',
    minutesToFailure: 360,
    location: { lat: 22.8881, lng: 92.7363 },
    infrastructure: ['Lunglei Bridge', 'NH-306'],
    population: 3200,
    villages: ['Lunglei Town', 'Bawngkawn'],
    trigger: 'Prolonged rainfall 72hr accumulation',
    description: 'Slow slope creep detected along Tlawng valley embankment.',
  },
  {
    id: 'a4',
    sectorName: 'Champhai Ridge — Eastern Sector',
    threatLevel: 'stable',
    fos: 1.87,
    timeToFailure: '>24 hr',
    minutesToFailure: 1440,
    location: { lat: 23.4637, lng: 93.3249 },
    infrastructure: [],
    population: 480,
    villages: ['Champhai'],
    trigger: 'Monitoring — DAS nominal',
    description: 'Under active monitoring. No immediate risk.',
  },
];

export const generateTelemetry = (): TelemetryFeed => {
  const times = ['14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45'];
  return {
    rainfall: times.map((t, i) => ({ time: t, value: 18 + i * 4.2 + Math.random() * 2 })),
    porePressure: times.map((t, i) => ({ time: t, value: 45 + i * 6 + Math.random() * 3 })),
    strainRate: times.map((t, i) => ({ time: t, value: 12 + i * 8 + Math.random() * 4 })),
    inverseVelocity: times.map((t, i) => ({ time: t, value: Math.max(0.05, 2.8 - i * 0.38 - Math.random() * 0.1) })),
  };
};

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', status: 'pending', lat: 23.7198, lng: 92.7134, tag: '🔴 High Confidence: Mudflow Blocking Road', confidence: '94%', description: 'Debris covering NH-29 carriageway near km marker 14+200', reportedAt: '15:03 IST', reporterType: 'Field Ranger', district: 'Aizawl' },
  { id: 'i2', status: 'pending', lat: 23.7301, lng: 92.7201, tag: '🟡 Medium Confidence: Slope Crack Formation', confidence: '72%', description: 'Visible fissure (~40cm wide) on uphill slope near village boundary', reportedAt: '14:52 IST', reporterType: 'Citizen', district: 'Aizawl' },
  { id: 'i3', status: 'verified', lat: 24.2298, lng: 92.6855, tag: '🔴 High Confidence: River Embankment Breach', confidence: '89%', description: 'Tuivai embankment partially collapsed, water overtopping', reportedAt: '13:41 IST', reporterType: 'NDRF Team', district: 'Kolasib' },
  { id: 'i4', status: 'pending', lat: 22.8901, lng: 92.7390, tag: '🟡 Medium Confidence: Road Surface Cracking', confidence: '68%', description: 'Longitudinal cracks on NH-306 near Lunglei junction', reportedAt: '14:15 IST', reporterType: 'Citizen', district: 'Lunglei' },
  { id: 'i5', status: 'dismissed', lat: 23.4620, lng: 93.3211, tag: '⬜ Low Confidence: Possible Rockfall', confidence: '31%', description: 'Unclear photo — appears to be natural rock outcrop', reportedAt: '11:20 IST', reporterType: 'Tourist', district: 'Champhai' },
  { id: 'i6', status: 'pending', lat: 23.7150, lng: 92.7050, tag: '🔴 High Confidence: Waterlogged Road', confidence: '91%', description: 'Standing water with debris. Road inaccessible for vehicles', reportedAt: '15:11 IST', reporterType: 'Police', district: 'Aizawl' },
];

export const SHELTERS = [
  { id: 'sh1', name: 'Aizawl Community Hall', lat: 23.7367, lng: 92.7178, capacity: 400 },
  { id: 'sh2', name: 'Sihphir Ridge Camp', lat: 23.7410, lng: 92.7320, capacity: 200 },
  { id: 'sh3', name: 'Kolasib School Shelter', lat: 24.2359, lng: 92.6902, capacity: 150 },
];
