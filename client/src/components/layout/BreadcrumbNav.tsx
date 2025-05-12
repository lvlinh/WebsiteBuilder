import React from 'react';
import { useLocation, Link } from 'wouter';
import { useI18n } from '@/hooks/use-i18n';

export default function BreadcrumbNav() {
  const [location] = useLocation();
  const { language } = useI18n();
  
  // Don't render breadcrumbs on the home page
  if (location === '/') {
    return null;
  }
  
  // Split the path into segments
  const segments = location.split('/').filter(Boolean);
  
  // Function to get human-readable names for path segments
  const getSegmentName = (segment: string): string => {
    // Map of segment keys to translated names
    const segmentMap: Record<string, { en: string, vi: string }> = {
      about: { en: 'About Us', vi: 'Giới thiệu' },
      education: { en: 'Education', vi: 'Đào tạo' },
      admissions: { en: 'Admissions', vi: 'Tuyển sinh' },
      faculty: { en: 'Faculty', vi: 'Giảng viên' },
      articles: { en: 'Articles', vi: 'Bài viết' },
      events: { en: 'Events', vi: 'Sự kiện' },
      search: { en: 'Search', vi: 'Tìm kiếm' },
      admin: { en: 'Admin', vi: 'Quản trị' },
      student: { en: 'Student Portal', vi: 'Cổng sinh viên' },
      login: { en: 'Login', vi: 'Đăng nhập' },
      register: { en: 'Register', vi: 'Đăng ký' },
      dashboard: { en: 'Dashboard', vi: 'Bảng điều khiển' },
      pages: { en: 'Pages', vi: 'Trang' },
      categories: { en: 'Categories', vi: 'Danh mục' },
      banners: { en: 'Banners', vi: 'Banner' },
      theme: { en: 'Theme', vi: 'Giao diện' },
    };
    
    // Return the translated name if it exists, otherwise capitalize the segment
    return segmentMap[segment]
      ? segmentMap[segment][language] 
      : segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  
  return (
    <nav className="bg-gray-100 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/">
            <span className="hover:text-primary cursor-pointer">
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </span>
          </Link>
          
          {segments.map((segment, index) => {
            // Build the path up to this segment
            const path = '/' + segments.slice(0, index + 1).join('/');
            const isLast = index === segments.length - 1;
            
            return (
              <React.Fragment key={segment}>
                <span className="mx-2">/</span>
                {isLast ? (
                  <span className="font-medium text-primary">
                    {getSegmentName(segment)}
                  </span>
                ) : (
                  <Link href={path}>
                    <span className="hover:text-primary cursor-pointer">
                      {getSegmentName(segment)}
                    </span>
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}