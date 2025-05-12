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

// Utility function to get the content width class based on theme settings
export const getContentWidthClass = (theme: Theme, baseClasses: string = "mx-auto px-4 sm:px-6 lg:px-8") => {
  return cn(
    baseClasses,
    theme.contentWidth === 'normal' ? 'container' : 
    theme.contentWidth === 'wide' ? 'container max-w-7xl' : 
    'container-fluid max-w-none'
  );
};

export interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Partial<Theme>) => void;
  resolvedTheme: ThemeMode;
  getContentWidthClass: (baseClasses?: string) => string;
}

const defaultTheme: Theme = {
  primary: 'hsl(351, 32%, 42%)', // SJJS primary color
  mode: 'light' as ThemeMode,
  variant: 'professional',
  radius: 0.5,
  contentWidth: 'normal'
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  resolvedTheme: 'light',
  getContentWidthClass: (baseClasses?: string) => 
    getContentWidthClass(defaultTheme, baseClasses)
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState(defaultTheme);
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
    setThemeState({
      ...theme,
      ...newTheme
    });
  };

  // Helper function to get content width using the utility
  const getContentWidthClassFn = (baseClasses?: string) => {
    return getContentWidthClass(theme, baseClasses);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme,
      getContentWidthClass: getContentWidthClassFn 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);