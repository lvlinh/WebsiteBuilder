import React, { createContext, ReactNode, useContext, useState, useCallback, useEffect } from 'react';

type Language = 'en' | 'vi';

interface I18nContext {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Record<string, Record<Language, string>>;
}

const defaultTranslations: Record<string, Record<Language, string>> = {
  'common.home': {
    en: 'Home',
    vi: 'Trang chủ',
  },
  'common.about': {
    en: 'About',
    vi: 'Giới thiệu',
  },
  'common.education': {
    en: 'Education',
    vi: 'Đào tạo',
  },
  'common.admissions': {
    en: 'Admissions',
    vi: 'Tuyển sinh',
  },
  'common.faculty': {
    en: 'Faculty',
    vi: 'Giảng viên',
  },
  'common.resources': {
    en: 'Resources',
    vi: 'Tài nguyên',
  },
  'common.events': {
    en: 'Events',
    vi: 'Sự kiện',
  },
  'common.news': {
    en: 'News',
    vi: 'Tin tức',
  },
  'common.login': {
    en: 'Login',
    vi: 'Đăng nhập',
  },
  'common.register': {
    en: 'Register',
    vi: 'Đăng ký',
  },
  'common.studentPortal': {
    en: 'Student Portal',
    vi: 'Cổng thông tin sinh viên',
  },
  'common.search': {
    en: 'Search',
    vi: 'Tìm kiếm',
  },
  'common.quickLinks': {
    en: 'Quick Links',
    vi: 'Liên kết nhanh',
  },
  'common.viewAll': {
    en: 'View All',
    vi: 'Xem tất cả',
  },
  'common.readMore': {
    en: 'Read More',
    vi: 'Đọc thêm',
  },
  'common.upcomingEvents': {
    en: 'Upcoming Events',
    vi: 'Sự kiện sắp tới',
  },
  'common.latestArticles': {
    en: 'Latest Articles',
    vi: 'Bài viết mới nhất',
  },
  'common.learnMore': {
    en: 'Learn More',
    vi: 'Tìm hiểu thêm',
  },
  'common.admin': {
    en: 'Admin',
    vi: 'Quản trị',
  },
  'common.dashboard': {
    en: 'Dashboard',
    vi: 'Bảng điều khiển',
  },
  'common.settings': {
    en: 'Settings',
    vi: 'Cài đặt',
  },
  'common.logout': {
    en: 'Logout',
    vi: 'Đăng xuất',
  },
  'theme.professional': {
    en: 'Professional',
    vi: 'Chuyên nghiệp',
  },
  'theme.vibrant': {
    en: 'Vibrant',
    vi: 'Sống động',
  },
  'theme.tint': {
    en: 'Tint',
    vi: 'Sắc màu',
  },
  'theme.light': {
    en: 'Light',
    vi: 'Sáng',
  },
  'theme.dark': {
    en: 'Dark',
    vi: 'Tối',
  },
  'theme.system': {
    en: 'System',
    vi: 'Hệ thống',
  },
};

const I18nContext = createContext<I18nContext | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
  initialTranslations?: Record<string, Record<Language, string>>;
}

export function I18nProvider({
  children,
  initialLanguage = 'en',
  initialTranslations = defaultTranslations,
}: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [translations, setTranslations] = useState<Record<string, Record<Language, string>>>(
    initialTranslations
  );

  // Load language preference from local storage on initial render
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'vi')) {
      setLanguageState(storedLanguage);
    }
  }, []);

  // Set language and persist to local storage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  // Translate function
  const t = useCallback(
    (key: string) => {
      const translation = translations[key];
      if (!translation) {
        console.warn(`Missing translation for key: ${key}`);
        return key;
      }
      return translation[language] || translation.en || key;
    },
    [language, translations]
  );

  // Add new translations
  const addTranslations = useCallback(
    (newTranslations: Record<string, Record<Language, string>>) => {
      setTranslations((prev) => ({ ...prev, ...newTranslations }));
    },
    []
  );

  const contextValue: I18nContext = {
    language,
    setLanguage,
    t,
    translations,
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}