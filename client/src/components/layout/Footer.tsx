import React from 'react';
import { Link } from 'wouter';
import { useI18n } from '@/hooks/use-i18n';

export default function Footer() {
  const { language, t } = useI18n();
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and description */}
          <div className="space-y-4">
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
            <p className="text-gray-400 mt-4">
              {language === 'vi' 
                ? 'Học viện Thánh Giuse Dòng Tên - Nơi đào tạo các nhà lãnh đạo tinh thần tương lai.'
                : 'Saint Joseph Jesuit Seminary - Forming future spiritual leaders.'}
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('about')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/education">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('education')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admissions">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('admissions')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/faculty">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('faculty')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {language === 'vi' ? 'Tài Nguyên' : 'Resources'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/articles">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('articles')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {t('events')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/library">
                  <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    {language === 'vi' ? 'Thư viện' : 'Library'}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              {language === 'vi' ? 'Liên Hệ' : 'Contact Us'}
            </h3>
            <address className="not-italic text-gray-400 space-y-2">
              <p>SJJS Seminary</p>
              <p>123 Education Street</p>
              <p>Ho Chi Minh City, Vietnam</p>
              <p className="mt-4">
                Email: <a href="mailto:info@sjjs.edu.vn" className="hover:text-white transition-colors">info@sjjs.edu.vn</a>
              </p>
              <p>
                Phone: <a href="tel:+842812345678" className="hover:text-white transition-colors">+84 28 1234 5678</a>
              </p>
            </address>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} SJJS Seminary. {language === 'vi' ? 'Đã đăng ký Bản quyền.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}