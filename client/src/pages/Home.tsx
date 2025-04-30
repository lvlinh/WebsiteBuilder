import HeroBanner from "@/components/Home/HeroBanner";
import NewsFeed from "@/components/Home/NewsFeed";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Clock, Calendar, GraduationCap, Book, Users, Trophy, Edit, Save } from "lucide-react";
import { type Event } from "@shared/schema";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Define type for editable content blocks
interface ContentBlock {
  id: number;
  titleVi: string;
  titleEn: string;
  contentVi: string;
  contentEn: string;
}

export default function Home() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
  
  // Fetch editable content
  const { data: contentBlocks = [], isLoading: isLoadingContent } = useQuery<ContentBlock[]>({
    queryKey: ['/api/content-blocks'],
    queryFn: async () => {
      try {
        // This would normally come from an API endpoint, but for demo purposes,
        // we'll use local data until the API is implemented
        return [
          {
            id: 1,
            titleVi: 'Tầm nhìn',
            titleEn: 'Our Vision',
            contentVi: 'Trở thành một cơ sở đào tạo linh mục hàng đầu, nuôi dưỡng các nhà lãnh đạo tâm linh của Giáo hội Công giáo trong tinh thần Dòng Tên.',
            contentEn: 'To become a leading seminary, nurturing spiritual leaders of the Catholic Church in the Jesuit tradition.'
          },
          {
            id: 2,
            titleVi: 'Sứ mệnh',
            titleEn: 'Our Mission',
            contentVi: 'Đào tạo các linh mục và các nhà lãnh đạo tôn giáo có học thức, tận tâm và nhiệt huyết, sẵn sàng phục vụ Giáo hội và xã hội.',
            contentEn: 'To form educated, dedicated, and passionate priests and religious leaders ready to serve the Church and society.'
          },
          {
            id: 3,
            titleVi: 'Giá trị cốt lõi',
            titleEn: 'Core Values',
            contentVi: 'Xuất sắc học thuật, tâm linh sâu sắc, phục vụ tha nhân, trách nhiệm xã hội, và tinh thần cộng đồng.',
            contentEn: 'Academic excellence, spiritual depth, service to others, social responsibility, and community spirit.'
          }
        ];
      } catch (error) {
        console.error('Error fetching content blocks:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <main className="bg-white">
      {/* Hero Banner Section */}
      <HeroBanner />
      
      {/* Quick Links Section - Harvard-style top navigation features */}
      <section className="bg-[#8B4749]/10 py-8 border-y border-gray-200">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <QuickLinkCard 
              icon={<Calendar className="h-8 w-8" />}
              title={language === 'vi' ? 'Lịch học' : 'Calendar'}
              href="/calendar"
            />
            <QuickLinkCard 
              icon={<Clock className="h-8 w-8" />}
              title={language === 'vi' ? 'Sự kiện' : 'Events'}
              href="/events"
            />
            <QuickLinkCard 
              icon={<GraduationCap className="h-8 w-8" />}
              title={language === 'vi' ? 'Tuyển sinh' : 'Admissions'}
              href="/admissions"
            />
            <QuickLinkCard 
              icon={<Book className="h-8 w-8" />}
              title={language === 'vi' ? 'Thư viện' : 'Library'}
              href="/resources"
            />
            <QuickLinkCard 
              icon={<Users className="h-8 w-8" />}
              title={language === 'vi' ? 'Giảng viên' : 'Faculty'}
              href="/faculty"
            />
            <QuickLinkCard 
              icon={<Trophy className="h-8 w-8" />}
              title={language === 'vi' ? 'Thành tựu' : 'Achievements'}
              href="/about"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Content Section */}
      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Latest news */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  {language === 'vi' ? 'Tin tức mới nhất' : 'Latest News'}
                </h2>
                <Link href="/articles">
                  <Button variant="outline">
                    {language === 'vi' ? 'Xem tất cả' : 'View all'}
                  </Button>
                </Link>
              </div>
              <NewsFeed />
            </div>
            
            {/* Right column - Upcoming events, announcements, etc. */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events'}
              </h3>
              <EventsList />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {language === 'vi' ? 'Portal Sinh viên' : 'Student Portal'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === 'vi' 
                    ? 'Truy cập cổng thông tin sinh viên để xem lịch học, kết quả và nhiều hơn nữa.' 
                    : 'Access the student portal to view your schedule, results, and more.'}
                </p>
                <Link href="/student/login">
                  <Button className="w-full bg-[#8B4749] hover:bg-[#8B4749]/90">
                    {language === 'vi' ? 'Đăng nhập ngay' : 'Login now'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Information Blocks - Admin Editable Content */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  title={language === 'vi' ? block.titleVi : block.titleEn}
                  content={language === 'vi' ? block.contentVi : block.contentEn}
                />
              </div>
            ))}
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
                // In a real app, you would save this to an API
                const updatedBlocks = contentBlocks.map(b => 
                  b.id === updatedBlock.id ? updatedBlock : b
                );
                
                // For demo purposes, we'll just show a success toast
                toast({
                  title: language === 'vi' ? 'Đã lưu thành công' : 'Changes saved',
                  description: language === 'vi' 
                    ? 'Nội dung đã được cập nhật' 
                    : 'Content has been updated',
                });
                
                setDialogOpen(false);
              }}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

// Helper Components
function QuickLinkCard({ icon, title, href }: { icon: React.ReactNode, title: string, href: string }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[#8B4749] shadow-sm hover:shadow transition-all cursor-pointer h-full">
        {icon}
        <h3 className="mt-2 text-sm font-medium text-gray-900 text-center">{title}</h3>
      </div>
    </Link>
  );
}

function InfoBlock({ title, content }: { title: string, content: string }) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm h-full">
      <h3 className="text-xl font-bold mb-4 text-[#8B4749]">{title}</h3>
      <p className="text-gray-700">{content}</p>
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
  
  const handleChange = (field: keyof ContentBlock, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Việt)' : 'Title (Vietnamese)'}
      </h3>
      <Input 
        value={formData.titleVi}
        onChange={(e) => handleChange('titleVi', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Tiêu đề (Tiếng Anh)' : 'Title (English)'}
      </h3>
      <Input 
        value={formData.titleEn}
        onChange={(e) => handleChange('titleEn', e.target.value)}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Nội dung (Tiếng Việt)' : 'Content (Vietnamese)'}
      </h3>
      <Textarea 
        value={formData.contentVi}
        onChange={(e) => handleChange('contentVi', e.target.value)}
        rows={4}
        className="mb-3"
      />
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {language === 'vi' ? 'Nội dung (Tiếng Anh)' : 'Content (English)'}
      </h3>
      <Textarea 
        value={formData.contentEn}
        onChange={(e) => handleChange('contentEn', e.target.value)}
        rows={4}
        className="mb-3"
      />
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        </Button>
        <Button 
          onClick={() => onSubmit(formData)}
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