import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'vi';

interface I18nContext {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  translations: Record<string, string>;
}

const defaultTranslations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome to SJJS',
    about: 'About Us',
    education: 'Education',
    admissions: 'Admissions',
    faculty: 'Faculty',
    articles: 'Articles',
    studentPortal: 'Student Portal',
    home: 'Home',
    events: 'Events',
    news: 'News',
    quickLinks: 'Quick Links',
    viewAll: 'View All',
    readMore: 'Read More',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    fullName: 'Full Name',
    submit: 'Submit',
  },
  vi: {
    welcome: 'Chào mừng đến với SJJS',
    about: 'Giới thiệu',
    education: 'Đào tạo',
    admissions: 'Tuyển sinh',
    faculty: 'Giảng viên',
    articles: 'Bài viết',
    studentPortal: 'Cổng sinh viên',
    home: 'Trang chủ',
    events: 'Sự kiện',
    news: 'Tin tức',
    quickLinks: 'Liên kết nhanh',
    viewAll: 'Xem tất cả',
    readMore: 'Đọc tiếp',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    email: 'Email',
    fullName: 'Họ và tên',
    submit: 'Gửi',
  }
};

const I18nContext = createContext<I18nContext>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  translations: {},
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState(defaultTranslations.en);

  // Load saved language preference from localStorage on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setTranslations(defaultTranslations[savedLanguage]);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setTranslations(defaultTranslations[newLanguage]);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ 
      language, 
      setLanguage: changeLanguage, 
      t, 
      translations 
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);