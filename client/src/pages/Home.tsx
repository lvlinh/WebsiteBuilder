import HeroBanner from "@/components/Home/HeroBanner";
import NewsFeed from "@/components/Home/NewsFeed";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, Calendar, GraduationCap, Book, Users, Trophy } from "lucide-react";
import { type Event } from "@shared/schema";

export default function Home() {
  const { language } = useI18n();

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
      
      {/* Information Blocks - Core values, mission statement, etc. */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoBlock 
              title={language === 'vi' ? 'Sứ mệnh của chúng tôi' : 'Our Mission'}
              content={language === 'vi' 
                ? 'Đào tạo các linh mục có trình độ và tinh thần phục vụ trong Giáo hội Công giáo Việt Nam.' 
                : 'Training priests with qualifications and spirit of service in the Catholic Church of Vietnam.'}
            />
            <InfoBlock 
              title={language === 'vi' ? 'Giá trị cốt lõi' : 'Core Values'}
              content={language === 'vi' 
                ? 'Đức tin, Trí tuệ, Cộng đồng, Xuất sắc, Phục vụ' 
                : 'Faith, Intellect, Community, Excellence, Service'}
            />
            <InfoBlock 
              title={language === 'vi' ? 'Tầm nhìn' : 'Vision'}
              content={language === 'vi' 
                ? 'Trở thành một học viện thần học hàng đầu Châu Á, đào tạo các nhà lãnh đạo tương lai cho Giáo hội.' 
                : 'To become a leading theological institution in Asia, forming future leaders for the Church.'}
            />
          </div>
        </div>
      </section>
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