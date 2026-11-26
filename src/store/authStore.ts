import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFICIAL_CREDENTIALS } from '../data/mockData';

export type UserType = 'citizen' | 'official';

export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  userType: UserType;
  role?: string;
  district?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginOfficial: (username: string, password: string) => Promise<boolean>;
  loginCitizen: (email: string, password: string) => Promise<boolean>;
  registerCitizen: (name: string, email: string, password: string, district: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadSession: () => Promise<void>;
}

const SESSION_KEY = 'auth_session';
const CITIZENS_KEY = 'citizen_accounts';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const user: User = JSON.parse(raw);
        set({ user, isAuthenticated: true });
      }
    } catch {}
  },

  loginOfficial: async (username, password) => {
    set({ isLoading: true, error: null });
    await delay(800);
    const cred = OFFICIAL_CREDENTIALS.find(c => c.username === username && c.password === password);
    if (cred) {
      const user: User = { id: `off_${cred.username}`, name: cred.name, username: cred.username, userType: 'official', role: cred.role };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false, error: 'Invalid credentials. Contact your NDMA/SDMA administrator.' });
    return false;
  },

  loginCitizen: async (email, password) => {
    set({ isLoading: true, error: null });
    await delay(800);
    try {
      const raw = await AsyncStorage.getItem(CITIZENS_KEY);
      const accounts: any[] = raw ? JSON.parse(raw) : [];
      let found = accounts.find(a => a.email === email && a.password === password);
      
      if (!found && email === 'mounish@user' && password === 'mounish123') {
        found = { id: 'cit_mounish', name: 'Mounish User', email: 'mounish@user', district: 'Aizawl' };
      }

      if (found) {
        const user: User = { id: found.id, name: found.name, email: found.email, userType: 'citizen', district: found.district };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false, error: 'Account not found. Please register first.' });
      return false;
    } catch {
      set({ isLoading: false, error: 'Login failed. Try again.' });
      return false;
    }
  },

  registerCitizen: async (name, email, password, district) => {
    set({ isLoading: true, error: null });
    await delay(900);
    try {
      const raw = await AsyncStorage.getItem(CITIZENS_KEY);
      const accounts: any[] = raw ? JSON.parse(raw) : [];
      if (accounts.find(a => a.email === email)) {
        set({ isLoading: false, error: 'An account with this email already exists.' });
        return false;
      }
      const newAcc = { id: `cit_${Date.now()}`, name, email, password, district };
      accounts.push(newAcc);
      await AsyncStorage.setItem(CITIZENS_KEY, JSON.stringify(accounts));
      const user: User = { id: newAcc.id, name, email, userType: 'citizen', district };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'Registration failed. Try again.' });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
