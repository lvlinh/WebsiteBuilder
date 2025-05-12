import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme types
export type ColorScheme = 'light' | 'dark' | 'system';
export type ThemeColor = 'red' | 'blue' | 'green' | 'purple' | 'orange';
export type ThemeRadius = 'small' | 'medium' | 'large' | 'none';
export type ThemeFont = 'sans' | 'serif' | 'mono';

export interface Theme {
  colorScheme: ColorScheme;
  primaryColor: ThemeColor;
  radius: ThemeRadius;
  fontFamily: ThemeFont;
  contentWidth: string;
  logoPosition: 'left' | 'center';
  navStyle: 'standard' | 'mega' | 'minimal';
  footerStyle: 'standard' | 'minimal' | 'detailed';
}

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  isDarkMode: boolean;
}

// Default theme
const defaultTheme: Theme = {
  colorScheme: 'light',
  primaryColor: 'red',
  radius: 'medium',
  fontFamily: 'sans',
  contentWidth: 'normal',
  logoPosition: 'left',
  navStyle: 'standard',
  footerStyle: 'standard'
};

// Create context
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  isDarkMode: false
});

// Create provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Try to load theme from localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('sjjs-theme') : null;
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Effect to apply color mode
  useEffect(() => {
    const applyColorMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = 
        theme.colorScheme === 'dark' || 
        (theme.colorScheme === 'system' && prefersDark);
      
      setIsDarkMode(shouldUseDark);
      
      document.documentElement.classList.toggle('dark', shouldUseDark);
      document.documentElement.style.setProperty('--primary-color', getPrimaryColorValue(theme.primaryColor));
      document.documentElement.style.setProperty('--border-radius', getRadiusValue(theme.radius));
      document.documentElement.style.setProperty('--font-family', getFontValue(theme.fontFamily));
    };
    
    applyColorMode();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyColorMode();
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sjjs-theme', JSON.stringify(theme));
  }, [theme]);
  
  // Update theme function
  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prevTheme => ({ ...prevTheme, ...updates }));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, updateTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper functions for CSS variables
function getPrimaryColorValue(color: ThemeColor): string {
  const colors = {
    red: '#8B4749',
    blue: '#1E40AF',
    green: '#166534',
    purple: '#6D28D9',
    orange: '#C2410C'
  };
  return colors[color];
}

function getRadiusValue(radius: ThemeRadius): string {
  const radii = {
    none: '0px',
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem'
  };
  return radii[radius];
}

function getFontValue(font: ThemeFont): string {
  const fonts = {
    sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  };
  return fonts[font];
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}