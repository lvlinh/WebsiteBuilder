import React, { createContext, useState, useContext, useEffect } from 'react';

// Simplified theme types
type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: {
    primary: string;
    mode: ThemeMode;
  };
  setTheme: (newTheme: Partial<{primary: string; mode: ThemeMode}>) => void;
  resolvedTheme: ThemeMode;
}

const defaultTheme = {
  primary: 'hsl(351, 32%, 42%)', // SJJS primary color
  mode: 'light' as ThemeMode
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  resolvedTheme: 'light'
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

  const setTheme = (newTheme: Partial<{primary: string; mode: ThemeMode}>) => {
    setThemeState({
      ...theme,
      ...newTheme
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);