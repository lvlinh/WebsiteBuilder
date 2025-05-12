import React from 'react';
import { useLocation, useRoute } from 'wouter';
import ArticleEditor from './ArticleEditor';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

// This is a wrapper component that loads data and passes it to the ArticleEditor
export default function ArticleManager() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [, params] = useRoute('/admin/articles/:id');
  const articleId = params?.id ? parseInt(params.id) : undefined;
  
  const {
    data: article,
    isLoading,
  } = useQuery({
    queryKey: ['/api/articles', articleId || 'new'],
    enabled: true,
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

  return <ArticleEditor article={article} onBack={handleBack} />;
}