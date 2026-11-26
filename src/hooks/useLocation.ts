import { useState, useEffect, useCallback } from 'react';
import { MOCK_ALERTS, Alert } from '../data/mockData';

export interface LocationData {
  coords: { latitude: number; longitude: number } | null;
  district: string;
  stateName: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Simulated GPS coordinates for Aizawl, Mizoram — realistic for disaster monitoring demo
const BASE_LAT = 23.7307;
const BASE_LON = 92.7173;
const DISTRICTS = ['Aizawl', 'Champhai', 'Kolasib', 'Lunglei', 'Mamit', 'Serchhip', 'Lawngtlai', 'Saiha'];

const distKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

export const useLocation = (): LocationData => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [district] = useState(DISTRICTS[0]);
  const [stateName] = useState('Mizoram');
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setIsLoading(true);
    // Simulate async GPS acquisition
    setTimeout(() => {
      setCoords({
        latitude: BASE_LAT + (Math.random() - 0.5) * 0.002,
        longitude: BASE_LON + (Math.random() - 0.5) * 0.002,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { coords, district, stateName, isLoading, error, refresh: fetch };
};

export const getAlertsNearLocation = (lat: number | null, lng: number | null): Alert[] => {
  if (!lat || !lng) return MOCK_ALERTS;
  return MOCK_ALERTS.map(a => ({
    ...a,
    distanceKm: distKm(lat, lng, a.location.lat, a.location.lng),
  })).sort((a, b) => {
    const o: Record<string, number> = { critical: 0, warning: 1, stable: 2 };
    if (o[a.threatLevel] !== o[b.threatLevel]) return o[a.threatLevel] - o[b.threatLevel];
    return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
  });
};
