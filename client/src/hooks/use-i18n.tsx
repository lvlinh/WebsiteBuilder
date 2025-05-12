import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
type Language = 'vi' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, defaultEn: string, defaultVi: string) => string;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or browser language
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const storedLang = localStorage.getItem('sjjs-language');
      if (storedLang && (storedLang === 'vi' || storedLang === 'en')) {
        return storedLang as Language;
      }
      
      // If no stored language, try to detect from browser
      const browserLang = navigator.language.substring(0, 2);
      return browserLang === 'vi' ? 'vi' : 'en';
    } catch (error) {
      console.error('Error loading language from localStorage:', error);
      return 'en'; // Default to English
    }
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('sjjs-language', language);
      // Also update html lang attribute for accessibility
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, [language]);

  // Wrapper function to set language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Translation function
  const t = (key: string, defaultEn: string, defaultVi: string) => {
    return language === 'vi' ? defaultVi : defaultEn;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use internationalization
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}