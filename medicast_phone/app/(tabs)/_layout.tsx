import React from 'react';
import { Tabs } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme-store';
import Colors from '@/constants/colors';
import { Home, Headphones, Settings } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const theme = useAppTheme();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.end]}
        style={styles.gradient}
      />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.icon,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Generate',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="player"
          options={{
            title: 'Player',
            tabBarIcon: ({ color }) => <Headphones size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
});