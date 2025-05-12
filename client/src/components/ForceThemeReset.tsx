import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * Direct theme reset component that bypasses the theme context
 * This component uses direct DOM manipulation and localStorage access
 * to force reset the theme regardless of other issues
 */
export default function ForceThemeReset() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [resetCount, setResetCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Hard-coded SJJS default theme
  const DEFAULT_THEME = {
    primary: 'hsl(351, 32%, 42%)', // SJJS color #8B4749
    mode: 'light',
    variant: 'professional',
    radius: 0.5,
    contentWidth: 'normal'
  };
  
  // Function to check current theme state
  const checkCurrentTheme = () => {
    try {
      const storedTheme = localStorage.getItem('theme');
      const currentComputedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      const resolvedTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      
      setDebugInfo({
        storedTheme: storedTheme ? JSON.parse(storedTheme) : null,
        computedPrimary: currentComputedPrimary.trim(),
        resolvedTheme,
        resetCount
      });
    } catch (e: any) {
      console.error('Error checking theme:', e);
      setDebugInfo({ error: e?.message || 'Unknown error' });
    }
  };
  
  // Apply SJJS theme directly to DOM
  const applyDefaultThemeToDOM = () => {
    try {
      // Apply primary color
      document.documentElement.style.setProperty('--primary', DEFAULT_THEME.primary);
      
      // Update theme mode (light/dark)
      document.documentElement.classList.remove('dark');
      
      // Remove all variant classes and add professional
      document.documentElement.classList.remove('variant-professional', 'variant-vibrant', 'variant-tint');
      document.documentElement.classList.add('variant-professional');
      
      // Set border radius
      document.documentElement.style.setProperty('--theme-radius', `${DEFAULT_THEME.radius}rem`);
      
      // Get RGB values for primary color
      const tempDiv = document.createElement('div');
      tempDiv.style.color = DEFAULT_THEME.primary;
      document.body.appendChild(tempDiv);
      const computedColor = window.getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
      
      const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      }
      
      // Save default theme to localStorage
      localStorage.setItem('theme', JSON.stringify(DEFAULT_THEME));
      
      // Increment reset count
      setResetCount(prev => prev + 1);
      
      // Show success message
      toast({
        title: language === 'vi' ? 'Đã thiết lập lại giao diện' : 'Theme has been reset',
        description: language === 'vi' 
          ? 'Giao diện đã được đặt lại về màu đỏ SJJS mặc định' 
          : 'Theme has been reset to default SJJS red color',
      });
    } catch (e: any) {
      console.error('Error applying default theme:', e);
      toast({
        title: language === 'vi' ? 'Lỗi thiết lập lại' : 'Reset error',
        description: e?.message || 'Unknown error',
        variant: 'destructive'
      });
    }
  };
  
  // Force a window reload to apply theme
  const forceReload = () => {
    window.location.reload();
  };
  
  // Update debug info whenever resetCount changes
  useEffect(() => {
    if (showDebug) {
      checkCurrentTheme();
    }
  }, [resetCount, showDebug]);
  
  return (
    <div className="p-4 border rounded-lg bg-background shadow-sm">
      <h3 className="font-bold mb-2">
        {language === 'vi' ? 'Thiết lập lại giao diện' : 'Force Theme Reset'}
      </h3>
      
      <div className="flex flex-col space-y-2">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={applyDefaultThemeToDOM}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          {language === 'vi' ? 'Thiết lập lại ngay' : 'Hard Reset Theme'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={forceReload}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          {language === 'vi' ? 'Tải lại trang' : 'Reload Page'}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="mt-2"
        >
          {showDebug 
            ? (language === 'vi' ? 'Ẩn thông tin gỡ lỗi' : 'Hide Debug Info') 
            : (language === 'vi' ? 'Hiện thông tin gỡ lỗi' : 'Show Debug Info')}
        </Button>
        
        {showDebug && (
          <pre className={cn(
            "mt-2 p-2 text-xs bg-muted rounded text-foreground overflow-auto max-h-40",
            "border border-border"
          )}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}