import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors, FontSize, FontFamily } from '../../src/constants/theme';

export default function OfficialLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.bg.secondary, borderTopColor: Colors.border.default, borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 82 : 60, paddingBottom: Platform.OS === 'ios' ? 22 : 10, paddingTop: 8,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.text.tertiary,
      tabBarLabelStyle: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, marginTop: 1 },
    }}>
      <Tabs.Screen name="index"        options={{ title: 'Triage',    tabBarIcon: ({ color, size }) => <Ionicons name="layers"         size={size} color={color} /> }} />
      <Tabs.Screen name="map"          options={{ title: 'Terrain',   tabBarIcon: ({ color, size }) => <Ionicons name="globe"          size={size} color={color} /> }} />
      <Tabs.Screen name="digital_twin" options={{ title: 'Twin',      tabBarIcon: ({ color, size }) => <Ionicons name="cube"           size={size} color={color} /> }} />
      <Tabs.Screen name="telemetry"    options={{ title: 'Analytics', tabBarIcon: ({ color, size }) => <Ionicons name="analytics"      size={size} color={color} /> }} />
      <Tabs.Screen name="dispatch"     options={{ title: 'Dispatch',  tabBarIcon: ({ color, size }) => <Ionicons name="megaphone"      size={size} color={color} /> }} />
      <Tabs.Screen name="kanban"       options={{ title: 'Incidents', tabBarIcon: ({ color, size }) => <Ionicons name="grid"           size={size} color={color} /> }} />
    </Tabs>
  );
}
