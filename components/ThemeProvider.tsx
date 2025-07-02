import React, { createContext, useContext } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme, ThemeColors } from '@/types/timer';

interface ThemeContextValue {
  theme: Theme;
  storedTheme: Theme | 'system';
  colors: ThemeColors;
  setTheme: (theme: Theme | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}