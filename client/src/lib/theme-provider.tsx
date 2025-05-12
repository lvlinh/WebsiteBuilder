import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeVariant = 'professional' | 'vibrant' | 'tint';
type ContentWidthVariant = 'regular' | 'wide' | 'narrow';

interface Theme {
  primary: string;
  mode: ThemeMode;
  variant: ThemeVariant;
  radius: number;
  contentWidth: ContentWidthVariant;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

const defaultTheme: Theme = {
  primary: '#8B4749', // SJJS primary color
  mode: 'light',
  variant: 'professional',
  radius: 0.5,
  contentWidth: 'regular',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Partial<Theme>;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme: defaultThemeOverrides = {},
  storageKey = 'sjjs-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>({
    ...defaultTheme,
    ...defaultThemeOverrides,
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  const resolvedTheme = theme.mode === 'system' ? systemTheme : theme.mode;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const storedTheme = JSON.parse(stored) as Partial<Theme>;
        setThemeState((prevTheme) => ({
          ...prevTheme,
          ...storedTheme,
        }));
      } catch (e) {
        console.error('Failed to parse stored theme:', e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.setProperty('--theme-radius', `${theme.radius}rem`);
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.setAttribute('data-theme-variant', theme.variant);
  }, [theme, resolvedTheme]);

  const setTheme = (newTheme: Partial<Theme>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setThemeState(updatedTheme);
    localStorage.setItem(storageKey, JSON.stringify(updatedTheme));
  };

  const value = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}