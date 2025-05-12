import React from 'react';
import { Link } from 'wouter';
import { useTheme } from '@/lib/theme-provider';
import { useI18n } from '@/hooks/use-i18n';
import LocaleToggle from './LocaleToggle';

export default function Header() {
  const { theme } = useTheme();
  const { language } = useI18n();
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">SJJS</span>
                </div>
                <span className="font-bold text-xl">
                  {language === 'vi' ? 'Học viện SJJS' : 'SJJS Seminary'}
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Trang chủ' : 'Home'}
              </span>
            </Link>
            <Link href="/about">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Giới thiệu' : 'About'}
              </span>
            </Link>
            <Link href="/education">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Đào tạo' : 'Education'}
              </span>
            </Link>
            <Link href="/admissions">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Tuyển sinh' : 'Admissions'}
              </span>
            </Link>
            <Link href="/faculty">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Giảng viên' : 'Faculty'}
              </span>
            </Link>
            <Link href="/articles">
              <span className="font-medium hover:text-white/80 transition-colors cursor-pointer">
                {language === 'vi' ? 'Bài viết' : 'Articles'}
              </span>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <LocaleToggle />
            <Link href="/student/login">
              <span className="bg-white text-primary px-3 py-1 rounded-md font-medium hover:bg-white/90 transition-colors cursor-pointer">
                {language === 'vi' ? 'Cổng sinh viên' : 'Student Portal'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}