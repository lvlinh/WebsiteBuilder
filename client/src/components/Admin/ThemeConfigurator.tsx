import React from 'react';
import { useTheme, Theme, ThemeColor, ColorScheme, ThemeRadius, ThemeFont } from '@/lib/theme-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useI18n } from '@/hooks/use-i18n';
import { Check, RefreshCw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ThemeConfigurator() {
  const { theme, updateTheme } = useTheme();
  const { language } = useI18n();
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = React.useState<Theme>(theme);
  const [isSaving, setIsSaving] = React.useState(false);

  // Handle color selection
  const handleColorChange = (color: ThemeColor) => {
    setCurrentTheme(prev => ({ ...prev, primaryColor: color }));
  };

  // Handle other theme settings
  const handleChange = <K extends keyof Theme>(key: K, value: Theme[K]) => {
    setCurrentTheme(prev => ({ ...prev, [key]: value }));
  };

  // Reset to defaults
  const handleReset = () => {
    setCurrentTheme({
      colorScheme: 'light',
      primaryColor: 'red',
      radius: 'medium',
      fontFamily: 'sans',
      contentWidth: 'normal',
      logoPosition: 'left',
      navStyle: 'standard',
      footerStyle: 'standard'
    });
    
    toast({
      title: language === 'vi' ? 'Đã đặt lại' : 'Reset complete',
      description: language === 'vi' 
        ? 'Các cài đặt giao diện đã được đặt lại về mặc định.' 
        : 'Theme settings have been reset to defaults.',
    });
  };

  // Save changes
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateTheme(currentTheme);
      setIsSaving(false);
      
      toast({
        title: language === 'vi' ? 'Đã lưu thành công' : 'Changes saved',
        description: language === 'vi' 
          ? 'Các thay đổi giao diện đã được áp dụng.' 
          : 'Theme changes have been applied.',
      });
    }, 500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{language === 'vi' ? 'Cài đặt giao diện' : 'Theme Settings'}</CardTitle>
        <CardDescription>
          {language === 'vi' 
            ? 'Tùy chỉnh giao diện và màu sắc của trang web.' 
            : 'Customize the appearance and colors of your website.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="colors">{language === 'vi' ? 'Màu sắc' : 'Colors'}</TabsTrigger>
            <TabsTrigger value="typography">{language === 'vi' ? 'Chữ' : 'Typography'}</TabsTrigger>
            <TabsTrigger value="layout">{language === 'vi' ? 'Bố cục' : 'Layout'}</TabsTrigger>
            <TabsTrigger value="elements">{language === 'vi' ? 'Thành phần' : 'Elements'}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>{language === 'vi' ? 'Chế độ màu' : 'Color Scheme'}</Label>
                <Select 
                  value={currentTheme.colorScheme}
                  onValueChange={(value) => handleChange('colorScheme', value as ColorScheme)}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{language === 'vi' ? 'Sáng' : 'Light'}</SelectItem>
                    <SelectItem value="dark">{language === 'vi' ? 'Tối' : 'Dark'}</SelectItem>
                    <SelectItem value="system">{language === 'vi' ? 'Hệ thống' : 'System'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{language === 'vi' ? 'Màu chủ đạo' : 'Primary Color'}</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {(['red', 'blue', 'green', 'purple', 'orange'] as ThemeColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`h-12 rounded-md flex items-center justify-center border-2 ${
                        currentTheme.primaryColor === color ? 'border-black dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: getColorValue(color) }}
                    >
                      {currentTheme.primaryColor === color && (
                        <Check className="h-6 w-6 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label>{language === 'vi' ? 'Phông chữ' : 'Font Family'}</Label>
              <Select 
                value={currentTheme.fontFamily}
                onValueChange={(value) => handleChange('fontFamily', value as ThemeFont)}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4">
              <Label>{language === 'vi' ? 'Bo tròn góc' : 'Border Radius'}</Label>
              <RadioGroup 
                className="flex flex-row space-x-4 mt-2"
                value={currentTheme.radius}
                onValueChange={(value) => handleChange('radius', value as ThemeRadius)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="radius-none" />
                  <Label htmlFor="radius-none">{language === 'vi' ? 'Không' : 'None'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="radius-small" />
                  <Label htmlFor="radius-small">{language === 'vi' ? 'Nhỏ' : 'Small'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="radius-medium" />
                  <Label htmlFor="radius-medium">{language === 'vi' ? 'Vừa' : 'Medium'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="radius-large" />
                  <Label htmlFor="radius-large">{language === 'vi' ? 'Lớn' : 'Large'}</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>{language === 'vi' ? 'Vị trí logo' : 'Logo Position'}</Label>
              <RadioGroup 
                className="flex flex-row space-x-4 mt-2"
                value={currentTheme.logoPosition}
                onValueChange={(value) => handleChange('logoPosition', value as 'left' | 'center')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="logo-left" />
                  <Label htmlFor="logo-left">{language === 'vi' ? 'Trái' : 'Left'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="center" id="logo-center" />
                  <Label htmlFor="logo-center">{language === 'vi' ? 'Giữa' : 'Center'}</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mt-4">
              <Label>{language === 'vi' ? 'Độ rộng nội dung' : 'Content Width'}</Label>
              <Select 
                value={currentTheme.contentWidth}
                onValueChange={(value) => handleChange('contentWidth', value)}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">{language === 'vi' ? 'Hẹp' : 'Narrow'}</SelectItem>
                  <SelectItem value="normal">{language === 'vi' ? 'Thường' : 'Normal'}</SelectItem>
                  <SelectItem value="wide">{language === 'vi' ? 'Rộng' : 'Wide'}</SelectItem>
                  <SelectItem value="full">{language === 'vi' ? 'Đầy đủ' : 'Full'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="elements" className="space-y-4">
            <div>
              <Label>{language === 'vi' ? 'Kiểu menu chính' : 'Navigation Style'}</Label>
              <Select 
                value={currentTheme.navStyle}
                onValueChange={(value) => handleChange('navStyle', value as 'standard' | 'mega' | 'minimal')}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{language === 'vi' ? 'Tiêu chuẩn' : 'Standard'}</SelectItem>
                  <SelectItem value="mega">{language === 'vi' ? 'Mega menu' : 'Mega Menu'}</SelectItem>
                  <SelectItem value="minimal">{language === 'vi' ? 'Tối giản' : 'Minimal'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4">
              <Label>{language === 'vi' ? 'Kiểu chân trang' : 'Footer Style'}</Label>
              <Select 
                value={currentTheme.footerStyle}
                onValueChange={(value) => handleChange('footerStyle', value as 'standard' | 'minimal' | 'detailed')}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{language === 'vi' ? 'Tiêu chuẩn' : 'Standard'}</SelectItem>
                  <SelectItem value="minimal">{language === 'vi' ? 'Tối giản' : 'Minimal'}</SelectItem>
                  <SelectItem value="detailed">{language === 'vi' ? 'Chi tiết' : 'Detailed'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            {language === 'vi' ? 'Đặt lại' : 'Reset'}
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 flex items-center gap-1"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving 
              ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') 
              : (language === 'vi' ? 'Lưu thay đổi' : 'Save Changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get CSS color value
function getColorValue(color: ThemeColor): string {
  const colors = {
    red: '#8B4749',
    blue: '#1E40AF',
    green: '#166534',
    purple: '#6D28D9',
    orange: '#C2410C'
  };
  return colors[color];
}