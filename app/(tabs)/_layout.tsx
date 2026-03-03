import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticTab } from '@/components/haptic-tab';

const C = {
  primary: '#0F3D3E',
  secondary: '#1F6F5C',
  accent: '#E2C275',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();

  const isAIScreen = segments.includes('ai' as never);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',

        tabBarStyle: isAIScreen
          ? { display: 'none' }
          : styles.tabBar,

        tabBarItemStyle: {
          marginVertical: 8,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="mosque" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="quran"
        options={{
          title: 'Al-Quran',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="artikel"
        options={{
          title: 'Artikel',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pengaturan"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="star-four-points-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    marginHorizontal: 20,
    backgroundColor: C.primary,
    borderRadius: 25,
    height: 70,
    elevation: 10,
    borderTopWidth: 0,

    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
});