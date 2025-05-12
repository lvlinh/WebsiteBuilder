import React, { createContext, useState, useContext, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Theme types
type ThemeMode = 'light' | 'dark' | 'system';
type ThemeVariant = 'professional' | 'tint' | 'vibrant';
type ContentWidth = 'normal' | 'wide' | 'full';

export interface Theme {
  primary: string;
  mode: ThemeMode;
  variant?: ThemeVariant;
  radius?: number;
  contentWidth?: ContentWidth;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Partial<Theme>) => void;
  resolvedTheme: ThemeMode;
  getContentWidthClass: (baseClasses?: string) => string;
}

const defaultTheme: Theme = {
  primary: 'hsl(351, 32%, 42%)', // SJJS primary color
  mode: 'light',
  variant: 'professional',
  radius: 0.5,
  contentWidth: 'normal'
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  resolvedTheme: 'light',
  getContentWidthClass: () => "container mx-auto px-4 sm:px-6 lg:px-8"
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('light');

  // Load theme from localStorage on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        setThemeState({
          ...defaultTheme,
          ...parsedTheme
        });
      } catch (error) {
        console.error('Failed to parse stored theme:', error);
      }
    }
  }, []);

  // Apply theme settings
  useEffect(() => {
    // Apply color scheme (light/dark)
    if (theme.mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      document.documentElement.classList.toggle('dark', newResolvedTheme === 'dark');
    } else {
      setResolvedTheme(theme.mode);
      document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    }
    
    // Apply CSS variable for primary color
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--theme-radius', `${theme.radius || 0.5}rem`);
    
    // Save to localStorage
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Listen for system color scheme changes if mode is 'system'
  useEffect(() => {
    if (theme.mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  const setTheme = (newTheme: Partial<Theme>) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  const getContentWidthClass = (baseClasses?: string) => {
    const base = baseClasses || "mx-auto px-4 sm:px-6 lg:px-8";
    
    if (theme.contentWidth === 'normal') {
      return cn(base, "container max-w-6xl");
    } else if (theme.contentWidth === 'wide') {
      return cn(base, "container max-w-7xl");
    } else {
      return cn(base, "container-fluid max-w-none");
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme,
      getContentWidthClass
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};