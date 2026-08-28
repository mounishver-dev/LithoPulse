import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Colors, FontSize, FontFamily } from '../../src/constants/theme';

export default function CitizenLayout() {
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
      <Tabs.Screen name="index" options={{ title: 'Alerts', tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Evacuate', tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }} />
      <Tabs.Screen name="report" options={{ title: 'Report', tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }} />
      <Tabs.Screen name="mesh" options={{ title: 'Network', tabBarIcon: ({ color, size }) => <Ionicons name="radio" size={size} color={color} /> }} />
    </Tabs>
  );
}
