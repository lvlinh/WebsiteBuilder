import React from 'react';
import ThemeConfigurator from '@/components/Admin/ThemeConfigurator';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/ui/page-header";
import { useI18n } from '@/hooks/use-i18n';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function ThemeSettings() {
  const { t } = useI18n();
  const { admin, isLoading } = useAdmin();
  const [, navigate] = useLocation();

  // If not logged in, redirect to admin login
  React.useEffect(() => {
    if (!isLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="container py-8">
      <PageHeader className="mb-8">
        <PageHeaderHeading>{t('Cài đặt giao diện', 'Theme Settings')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t(
            'Tùy chỉnh giao diện và trải nghiệm người dùng của trang web SJJS.',
            'Customize the appearance and user experience of the SJJS website.'
          )}
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6">
        <ThemeConfigurator />
      </div>
    </div>
  );
}