import React from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/hooks/use-i18n';

export default function BreadcrumbNav() {
  const [location] = useLocation();
  const { language } = useI18n();

  // Skip rendering breadcrumbs on the home page
  if (location === '/') {
    return null;
  }

  const pathSegments = location.split('/').filter(Boolean);
  
  // Create translated titles for each path segment
  const getTranslatedSegment = (segment: string): string => {
    // Map path segments to translated titles
    const translations: Record<string, Record<string, string>> = {
      en: {
        about: 'About',
        education: 'Education',
        admissions: 'Admissions',
        faculty: 'Faculty',
        articles: 'Articles',
        events: 'Events',
        student: 'Student Portal',
        login: 'Login',
        register: 'Register',
        dashboard: 'Dashboard',
        admin: 'Admin',
        pages: 'Pages',
        categories: 'Categories',
        banners: 'Banner Slides',
        theme: 'Theme Settings',
      },
      vi: {
        about: 'Giới thiệu',
        education: 'Đào tạo',
        admissions: 'Tuyển sinh',
        faculty: 'Giảng viên',
        articles: 'Bài viết',
        events: 'Sự kiện',
        student: 'Cổng sinh viên',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        dashboard: 'Bảng điều khiển',
        admin: 'Quản trị',
        pages: 'Trang',
        categories: 'Danh mục',
        banners: 'Banner',
        theme: 'Giao diện',
      }
    };
    
    return translations[language][segment] || segment;
  };

  return (
    <nav className="bg-gray-100 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <ol className="flex items-center text-sm">
          {/* Home link */}
          <li className="flex items-center">
            <Link href="/">
              <span className="text-primary hover:text-primary/90 transition-colors cursor-pointer">
                {language === 'vi' ? 'Trang chủ' : 'Home'}
              </span>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          
          {/* Nested paths */}
          {pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1;
            const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
            
            return (
              <li key={segment} className="flex items-center">
                {isLast ? (
                  <span className="text-gray-600 font-medium">
                    {getTranslatedSegment(segment)}
                  </span>
                ) : (
                  <>
                    <Link href={path}>
                      <span className="text-primary hover:text-primary/90 transition-colors cursor-pointer">
                        {getTranslatedSegment(segment)}
                      </span>
                    </Link>
                    <span className="mx-2 text-gray-400">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}