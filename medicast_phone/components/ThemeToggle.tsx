import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeStore, useAppTheme } from '@/hooks/use-theme-store';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/colors';

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  const currentTheme = useAppTheme();
  const colors = currentTheme === 'dark' ? Colors.dark : Colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Pressable
        style={[
          styles.option,
          theme === 'light' && [styles.selectedOption, { borderColor: colors.primary }]
        ]}
        onPress={() => setTheme('light')}
      >
        <Sun size={20} color={theme === 'light' ? colors.primary : colors.icon} />
        <Text style={[
          styles.optionText, 
          { color: theme === 'light' ? colors.primary : colors.text }
        ]}>
          Light
        </Text>
      </Pressable>
      
      <Pressable
        style={[
          styles.option,
          theme === null && [styles.selectedOption, { borderColor: colors.primary }]
        ]}
        onPress={() => setTheme(null)}
      >
        <Smartphone size={20} color={theme === null ? colors.primary : colors.icon} />
        <Text style={[
          styles.optionText, 
          { color: theme === null ? colors.primary : colors.text }
        ]}>
          System
        </Text>
      </Pressable>
      
      <Pressable
        style={[
          styles.option,
          theme === 'dark' && [styles.selectedOption, { borderColor: colors.primary }]
        ]}
        onPress={() => setTheme('dark')}
      >
        <Moon size={20} color={theme === 'dark' ? colors.primary : colors.icon} />
        <Text style={[
          styles.optionText, 
          { color: theme === 'dark' ? colors.primary : colors.text }
        ]}>
          Dark
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    marginVertical: 16,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});