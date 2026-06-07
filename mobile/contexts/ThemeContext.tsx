import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/utils/storage';
import Colors from '@/constants/colors';

export type Theme = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemColorScheme || 'light');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await storage.getTheme();
      if (savedTheme) {
        setThemeState(savedTheme);
      } else if (systemColorScheme) {
        setThemeState(systemColorScheme);
      }
    } catch (error) {
      console.error('Load theme error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemColorScheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleTheme = async () => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setThemeState(newTheme);
      await storage.setTheme(newTheme);
    } catch (error) {
      console.error('Toggle theme error:', error);
    }
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return {
    theme,
    colors,
    toggleTheme,
    isDark: theme === 'dark',
    isLoading,
  };
});
