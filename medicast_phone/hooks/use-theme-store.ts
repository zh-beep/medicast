import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeState {
  theme: ColorSchemeName;
  setTheme: (theme: ColorSchemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: null, // null means system default
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useAppTheme = (): ColorSchemeName => {
  const systemTheme = useColorScheme();
  const { theme } = useThemeStore();
  
  // If user has set a preference, use that, otherwise use system theme
  return theme || systemTheme;
};