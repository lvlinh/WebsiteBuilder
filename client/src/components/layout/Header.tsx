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
              <a className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">SJJS</span>
                </div>
                <span className="font-bold text-xl">
                  {language === 'vi' ? 'Học viện SJJS' : 'SJJS Seminary'}
                </span>
              </a>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Trang chủ' : 'Home'}
              </a>
            </Link>
            <Link href="/about">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Giới thiệu' : 'About'}
              </a>
            </Link>
            <Link href="/education">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Đào tạo' : 'Education'}
              </a>
            </Link>
            <Link href="/admissions">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Tuyển sinh' : 'Admissions'}
              </a>
            </Link>
            <Link href="/faculty">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Giảng viên' : 'Faculty'}
              </a>
            </Link>
            <Link href="/articles">
              <a className="font-medium hover:text-white/80 transition-colors">
                {language === 'vi' ? 'Bài viết' : 'Articles'}
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <LocaleToggle />
            <Link href="/student/login">
              <a className="bg-white text-primary px-3 py-1 rounded-md font-medium hover:bg-white/90 transition-colors">
                {language === 'vi' ? 'Cổng sinh viên' : 'Student Portal'}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}