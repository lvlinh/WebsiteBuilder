import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw, MonitorCheck, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme, SJJS_RED, SJJS_RGB } from '@/lib/theme-provider';

/**
 * Enhanced theme reset component that uses both:
 * 1. Context-based theme reset via useTheme() hook
 * 2. Direct DOM manipulation as a fallback
 * 
 * This gives us multiple layers of protection to ensure the theme
 * is properly reset under all circumstances.
 */
export default function DirectThemeReset() {
  const { toast } = useToast();
  const { language } = useI18n();
  const { resetTheme, theme, computedPrimary } = useTheme();
  const [debugVisible, setDebugVisible] = useState(false);
  
  // Hard reset using both methods for maximum reliability
  const performHardReset = () => {
    try {
      // First, directly force the color using exact CSS values
      // This ensures we're using the exact RGB values of SJJS brand color
      document.documentElement.style.setProperty('--primary', '#8B4749');  // Hex color format
      document.documentElement.style.setProperty('--primary-rgb', '139, 71, 73');  // Exact RGB values
      
      // Force other essential styles
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('variant-vibrant', 'variant-tint');
      document.documentElement.classList.add('variant-professional');
      document.documentElement.style.setProperty('--theme-radius', '0.5rem');
      
      // Override CSS --primary-foreground for better contrast
      document.documentElement.style.setProperty('--primary-foreground', '#FFFFFF');
      
      // Force a direct application of these styles on critical elements
      document.querySelectorAll('.bg-primary').forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#8B4749';
      });
      
      // 3. Write directly to localStorage with the true hex value to avoid conversion issues
      const defaultTheme = {
        primary: '#8B4749',  // Use hex instead of HSL to avoid conversion issues
        mode: 'light',
        variant: 'professional',
        radius: 0.5,
        contentWidth: 'normal'
      };
      
      localStorage.removeItem('theme'); // First clear existing item
      localStorage.setItem('theme', JSON.stringify(defaultTheme));
      
      // Then use the context-based reset for state management
      resetTheme();
      
      // Show success message
      toast({
        title: language === 'vi' ? 'Đã khôi phục giao diện' : 'Theme reset successfully',
        description: language === 'vi' 
          ? 'Giao diện đã được đặt lại về màu đỏ SJJS mặc định' 
          : 'Theme has been reset to default SJJS red color (#8B4749)'
      });
      
      console.log('Theme reset completed with both methods');
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
  
  // Toggle debug info display
  const toggleDebugInfo = () => {
    setDebugVisible(!debugVisible);
  };
  
  const formatThemeForDisplay = (themeObj: any) => {
    return JSON.stringify(themeObj, null, 2);
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h3 className="font-bold mb-2 text-gray-900">
        {language === 'vi' ? 'Khôi phục giao diện' : 'Theme Reset'}
      </h3>
      
      <div className="flex flex-col gap-2">
        <Button
          onClick={performHardReset}
          variant="destructive"
          className="flex items-center gap-2 w-full justify-center"
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
          {language === 'vi' ? 'Khôi phục giao diện' : 'Hard Reset Theme'}
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
        
        <Button
          onClick={toggleDebugInfo}
          variant="secondary"
          className="flex items-center gap-2 w-full justify-center text-xs"
          size="sm"
        >
          <Bug className="h-3 w-3" />
          {debugVisible ? 'Hide Debug Info' : 'Show Debug Info'}
        </Button>
        
        {debugVisible && (
          <div className="mt-2 border border-gray-200 rounded p-2 bg-gray-50 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Current Theme:</span>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: computedPrimary }}
              />
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-[10px] text-gray-700">
              {formatThemeForDisplay({
                storedTheme: theme,
                computedPrimary,
                resolvedTheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                resetCount: localStorage.getItem('resetCount') || 0
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}