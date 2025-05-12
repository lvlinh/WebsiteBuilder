import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'vi' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (viText: string, enText: string) => string;
  getLocalizedValue: <T extends Record<string, any>>(
    item: T, 
    viKey: keyof T, 
    enKey: keyof T
  ) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'vi',
  setLanguage: () => {},
  t: (viText) => viText,
  getLocalizedValue: () => '',
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Get language preference from localStorage or default to Vietnamese
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('sjjs-language');
      return (savedLang === 'en' || savedLang === 'vi') ? savedLang : 'vi';
    }
    return 'vi';
  });

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sjjs-language', lang);
    }
    
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
    
    // Set data-language attribute for CSS targeting
    document.documentElement.setAttribute('data-language', lang);
  };

  // Initialize HTML lang on first render
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-language', language);
  }, []);

  // Translation function
  const t = (viText: string, enText: string): string => {
    return language === 'vi' ? viText : enText;
  };

  // Dynamic field selection from objects with _vi and _en suffixes
  const getLocalizedValue = <T extends Record<string, any>>(
    item: T, 
    viKey: keyof T, 
    enKey: keyof T
  ): string => {
    if (!item) return '';
    return language === 'vi' ? item[viKey] as string : item[enKey] as string;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getLocalizedValue }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}