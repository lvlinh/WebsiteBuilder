import HeroBanner from "@/components/Home/HeroBanner";
import NewsFeed from "@/components/Home/NewsFeed";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Clock, Calendar, GraduationCap, Book, Users, Trophy, Edit, Save, BookOpen, Mail, Library, Pencil } from "lucide-react";
import { type Event } from "@shared/schema";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define types for editable content
interface ContentBlock {
  id: number;
  identifier: string;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  type: string;
  section: string;
  order: number;
}

interface QuickLink {
  id: number;
  title_vi: string;
  title_en: string;
  url: string;
  description_vi: string | null;
  description_en: string | null;
  icon: string;
  order: number;
}

export default function Home() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [selectedQuickLink, setSelectedQuickLink] = useState<QuickLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickLinkDialogOpen, setQuickLinkDialogOpen] = useState(false);
  
  // Check if user is admin
  const { data: admin, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) return null;
        return res.json();
      } catch (error) {
        console.error('Error fetching admin data:', error);
        return null;
      }
    },
  });
  
  const isAdmin = !!admin;
  
  // Fetch content blocks
  const { data: contentBlocks = [], isLoading: isLoadingContent } = useQuery<ContentBlock[]>({
    queryKey: ['/api/content-blocks'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/content-blocks');
        if (!response.ok) {
          throw new Error('Failed to fetch content blocks');
        }
        const data = await response.json();
        
        // Filter by section if needed (we only want home section blocks)
        return data.filter((block: ContentBlock) => block.section === 'home');
      } catch (error) {
        console.error('Error fetching content blocks:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  // Fetch quick links
  const { data: quickLinks = [], isLoading: isLoadingQuickLinks } = useQuery<QuickLink[]>({
    queryKey: ['/api/quick-links'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/quick-links');
        if (!response.ok) {
          throw new Error('Failed to fetch quick links');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching quick links:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Load theme settings to determine layout preferences
  const { theme } = useTheme();
  
  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <HeroBanner />
      
      {/* Harvard-style Audience Navigation */}
      <section className="bg-[#8B4749] py-2 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center flex-wrap gap-8 text-center text-sm">
            <Link href="/admissions" className="py-2 hover:underline">
              {language === 'vi' ? 'Tuyển sinh' : 'Admissions'}
            </Link>
            <Link href="/education" className="py-2 hover:underline">
              {language === 'vi' ? 'Đào tạo' : 'Education'}
            </Link>
            <Link href="/faculty" className="py-2 hover:underline">
              {language === 'vi' ? 'Ban giảng huấn' : 'Faculty'}
            </Link>
            <Link href="/student/login" className="py-2 hover:underline">
              {language === 'vi' ? 'Sinh viên' : 'Students'}
            </Link>
            <Link href="/family" className="py-2 hover:underline">
              {language === 'vi' ? 'Gia đình SJJS' : 'SJJS Family'}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Harvard-style Quick Links Features */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          {isLoadingQuickLinks ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg h-full animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickLinks.map(link => {
                // Map icon string to actual Lucide React icon component
                let iconComponent;
                switch (link.icon) {
                  case 'Calendar':
                    iconComponent = <Calendar className="h-8 w-8" />;
                    break;
                  case 'Clock':
                    iconComponent = <Clock className="h-8 w-8" />;
                    break;
                  case 'GraduationCap':
                    iconComponent = <GraduationCap className="h-8 w-8" />;
                    break;
                  case 'Book':
                    iconComponent = <Book className="h-8 w-8" />;
                    break;
                  case 'BookOpen':
                    iconComponent = <BookOpen className="h-8 w-8" />;
                    break;
                  case 'Users':
                    iconComponent = <Users className="h-8 w-8" />;
                    break;
                  case 'Trophy':
                    iconComponent = <Trophy className="h-8 w-8" />;
                    break;
                  case 'Mail':
                    iconComponent = <Mail className="h-8 w-8" />;
                    break;
                  case 'Library':
                    iconComponent = <Library className="h-8 w-8" />;
                    break;
                  case 'Pencil':
                    iconComponent = <Pencil className="h-8 w-8" />;
                    break;
                  // Also support lowercase versions for backwards compatibility
                  case 'calendar':
                    iconComponent = <Calendar className="h-8 w-8" />;
                    break;
                  case 'clock':
                    iconComponent = <Clock className="h-8 w-8" />;
                    break;
                  case 'graduation-cap':
                    iconComponent = <GraduationCap className="h-8 w-8" />;
                    break;
                  case 'book':
                    iconComponent = <Book className="h-8 w-8" />;
                    break;
                  case 'users':
                    iconComponent = <Users className="h-8 w-8" />;
                    break;
                  case 'trophy':
                    iconComponent = <Trophy className="h-8 w-8" />;
                    break;
                  default:
                    iconComponent = <div className="h-8 w-8 bg-gray-200 rounded-full" />;
                }
                
                return (
                  <QuickLinkCard 
                    key={link.id}
                    id={link.id}
                    icon={iconComponent}
                    title={language === 'vi' ? link.title_vi : link.title_en}
                    description={language === 'vi' ? link.description_vi : link.description_en}
                    href={link.url}
                    isAdmin={isAdmin}
                    editMode={editMode}
                    onEdit={(id) => {
                      const quickLink = quickLinks.find(link => link.id === id);
                      if (quickLink) {
                        setSelectedQuickLink(quickLink);
                        setQuickLinkDialogOpen(true);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Main Content Area with Featured Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Information Blocks - Feature Section (Harvard Style) */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {contentBlocks.map((block) => (
                <div key={block.id} className="relative group">
                  {isAdmin && editMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => {
                        setSelectedBlock(block);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Sửa' : 'Edit'}
                    </Button>
                  )}
                  <InfoBlock 
                    title={language === 'vi' ? block.title_vi : block.title_en}
                    content={language === 'vi' ? block.content_vi : block.content_en}
                    type={block.type}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* News Section - Harvard Style */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#8B4749]">
                  {language === 'vi' ? 'Tin tức mới nhất' : 'Latest News'}
                </h2>
                <Link href="/articles">
                  <Button variant="link" className="text-[#8B4749]">
                    {language === 'vi' ? 'Xem tất cả' : 'View all'}
                  </Button>
                </Link>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <NewsFeed />
              </div>
            </div>
            
            {/* Right Sidebar - Harvard Style */}
            <div className="space-y-8">
              {/* Events Section */}
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-[#8B4749]">
                  {language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events'}
                </h3>
                <EventsList />
                <div className="mt-4">
                  <Link href="/events">
                    <Button variant="outline" size="sm" className="w-full">
                      {language === 'vi' ? 'Xem tất cả sự kiện' : 'View all events'}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Student Portal Access */}
              <div className="bg-[#8B4749]/10 p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-[#8B4749]">
                  {language === 'vi' ? 'Portal Sinh viên' : 'Student Portal'}
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  {language === 'vi' 
                    ? 'Truy cập cổng thông tin sinh viên để xem lịch học, kết quả và nhiều hơn nữa.' 
                    : 'Access the student portal to view your schedule, results, and more.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/student/login">
                    <Button variant="default" className="w-full bg-[#8B4749] hover:bg-[#8B4749]/90">
                      {language === 'vi' ? 'Đăng nhập' : 'Log in'}
                    </Button>
                  </Link>
                  <Link href="/student/register">
                    <Button variant="outline" className="w-full">
                      {language === 'vi' ? 'Đăng ký' : 'Register'}
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Quick Resources */}
              <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-[#8B4749]">
                  {language === 'vi' ? 'Liên kết quan trọng' : 'Important Links'}
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/resources" className="text-[#8B4749] hover:underline flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Thư viện số' : 'Digital Library'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/admissions" className="text-[#8B4749] hover:underline flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Thông tin tuyển sinh' : 'Admission Information'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources/schedule" className="text-[#8B4749] hover:underline flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {language === 'vi' ? 'Lịch học tập' : 'Academic Calendar'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Content Button for Admin */}
      {isAdmin && (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Button
            onClick={() => setEditMode(!editMode)}
            className="bg-[#8B4749] text-white hover:bg-[#8B4749]/90"
          >
            {editMode 
              ? (language === 'vi' ? 'Thoát chế độ chỉnh sửa' : 'Exit Edit Mode') 
              : (language === 'vi' ? 'Chỉnh sửa nội dung' : 'Edit Content')
            }
          </Button>
        </div>
      )}
      
      {/* Edit Content Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Chỉnh sửa nội dung' : 'Edit Content'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBlock && (
            <EditContentForm 
              block={selectedBlock} 
              onSubmit={(updatedBlock) => {
                // Invalidate the content blocks query to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/content-blocks'] });
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Quick Link Dialog */}
      <Dialog open={quickLinkDialogOpen} onOpenChange={setQuickLinkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'vi' ? 'Chỉnh sửa liên kết nhanh' : 'Edit Quick Link'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuickLink && (
            <QuickLinkEditForm 
              quickLink={selectedQuickLink} 
              onSubmit={(updatedQuickLink) => {
                // Invalidate the quick links query to refresh data
                queryClient.invalidateQueries({ queryKey: ['/api/quick-links'] });
                setQuickLinkDialogOpen(false);
              }}
              onCancel={() => setQuickLinkDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

// Helper Components
function QuickLinkCard({ 
  icon, 
  title,
  description, 
  href, 
  id,
  isAdmin,
  editMode,
  onEdit
}: { 
  icon: React.ReactNode, 
  title: string,
  description?: string | null,
  href: string,
  id?: number,
  isAdmin?: boolean,
  editMode?: boolean,
  onEdit?: (id: number) => void
}) {
  if (isAdmin && editMode && id && onEdit) {
    return (
      <div className="relative group">
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(id);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md border-0 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer h-full">
          <div className="h-12 w-12 flex items-center justify-center text-[#8B4749]">
            {icon}
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 text-center">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md border-0 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer h-full">
        <div className="h-12 w-12 flex items-center justify-center text-[#8B4749]">
          {icon}
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 text-center">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  );
}

function InfoBlock({ title, content, type = 'text' }: { title: string, content: string, type?: string }) {
  return (
    <div className="bg-white h-full transition-all hover:shadow-md group">
      <div className="p-5 border-b-4 border-[#8B4749]">
        <h3 className="text-xl font-bold mb-1 text-[#8B4749] group-hover:underline">{title}</h3>
      </div>
      <div className="p-5">
        {type === 'rich_text' || type === 'html' ? (
          <div className="text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-700">{content}</p>
        )}
      </div>
    </div>
  );
}

// Edit Content Form
function EditContentForm({ 
  block, 
  onSubmit,
  onCancel 
}: { 
  block: ContentBlock, 
  onSubmit: (block: ContentBlock) => void,
  onCancel: () => void
}) {
  const { language } = useI18n();
  const [formData, setFormData] = useState<ContentBlock>({ ...block });
  const { toast } = useToast();
  
  const handleChange = (field: keyof ContentBlock, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const saveContent = async () => {
    try {
      const response = await fetch(`/api/content-blocks/${block.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title_vi: formData.title_vi,
          title_en: formData.title_en,
          content_vi: formData.content_vi,
          content_en: formData.content_en
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update content block');
      }
      
      const updatedBlock = await response.json();
      
      // Show success message
      toast({
        title: language === 'vi' ? 'Đã lưu thành công' : 'Changes saved',
        description: language === 'vi' 
          ? 'Nội dung đã được cập nhật' 
          : 'Content has been updated',
      });
      
      onSubmit(updatedBlock);
    } catch (error) {
      console.error('Error updating content block:', error);
      
      // Show error message
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi'
          ? 'Đã xảy ra lỗi khi cập nhật nội dung'
          : 'An error occurred while updating content',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Việt)' : 'Title (Vietnamese)'}
      </h3>
      <Input 
        value={formData.title_vi}
        onChange={(e) => handleChange('title_vi', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Anh)' : 'Title (English)'}
      </h3>
      <Input 
        value={formData.title_en}
        onChange={(e) => handleChange('title_en', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Nội dung (Tiếng Việt)' : 'Content (Vietnamese)'}
      </h3>
      <Textarea 
        value={formData.content_vi}
        onChange={(e) => handleChange('content_vi', e.target.value)}
        rows={4}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Nội dung (Tiếng Anh)' : 'Content (English)'}
      </h3>
      <Textarea 
        value={formData.content_en}
        onChange={(e) => handleChange('content_en', e.target.value)}
        rows={4}
        className="mb-3"
      />
      
      {formData.type === 'rich_text' && (
        <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
          <p className="font-medium">
            {language === 'vi' ? 'Ghi chú: Định dạng HTML' : 'Note: HTML formatting'}
          </p>
          <p>
            {language === 'vi' 
              ? 'Nội dung này hỗ trợ định dạng HTML cơ bản (như <p>, <strong>, <em>, <ul>, <li>, v.v.).'
              : 'This content supports basic HTML formatting (like <p>, <strong>, <em>, <ul>, <li>, etc.).'}
          </p>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        </Button>
        <Button 
          onClick={saveContent}
          className="bg-[#8B4749] hover:bg-[#8B4749]/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {language === 'vi' ? 'Lưu thay đổi' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

// Edit Quick Link Form
function QuickLinkEditForm({ 
  quickLink, 
  onSubmit,
  onCancel 
}: { 
  quickLink: QuickLink, 
  onSubmit: (quickLink: QuickLink) => void,
  onCancel: () => void
}) {
  const { language } = useI18n();
  const [formData, setFormData] = useState<QuickLink>({ ...quickLink });
  const { toast } = useToast();
  
  const iconOptions = [
    { value: 'GraduationCap', label: 'Graduation Cap' },
    { value: 'BookOpen', label: 'Book Open' },
    { value: 'Book', label: 'Book' },
    { value: 'Calendar', label: 'Calendar' },
    { value: 'Clock', label: 'Clock' },
    { value: 'Users', label: 'Users' },
    { value: 'Trophy', label: 'Trophy' },
    { value: 'Mail', label: 'Mail' },
    { value: 'Library', label: 'Library' },
  ];
  
  const handleChange = (field: keyof QuickLink, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const saveQuickLink = async () => {
    try {
      const response = await fetch(`/api/quick-links/${quickLink.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title_vi: formData.title_vi,
          title_en: formData.title_en,
          url: formData.url,
          description_vi: formData.description_vi,
          description_en: formData.description_en,
          icon: formData.icon
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quick link');
      }
      
      const updatedQuickLink = await response.json();
      
      // Show success message
      toast({
        title: language === 'vi' ? 'Đã lưu thành công' : 'Changes saved',
        description: language === 'vi' 
          ? 'Liên kết nhanh đã được cập nhật' 
          : 'Quick link has been updated',
      });
      
      onSubmit(updatedQuickLink);
    } catch (error) {
      console.error('Error updating quick link:', error);
      
      // Show error message
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi'
          ? 'Đã xảy ra lỗi khi cập nhật liên kết nhanh'
          : 'An error occurred while updating the quick link',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Việt)' : 'Title (Vietnamese)'}
      </h3>
      <Input 
        value={formData.title_vi}
        onChange={(e) => handleChange('title_vi', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Anh)' : 'Title (English)'}
      </h3>
      <Input 
        value={formData.title_en}
        onChange={(e) => handleChange('title_en', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'URL' : 'URL'}
      </h3>
      <Input 
        value={formData.url}
        onChange={(e) => handleChange('url', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Mô tả (Tiếng Việt)' : 'Description (Vietnamese)'}
      </h3>
      <Input 
        value={formData.description_vi || ''}
        onChange={(e) => handleChange('description_vi', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Mô tả (Tiếng Anh)' : 'Description (English)'}
      </h3>
      <Input 
        value={formData.description_en || ''}
        onChange={(e) => handleChange('description_en', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Biểu tượng' : 'Icon'}
      </h3>
      <Select
        value={formData.icon}
        onValueChange={(value) => handleChange('icon', value)}
      >
        <SelectTrigger className="mb-3">
          <SelectValue placeholder={language === 'vi' ? 'Chọn biểu tượng' : 'Select icon'} />
        </SelectTrigger>
        <SelectContent>
          {iconOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        </Button>
        <Button 
          onClick={saveQuickLink}
          className="bg-[#8B4749] hover:bg-[#8B4749]/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {language === 'vi' ? 'Lưu thay đổi' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

function EventsList() {
  const { language } = useI18n();
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/upcoming'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/events?limit=3&upcoming=true');
        if (!response.ok) throw new Error('Failed to fetch upcoming events');
        return response.json();
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!events.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>{language === 'vi' ? 'Không có sự kiện sắp tới' : 'No upcoming events'}</p>
        <Link href="/events">
          <Button variant="link" className="text-[#8B4749] hover:text-[#8B4749]/80 px-0 mt-2">
            {language === 'vi' ? 'Xem tất cả sự kiện →' : 'View all events →'}
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map((event: Event) => (
        <div key={event.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
          <h4 className="font-medium text-gray-900">
            {language === 'vi' ? event.title_vi : event.title_en}
          </h4>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <time dateTime={event.startDate.toString()}>
              {new Date(event.startDate).toLocaleDateString(
                language === 'vi' ? 'vi-VN' : 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </time>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            <span className="inline-block">{event.location}</span>
          </div>
        </div>
      ))}
      <Link href="/events">
        <Button variant="link" className="text-[#8B4749] hover:text-[#8B4749]/80 px-0">
          {language === 'vi' ? 'Xem tất cả sự kiện →' : 'View all events →'}
        </Button>
      </Link>
    </div>
  );
}