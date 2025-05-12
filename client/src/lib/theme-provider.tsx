import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  reset?: boolean; // Used to reset theme to default
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Partial<Theme>) => void;
  resolvedTheme: ThemeMode;
  getContentWidthClass: (baseClasses?: string) => string;
  resetTheme: () => void; // New function to completely reset the theme
  computedPrimary: string; // Actual computed color for debugging
}

// Constants for SJJS branding
export const SJJS_RED = 'hsl(351, 32%, 42%)';
export const SJJS_RGB = '139, 71, 73'; // RGB equivalent of #8B4749

// Default theme with SJJS branding
const defaultTheme: Theme = {
  primary: SJJS_RED,
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
  getContentWidthClass: () => "container mx-auto px-4 sm:px-6 lg:px-8",
  resetTheme: () => {},
  computedPrimary: SJJS_RED
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('light');
  const [computedPrimary, setComputedPrimary] = useState<string>(SJJS_RED);
  const [resetCount, setResetCount] = useState<number>(0);

  // Function to directly apply default SJJS theme to DOM without any state changes
  // This ensures the default theme is applied immediately on page load
  const applyDefaultThemeToDom = useCallback(() => {
    console.log('Applying default SJJS theme directly to DOM');
    
    // Set default light mode
    document.documentElement.classList.remove('dark');
    
    // Set default SJJS color directly
    document.documentElement.style.setProperty('--primary', SJJS_RED);
    document.documentElement.style.setProperty('--primary-rgb', SJJS_RGB);
    
    // Set border radius
    document.documentElement.style.setProperty('--theme-radius', `0.5rem`);
    
    // Set professional variant
    document.documentElement.classList.remove('variant-professional', 'variant-vibrant', 'variant-tint');
    document.documentElement.classList.add('variant-professional');
    
    // Debug information
    console.log('Default theme applied directly to DOM');
  }, []);

  // Function to apply theme changes to DOM with more robust error handling
  const applyThemeToDOM = useCallback((currentTheme: Theme) => {
    try {
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
      if (currentTheme.primary) {
        document.documentElement.style.setProperty('--primary', currentTheme.primary);
        
        // Extract color values for RGB manipulation
        try {
          const tempDiv = document.createElement('div');
          tempDiv.style.color = currentTheme.primary;
          document.body.appendChild(tempDiv);
          const computedColor = window.getComputedStyle(tempDiv).color;
          document.body.removeChild(tempDiv);
          
          // Store the computed color for debugging
          setComputedPrimary(computedColor);
          
          // Parse RGB values
          const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const [_, r, g, b] = rgbMatch.map(Number);
            
            // Set RGB values separately for more flexible styling
            document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
          } else {
            // If we couldn't parse the color, use the default SJJS RGB
            console.warn('Could not parse RGB values, using default SJJS RGB');
            document.documentElement.style.setProperty('--primary-rgb', SJJS_RGB);
          }
        } catch (error) {
          console.error('Error extracting RGB values:', error);
          // Fallback to default RGB values
          document.documentElement.style.setProperty('--primary-rgb', SJJS_RGB);
        }
      } else {
        // If no primary color is set, use the default SJJS color
        document.documentElement.style.setProperty('--primary', SJJS_RED);
        document.documentElement.style.setProperty('--primary-rgb', SJJS_RGB);
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
      
      // Debug
      console.log('Theme successfully applied to DOM:', currentTheme);
    } catch (error) {
      console.error('Error applying theme to DOM:', error);
      // If there was an error, apply the default theme
      applyDefaultThemeToDom();
    }
  }, [applyDefaultThemeToDom]);

  // Complete theme reset function
  const resetTheme = useCallback(() => {
    console.log('Full theme reset requested');

    // Hard reset by incrementing reset counter
    setResetCount(prev => prev + 1);
    
    // Create a hard-coded default theme to avoid any reference issues
    const hardResetTheme: Theme = {
      primary: SJJS_RED,
      mode: 'light',
      variant: 'professional',
      radius: 0.5,
      contentWidth: 'normal'
    };
    
    // Apply it directly to DOM first
    applyDefaultThemeToDom();
    
    // Then update state
    setThemeState(hardResetTheme);
    
    // Clear localStorage and set new default
    localStorage.removeItem('theme');
    localStorage.setItem('theme', JSON.stringify(hardResetTheme));
    
    console.log('Theme has been completely reset to SJJS defaults');
    
    return hardResetTheme;
  }, [applyDefaultThemeToDom]);

  // Load theme from localStorage on initial load
  useEffect(() => {
    // Apply default theme to DOM immediately on first load
    applyDefaultThemeToDom();
    
    // Then try to restore saved theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        console.log('Loaded saved theme:', parsedTheme);
        
        // Validate the stored theme has the required properties
        if (!parsedTheme.primary) {
          console.warn('Stored theme missing primary color, using default');
          parsedTheme.primary = SJJS_RED;
        }
        
        // Apply the saved theme
        setThemeState({
          ...defaultTheme, // Ensure all fields have defaults
          ...parsedTheme
        });
      } catch (error) {
        console.error('Failed to parse stored theme:', error);
        // If there's an error, ensure we reset to defaults
        setThemeState(defaultTheme);
      }
    }
  }, [applyDefaultThemeToDom, resetCount]);

  // Apply theme settings whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

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

  // Theme update function
  const setTheme = useCallback((newTheme: Partial<Theme>) => {
    console.log('setTheme called with:', newTheme);
    
    // Special case: if we receive an empty object or a reset request
    if (!Object.keys(newTheme).length || (newTheme as any).reset) {
      console.log('Reset requested via setTheme');
      resetTheme();
      return;
    }
    
    // For normal theme updates
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
  }, [theme, applyThemeToDOM, resetTheme]);

  const getContentWidthClass = useCallback((baseClasses?: string) => {
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
  }, [theme.contentWidth]);

  // Create a full context value object with all the required properties
  const contextValue = {
    theme,
    setTheme,
    resolvedTheme,
    getContentWidthClass,
    resetTheme,
    computedPrimary
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};