import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { MOCK_ALERTS, Alert } from '../data/mockData';

export interface LocationData {
  coords: { latitude: number; longitude: number } | null;
  district: string;
  stateName: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const distKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

export const useLocation = (): LocationData => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [district, setDistrict] = useState('Locating...');
  const [stateName, setStateName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDistrict('Permission Denied'); setIsLoading(false); return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords(loc.coords);
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      if (geo) {
        setDistrict(geo.district || geo.city || geo.subregion || 'Unknown District');
        setStateName(geo.region || '');
      }
    } catch {
      setError('Unable to determine location');
      setDistrict('Unknown');
    } finally {
      setIsLoading(false);
    }
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
