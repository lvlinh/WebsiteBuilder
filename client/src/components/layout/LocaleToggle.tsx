import React from 'react';
import { useI18n } from '@/hooks/use-i18n';

export default function LocaleToggle() {
  const { language, setLanguage } = useI18n();
  
  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
      aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
    >
      <span className="font-medium">{language === 'vi' ? 'EN' : 'VI'}</span>
    </button>
  );
}