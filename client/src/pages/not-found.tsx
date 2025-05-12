import React from 'react';
import { Link } from 'wouter';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { language } = useI18n();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
      <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">
        {language === 'vi' 
          ? 'Trang không tìm thấy'
          : 'Page Not Found'}
      </h2>
      <p className="text-gray-600 max-w-md text-center mb-8">
        {language === 'vi'
          ? 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'
          : 'Sorry, the page you are looking for doesn\'t exist or has been moved.'}
      </p>
      <Link href="/">
        <Button>
          {language === 'vi' ? 'Trở về trang chủ' : 'Back to Home'}
        </Button>
      </Link>
    </div>
  );
}