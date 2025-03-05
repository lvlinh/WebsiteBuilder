import { create } from 'zustand'

type Language = 'vi' | 'en'

interface I18nStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useI18n = create<I18nStore>((set) => ({
  language: 'vi',
  setLanguage: (lang) => set({ language: lang })
}))

export const translations = {
  nav: {
    about: {
      vi: 'Giới thiệu',
      en: 'About'
    },
    admissions: {
      vi: 'Tuyển sinh',
      en: 'Admissions'  
    },
    education: {
      vi: 'Đào tạo',
      en: 'Education'
    },
    faculty: {
      vi: 'Ban giảng huấn & Nghiên cứu',
      en: 'Faculty & Research'
    },
    articles: {
      vi: 'Bài viết',
      en: 'Articles'
    },
    family: {
      vi: 'Gia đình SJJS',
      en: 'SJJS Family'
    },
    resources: {
      vi: 'Tiện ích',
      en: 'Resources'
    },
    studentPortal: {
      vi: 'Cổng thông tin sinh viên',
      en: 'Student Portal'
    }
  },
  home: {
    hero: {
      title: {
        vi: 'Chào mừng đến với SJJS',
        en: 'Welcome to SJJS'
      },
      subtitle: {
        vi: 'Học viện thần học Dòng Tên',
        en: 'Jesuit School of Theology'
      }
    }
  }
} as const