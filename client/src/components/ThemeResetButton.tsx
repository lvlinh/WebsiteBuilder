import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/lib/theme-provider';

// Hard-coded default theme for direct reset
const DEFAULT_THEME = {
  primary: 'hsl(351, 32%, 42%)',  // SJJS primary color #8B4749
  mode: 'light',
  variant: 'professional',
  radius: 0.5,
  contentWidth: 'normal'
};

/**
 * A standalone component to reset the website theme to default
 * Can be placed anywhere in the application where a theme reset is needed
 */
export default function ThemeResetButton() {
  const { toast } = useToast();
  const { language } = useI18n();
  const { setTheme } = useTheme();
  
  const handleResetTheme = () => {
    console.log('Directly resetting theme to default via ThemeResetButton');
    
    // First directly apply the default theme by saving to localStorage
    try {
      localStorage.setItem('theme', JSON.stringify(DEFAULT_THEME));
      console.log('Theme reset in localStorage');
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
    
    // Apply the reset flag
    setTheme({ reset: true });
    
    // For extra measure, also set all properties individually
    setTheme({
      primary: DEFAULT_THEME.primary,
      mode: DEFAULT_THEME.mode,
      variant: DEFAULT_THEME.variant as 'professional' | 'tint' | 'vibrant',
      radius: DEFAULT_THEME.radius,
      contentWidth: DEFAULT_THEME.contentWidth as 'normal' | 'wide' | 'full'
    });
    
    // Show success message
    toast({
      title: language === 'vi' ? 'Đã khôi phục giao diện mặc định' : 'Theme reset to default',
      description: language === 'vi' 
        ? 'Tất cả các cài đặt giao diện đã được khôi phục về mặc định' 
        : 'All theme settings have been restored to default values',
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleResetTheme}
      className="flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      {language === 'vi' ? 'Khôi phục giao diện' : 'Reset Theme'}
    </Button>
  );
}