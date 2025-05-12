import React from 'react';
import { useLocation, useRoute } from 'wouter';
import PageEditor from './PageEditor';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

// This is a wrapper component that loads data and passes it to the PageEditor
export default function PageManager() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/pages/:id');
  const pageId = params?.id ? parseInt(params.id) : undefined;
  
  const {
    data: page,
    isLoading,
  } = useQuery({
    queryKey: pageId ? ['/api/pages', pageId] : null,
    enabled: !!pageId,
  });

  // Handle navigation back to dashboard
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('Đang tải...', 'Loading...')}</span>
      </div>
    );
  }

  return <PageEditor page={page} onBack={handleBack} />;
}