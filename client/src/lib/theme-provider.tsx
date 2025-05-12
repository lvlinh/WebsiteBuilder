import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme types
type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = string;
type ThemeContentWidth = 'narrow' | 'regular' | 'wide';
type ThemeRadius = 'none' | 'small' | 'medium' | 'large';

export interface Theme {
  mode: ThemeMode;
  color: ThemeColor;
  contentWidth: ThemeContentWidth;
  radius: ThemeRadius;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ThemeMode;
}

const defaultTheme: Theme = {
  mode: 'light',
  color: '#8B4749', // SJJS primary color
  contentWidth: 'regular',
  radius: 'medium'
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  resolvedTheme: 'light'
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
        setThemeState(parsedTheme);
      } catch (error) {
        console.error('Failed to parse stored theme:', error);
      }
    }
  }, []);

  // Apply CSS variables based on theme
  useEffect(() => {
    // Set CSS custom properties
    const root = document.documentElement;
    
    // Set color scheme
    root.style.setProperty('--primary', theme.color);
    
    // Set border radius based on theme
    const radiusValues = {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem'
    };
    root.style.setProperty('--radius', radiusValues[theme.radius]);
    
    // Determine color scheme based on theme mode or system preference
    if (theme.mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      root.classList.toggle('dark', newResolvedTheme === 'dark');
    } else {
      setResolvedTheme(theme.mode);
      root.classList.toggle('dark', theme.mode === 'dark');
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

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);