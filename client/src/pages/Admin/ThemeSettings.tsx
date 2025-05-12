import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTheme } from '@/lib/theme-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useAdmin } from '@/hooks/use-admin';
import ThemeConfigurator from '@/components/Admin/ThemeConfigurator';
import { PageHeader, PageHeaderDescription } from '@/components/ui/page-header';
import DirectThemeReset from '@/components/DirectThemeReset';

export default function ThemeSettings() {
  const { admin, isLoading, isAdmin } = useAdmin();
  const [, navigate] = useLocation();
  const { language } = useI18n();
  
  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!isLoading && !admin) {
      navigate('/admin/login');
    }
  }, [isLoading, admin, navigate]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Only render if authenticated and is admin
  if (!admin || !isAdmin) {
    return null;
  }
  
  return (
    <div className="py-10">
      <PageHeader
        title={language === 'vi' ? 'Cài đặt giao diện' : 'Theme Settings'}
        description={
          language === 'vi'
            ? 'Tùy chỉnh giao diện và hiển thị của website'
            : 'Customize the appearance and display of the website'
        }
        breadcrumbs={[
          { href: '/admin/dashboard', label: language === 'vi' ? 'Trang quản trị' : 'Dashboard' },
          { href: '/admin/theme', label: language === 'vi' ? 'Cài đặt giao diện' : 'Theme Settings' },
        ]}
      />
      
      <div className="mt-8">
        <ThemeConfigurator />
        
        {/* Theme Reset Tool for Admins */}
        <div className="mt-10 border border-border rounded-md p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'vi' ? 'Công cụ đặt lại giao diện' : 'Theme Reset Tools'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'vi' 
              ? 'Nếu giao diện gặp sự cố, sử dụng công cụ này để đặt lại về màu SJJS mặc định (#8B4749).' 
              : 'If the theme is not displaying correctly, use this tool to reset to the default SJJS color (#8B4749).'}
          </p>
          <div className="mt-2">
            <DirectThemeReset />
          </div>
        </div>
      </div>
    </div>
  );
}