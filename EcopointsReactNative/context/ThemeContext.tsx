import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleThemePreference: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be wrapped in a <ThemeProvider />');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useSystemColorScheme() ?? 'light';
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [theme, setTheme] = useState<Theme>(systemTheme);

  useEffect(() => {
    // Load saved theme preference
    const loadPreference = async () => {
      const saved = await AsyncStorage.getItem('theme_preference');
      if (saved) {
        setThemePreference(saved as ThemePreference);
      }
    };
    loadPreference();
  }, []);

  useEffect(() => {
    // Apply the theme based on preference and system theme
    if (themePreference === 'system') {
      setTheme(systemTheme);
    } else {
      setTheme(themePreference);
    }
  }, [themePreference, systemTheme]);

  const handleSetPreference = async (preference: ThemePreference) => {
    await AsyncStorage.setItem('theme_preference', preference);
    setThemePreference(preference);
  };
  
  const toggleThemePreference = async () => {
      const newPreference = theme === 'light' ? 'dark' : 'light';
      await handleSetPreference(newPreference);
  }

  const value = {
    theme,
    themePreference,
    setThemePreference: handleSetPreference,
    toggleThemePreference,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
