import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

/**
 * Completely standalone theme reset component
 * This component does not depend on any context providers or hooks
 * for theme manipulation. It directly manipulates the DOM and localStorage.
 */
export default function DirectThemeReset() {
  const { toast } = useToast();
  const { language } = useI18n();
  
  // SJJS default theme values hardcoded
  const SJJS_RED = 'hsl(351, 32%, 42%)';
  const SJJS_RGB = '139, 71, 73'; // RGB equivalent of #8B4749
  
  // Direct manipulation of CSS variables to reset theme
  const resetThemeDirectly = () => {
    try {
      // 1. Apply CSS variables directly to the root element
      document.documentElement.style.setProperty('--primary', SJJS_RED);
      document.documentElement.style.setProperty('--primary-rgb', SJJS_RGB);
      
      // 2. Remove dark mode if active
      document.documentElement.classList.remove('dark');
      
      // 3. Set the theme variant to professional
      document.documentElement.classList.remove('variant-vibrant', 'variant-tint');
      document.documentElement.classList.add('variant-professional');
      
      // 4. Set border radius
      document.documentElement.style.setProperty('--theme-radius', '0.5rem');
      
      // 5. Write directly to localStorage with a completely new object
      const defaultTheme = {
        primary: SJJS_RED,
        mode: 'light',
        variant: 'professional',
        radius: 0.5,
        contentWidth: 'normal'
      };
      
      localStorage.removeItem('theme'); // First clear existing item
      localStorage.setItem('theme', JSON.stringify(defaultTheme));
      
      // Show success message
      toast({
        title: language === 'vi' ? 'Đã khôi phục giao diện' : 'Theme reset successfully',
        description: language === 'vi' 
          ? 'Giao diện đã được đặt lại về màu đỏ SJJS mặc định' 
          : 'Theme has been reset to default SJJS red color'
      });
      
      console.log('Theme reset completed with direct DOM manipulation');
    } catch (error: any) {
      console.error('Error in direct theme reset:', error);
      toast({
        title: language === 'vi' ? 'Lỗi thiết lập lại' : 'Reset error',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };
  
  // Hard reload the page to ensure all components pick up the theme changes
  const hardReloadPage = () => {
    window.location.reload();
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h3 className="font-bold mb-2 text-gray-900">
        {language === 'vi' ? 'Khôi phục giao diện' : 'Direct Theme Reset'}
      </h3>
      
      <div className="flex flex-col gap-2">
        <Button
          onClick={resetThemeDirectly}
          variant="destructive"
          className="flex items-center gap-2 w-full justify-center"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
          {language === 'vi' ? 'Khôi phục giao diện' : 'Reset Theme'}
        </Button>
        
        <Button
          onClick={hardReloadPage}
          variant="outline"
          className="flex items-center gap-2 w-full justify-center"
          size="sm"
        >
          <RefreshCw className="h-4 w-4" />
          {language === 'vi' ? 'Tải lại trang' : 'Reload Page'}
        </Button>
      </div>
    </div>
  );
}