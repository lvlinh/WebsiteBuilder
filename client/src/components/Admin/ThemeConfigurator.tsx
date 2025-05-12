import React from 'react';
import { useTheme } from '@/lib/theme-provider';
import { useI18n } from '@/hooks/use-i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HexColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Smartphone, Tablet, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeConfigurator() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, t } = useI18n();
  
  const handlePrimaryColorChange = (color: string) => {
    setTheme({ primary: color });
  };
  
  const handleRadiusChange = (value: number[]) => {
    setTheme({ radius: value[0] });
  };
  
  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    setTheme({ mode });
  };
  
  const handleVariantChange = (variant: 'professional' | 'vibrant' | 'tint') => {
    setTheme({ variant });
  };
  
  const handleContentWidthChange = (contentWidth: 'regular' | 'wide' | 'narrow') => {
    setTheme({ contentWidth });
  };
  
  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList>
        <TabsTrigger value="appearance">
          {language === 'vi' ? 'Giao diện' : 'Appearance'}
        </TabsTrigger>
        <TabsTrigger value="layout">
          {language === 'vi' ? 'Bố cục' : 'Layout'}
        </TabsTrigger>
        <TabsTrigger value="colors">
          {language === 'vi' ? 'Màu sắc' : 'Colors'}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="appearance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Chế độ hiển thị' : 'Display Mode'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Chọn chế độ hiển thị sáng, tối hoặc theo hệ thống'
                : 'Choose between light, dark, or system display mode'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center space-x-2">
            <Button
              variant={theme.mode === 'light' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleModeChange('light')}
              className={cn(
                'h-10 w-10 rounded-full',
                resolvedTheme === 'dark' ? 'bg-muted' : 'bg-white'
              )}
            >
              <Sun className="h-5 w-5" />
              <span className="sr-only">Light Mode</span>
            </Button>
            <Button
              variant={theme.mode === 'dark' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleModeChange('dark')}
              className={cn(
                'h-10 w-10 rounded-full',
                resolvedTheme === 'dark' ? 'bg-slate-900' : 'bg-slate-700'
              )}
            >
              <Moon className="h-5 w-5" />
              <span className="sr-only">Dark Mode</span>
            </Button>
            <Button
              variant={theme.mode === 'system' ? 'default' : 'outline'}
              size="icon"
              onClick={() => handleModeChange('system')}
              className="h-10 w-10 rounded-full"
            >
              <Monitor className="h-5 w-5" />
              <span className="sr-only">System Mode</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Biến thể' : 'Variant'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Chọn biến thể cho website'
                : 'Choose a variant for the website'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.variant === 'professional' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleVariantChange('professional')}
                >
                  <div className="bg-background h-1/3 border-b"></div>
                  <div className="p-2">
                    <div className="h-2 w-2/3 rounded-full bg-primary mb-2"></div>
                    <div className="h-2 w-full rounded-full bg-muted"></div>
                    <div className="h-2 w-full rounded-full bg-muted mt-2"></div>
                  </div>
                </div>
                <p className="text-center text-sm">{t('theme.professional')}</p>
              </div>
              
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.variant === 'vibrant' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleVariantChange('vibrant')}
                >
                  <div className="bg-primary h-1/3"></div>
                  <div className="p-2">
                    <div className="h-2 w-2/3 rounded-full bg-primary mb-2"></div>
                    <div className="h-2 w-full rounded-full bg-muted"></div>
                    <div className="h-2 w-full rounded-full bg-muted mt-2"></div>
                  </div>
                </div>
                <p className="text-center text-sm">{t('theme.vibrant')}</p>
              </div>
              
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.variant === 'tint' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleVariantChange('tint')}
                >
                  <div className="bg-background h-1/3 border-b"></div>
                  <div className="bg-primary/10 p-2">
                    <div className="h-2 w-2/3 rounded-full bg-primary mb-2"></div>
                    <div className="h-2 w-full rounded-full bg-muted"></div>
                    <div className="h-2 w-full rounded-full bg-muted mt-2"></div>
                  </div>
                </div>
                <p className="text-center text-sm">{t('theme.tint')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Bo tròn góc' : 'Corner Radius'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Điều chỉnh độ bo tròn cho các thành phần'
                : 'Adjust the corner radius for components'}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Slider
                  value={[theme.radius]}
                  max={2}
                  step={0.1}
                  onValueChange={handleRadiusChange}
                />
                <div className="flex justify-between text-xs">
                  <span>{language === 'vi' ? 'Vuông' : 'Square'}</span>
                  <span>{language === 'vi' ? 'Bo tròn' : 'Rounded'}</span>
                  <span>{language === 'vi' ? 'Tròn' : 'Circular'}</span>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div
                  className="w-16 h-16 bg-primary"
                  style={{ borderRadius: `${theme.radius * 0.5}rem` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="layout" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Độ rộng nội dung' : 'Content Width'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Chọn độ rộng nội dung trang'
                : 'Choose the content width for pages'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.contentWidth === 'narrow' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleContentWidthChange('narrow')}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="w-1/2 h-3/4 bg-primary/20 rounded"></div>
                  </div>
                </div>
                <p className="text-center text-sm">
                  {language === 'vi' ? 'Hẹp' : 'Narrow'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.contentWidth === 'regular' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleContentWidthChange('regular')}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="w-2/3 h-3/4 bg-primary/20 rounded"></div>
                  </div>
                </div>
                <p className="text-center text-sm">
                  {language === 'vi' ? 'Tiêu chuẩn' : 'Regular'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div
                  className={cn(
                    'aspect-video rounded-md border-2 overflow-hidden cursor-pointer',
                    theme.contentWidth === 'wide' ? 'border-primary' : 'border-border'
                  )}
                  onClick={() => handleContentWidthChange('wide')}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className="w-5/6 h-3/4 bg-primary/20 rounded"></div>
                  </div>
                </div>
                <p className="text-center text-sm">
                  {language === 'vi' ? 'Rộng' : 'Wide'}
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <div className="text-center text-sm text-muted-foreground">
                {language === 'vi'
                  ? 'Độ rộng nội dung hiện tại:'
                  : 'Current content width:'}{' '}
                <span className="font-medium text-foreground">
                  {theme.contentWidth === 'narrow'
                    ? language === 'vi'
                      ? 'Hẹp'
                      : 'Narrow'
                    : theme.contentWidth === 'regular'
                    ? language === 'vi'
                      ? 'Tiêu chuẩn'
                      : 'Regular'
                    : language === 'vi'
                    ? 'Rộng'
                    : 'Wide'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="colors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{language === 'vi' ? 'Màu chủ đạo' : 'Primary Color'}</CardTitle>
            <CardDescription>
              {language === 'vi'
                ? 'Chọn màu chủ đạo cho website'
                : 'Choose the primary color for the website'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <HexColorPicker color={theme.primary} onChange={handlePrimaryColorChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={theme.primary}
                onChange={(e) => handlePrimaryColorChange(e.target.value)}
                className="font-mono"
              />
              <div
                className="w-10 h-10 rounded-md border"
                style={{ backgroundColor: theme.primary }}
              ></div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {['#8B4749', '#1E40AF', '#047857', '#B91C1C', '#6D28D9'].map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  className="w-full h-8 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePrimaryColorChange(color)}
                >
                  <span className="sr-only">{color}</span>
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handlePrimaryColorChange('#8B4749')}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              {language === 'vi' ? 'Đặt lại màu mặc định' : 'Reset to default color'}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}