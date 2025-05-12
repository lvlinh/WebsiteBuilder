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

  // Function to apply theme changes to DOM
  const applyThemeToDOM = (currentTheme: Theme) => {
    // Apply color scheme (light/dark)
    if (currentTheme.mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newResolvedTheme = systemPrefersDark ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      document.documentElement.classList.toggle('dark', newResolvedTheme === 'dark');
    } else {
      setResolvedTheme(currentTheme.mode);
      document.documentElement.classList.toggle('dark', currentTheme.mode === 'dark');
    }
    
    // Apply primary color directly to CSS variables
    // This affects all components using the color
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    
    // Extract color values for RGB manipulation
    const tempDiv = document.createElement('div');
    tempDiv.style.color = currentTheme.primary;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // Parse RGB values
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch.map(Number);
      
      // Set RGB values separately for more flexible styling
      document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    }
    
    // Apply border radius
    document.documentElement.style.setProperty('--theme-radius', `${currentTheme.radius || 0.5}rem`);
    
    // Apply theme variant classes
    document.documentElement.classList.remove('variant-professional', 'variant-vibrant', 'variant-tint');
    if (currentTheme.variant) {
      document.documentElement.classList.add(`variant-${currentTheme.variant}`);
    } else {
      document.documentElement.classList.add('variant-professional'); // Default
    }
    
    // Store updated theme in localStorage
    localStorage.setItem('theme', JSON.stringify(currentTheme));
  };

  // Apply theme settings whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
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
    // Create the updated theme
    const updatedTheme = {
      ...theme,
      ...newTheme
    };
    
    // Set state
    setThemeState(updatedTheme);
    
    // Apply changes immediately without waiting for re-render
    applyThemeToDOM(updatedTheme);
    
    // Log the change for debugging
    console.log('Theme updated:', updatedTheme);
  };

  const getContentWidthClass = (baseClasses?: string) => {
    const base = baseClasses || "mx-auto px-4 sm:px-6 lg:px-8";
    
    switch (theme.contentWidth) {
      case 'normal':
        return cn(base, "container max-w-6xl");
      case 'wide':
        return cn(base, "container max-w-7xl");
      case 'full':
        return cn(base, "w-full max-w-none");
      default:
        return cn(base, "container max-w-6xl");
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