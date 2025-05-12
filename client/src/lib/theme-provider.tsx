import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme interface to define the structure of our theme settings
interface Theme {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
  contentWidth: 'default' | 'narrow' | 'wide' | 'full';
  logoPosition: 'left' | 'center';
  menuStyle: 'horizontal' | 'vertical' | 'dropdown';
  font: 'default' | 'serif' | 'sans';
}

// Provide default theme
const defaultTheme: Theme = {
  primary: '#8B4749', // SJJS primary red color
  variant: 'professional',
  appearance: 'light',
  radius: 0.5,
  contentWidth: 'default',
  logoPosition: 'left',
  menuStyle: 'horizontal',
  font: 'default'
};

// Create context
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('sjjs-theme');
      return stored ? JSON.parse(stored) : defaultTheme;
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      return defaultTheme;
    }
  });

  // Determine if dark mode is active
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    theme.appearance === 'dark' || (theme.appearance === 'system' && systemPrefersDark)
  );

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sjjs-theme', JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme.appearance !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.appearance]);

  // Update document with theme settings
  useEffect(() => {
    // Set dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set CSS variables
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--radius', `${theme.radius}rem`);
    
    // Set the font family
    if (theme.font === 'serif') {
      document.documentElement.classList.add('font-serif');
      document.documentElement.classList.remove('font-sans');
    } else if (theme.font === 'sans') {
      document.documentElement.classList.add('font-sans');
      document.documentElement.classList.remove('font-serif');
    } else {
      document.documentElement.classList.remove('font-serif', 'font-sans');
    }
  }, [theme, isDarkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (theme.appearance === 'light') {
      setThemeState({ ...theme, appearance: 'dark' });
      setIsDarkMode(true);
    } else if (theme.appearance === 'dark') {
      setThemeState({ ...theme, appearance: 'light' });
      setIsDarkMode(false);
    } else {
      // For 'system', just toggle the current state
      setIsDarkMode(!isDarkMode);
    }
  };

  // Wrapper for setTheme that also handles dark mode logic
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Update dark mode state based on new theme settings
    if (newTheme.appearance === 'dark') {
      setIsDarkMode(true);
    } else if (newTheme.appearance === 'light') {
      setIsDarkMode(false);
    } else {
      // For 'system', check system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      <div className={`theme-${theme.variant}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}