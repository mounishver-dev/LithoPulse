import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, isAuthenticated, loadSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace(user?.userType === 'official' ? '/(official)' : '/(citizen)');
    }
  }, [isAuthenticated, segments, user]);

  return <Slot />;
}

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) {
    return <View style={s.loading}><ActivityIndicator color={Colors.primary} /></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg.primary, justifyContent: 'center', alignItems: 'center' },
});
