import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAsyncStorage } from './useAsyncStorage';
import type { Theme, ThemeColors } from '@/types/timer';

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#007AFF',
  secondary: '#5856D6',
  text: '#000000',
  textSecondary: '#6C6C70',
  border: '#E5E5EA',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  accent: '#FF6B6B',
};

const darkTheme: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  accent: '#FF6B6B',
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [storedTheme, setStoredTheme] = useAsyncStorage<Theme | 'system'>('theme', 'system');
  
  const getActiveTheme = (): Theme => {
    if (storedTheme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return storedTheme;
  };

  const colors = getActiveTheme() === 'dark' ? darkTheme : lightTheme;

  const setTheme = (theme: Theme | 'system') => {
    setStoredTheme(theme);
  };

  return {
    theme: getActiveTheme(),
    storedTheme,
    colors,
    setTheme,
    isDark: getActiveTheme() === 'dark',
  };
}