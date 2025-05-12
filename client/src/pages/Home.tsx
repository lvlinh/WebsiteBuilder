import React from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { language } = useI18n();
  
  // Fetch banner slides for the hero section
  const { data: bannerSlides = [] } = useQuery({
    queryKey: ['/api/banner-slides'],
    queryFn: async () => {
      const response = await fetch('/api/banner-slides');
      const data = await response.json();
      console.log('Banner slides data:', data);
      return data;
    }
  });
  
  // Fetch quick links
  const { data: quickLinks = [] } = useQuery({
    queryKey: ['/api/quick-links'],
    queryFn: async () => {
      const response = await fetch('/api/quick-links');
      return await response.json();
    }
  });
  
  // Fetch content blocks
  const { data: contentBlocks = [] } = useQuery({
    queryKey: ['/api/content-blocks'],
    queryFn: async () => {
      const response = await fetch('/api/content-blocks');
      return await response.json();
    }
  });
  
  // Fetch latest news/articles
  const { data: articles = [] } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      return await response.json();
    }
  });
  
  // Fetch upcoming events
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await fetch('/api/events');
      return await response.json();
    }
  });

  // Find welcome content block
  const welcomeBlock = contentBlocks.find((block: any) => block.identifier === 'home_welcome');
  
  // State to track current slide index
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  // Auto rotate slides every 5 seconds
  React.useEffect(() => {
    if (bannerSlides.length <= 1) return; // Don't rotate if only one slide
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [bannerSlides.length]);
  
  return (
    <div className="py-12 max-w-full">
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] bg-gray-200 overflow-hidden mb-16">
        {bannerSlides.length > 0 && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ 
                backgroundImage: `url(${bannerSlides[currentSlide].imageUrl})`,
                backgroundColor: 'rgba(0,0,0,0.4)',
                backgroundBlendMode: 'multiply'
              }}
            >
              <div className="container mx-auto h-full flex items-center px-8">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {language === 'vi' ? bannerSlides[currentSlide].title_vi : bannerSlides[currentSlide].title_en}
                  </h1>
                  <p className="text-xl opacity-90 mb-8">
                    {language === 'vi' ? bannerSlides[currentSlide].description_vi : bannerSlides[currentSlide].description_en}
                  </p>
                  
                  {bannerSlides[currentSlide].buttonLink && (
                    <Link href={bannerSlides[currentSlide].buttonLink}>
                      <Button size="lg">
                        {language === 'vi' ? bannerSlides[currentSlide].buttonText_vi : bannerSlides[currentSlide].buttonText_en}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {/* Slide indicators */}
            {bannerSlides.length > 1 && (
              <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
                {bannerSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Audience Navigation (Harvard-style) */}
      <section className="container mx-auto px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-center text-xl">
                {language === 'vi' ? 'Dành cho Sinh viên' : 'For Students'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li>
                  <Link href="/student/login">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Đăng nhập Cổng Sinh viên' : 'Student Portal Login'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/education">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Chương trình Đào tạo' : 'Academic Programs'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/resources">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Tài nguyên Học tập' : 'Learning Resources'}
                    </span>
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-center text-xl">
                {language === 'vi' ? 'Dành cho Giảng viên' : 'For Faculty'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li>
                  <Link href="/faculty">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Thông tin Giảng viên' : 'Faculty Directory'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/research">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Nghiên cứu' : 'Research'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Đăng nhập Quản trị' : 'Admin Login'}
                    </span>
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-center text-xl">
                {language === 'vi' ? 'Dành cho Ứng viên' : 'For Applicants'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li>
                  <Link href="/admissions">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Thông tin Tuyển sinh' : 'Admission Information'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/student/register">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Đăng ký Tài khoản' : 'Register Account'}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <span className="text-primary hover:underline cursor-pointer">
                      {language === 'vi' ? 'Về SJJS' : 'About SJJS'}
                    </span>
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Welcome Section with Content Block */}
      {welcomeBlock && (
        <section className="container mx-auto px-8 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              {language === 'vi' ? welcomeBlock.title_vi : welcomeBlock.title_en}
            </h2>
            <div 
              className="prose lg:prose-lg mx-auto"
              dangerouslySetInnerHTML={{ 
                __html: language === 'vi' ? welcomeBlock.content_vi : welcomeBlock.content_en 
              }}
            />
          </div>
        </section>
      )}
      
      {/* Quick Links Section */}
      {quickLinks.length > 0 && (
        <section className="bg-gray-100 py-12 mb-16">
          <div className="container mx-auto px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {language === 'vi' ? 'Liên kết Nhanh' : 'Quick Links'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickLinks.map((link: any) => (
                <a 
                  key={link.id}
                  href={link.url}
                  className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-medium text-primary">
                    {language === 'vi' ? link.title_vi : link.title_en}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* News and Events Section */}
      <section className="container mx-auto px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* News/Articles Column - Takes 2/3 width on desktop */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-between">
              <span>{language === 'vi' ? 'Tin tức & Bài viết' : 'News & Articles'}</span>
              <Link href="/articles">
                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                  {language === 'vi' ? 'Xem tất cả' : 'View all'}
                </span>
              </Link>
            </h2>
            
            <div className="space-y-8">
              {articles.slice(0, 3).map((article: any) => (
                <Card key={article.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {article.featuredImage && (
                      <div className="md:w-1/3">
                        <img 
                          src={article.featuredImage} 
                          alt={language === 'vi' ? article.title_vi : article.title_en}
                          className="h-52 md:h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-6 ${article.featuredImage ? 'md:w-2/3' : 'w-full'}`}>
                      <h3 className="font-bold text-lg mb-3">
                        {language === 'vi' ? article.title_vi : article.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mb-5 line-clamp-2">
                        {language === 'vi' 
                          ? article.excerpt_vi || article.content_vi?.substring(0, 150)
                          : article.excerpt_en || article.content_en?.substring(0, 150)}
                        ...
                      </p>
                      <Link href={`/articles/${article.slug}`}>
                        <Button variant="outline">
                          {language === 'vi' ? 'Đọc tiếp' : 'Read more'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Events Column - Takes 1/3 width on desktop */}
          <div>
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-between">
              <span>{language === 'vi' ? 'Sự kiện' : 'Events'}</span>
              <Link href="/events">
                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                  {language === 'vi' ? 'Xem tất cả' : 'View all'}
                </span>
              </Link>
            </h2>
            
            <div className="space-y-5">
              {events.slice(0, 4).map((event: any) => (
                <Card key={event.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-primary text-white rounded p-3 mr-4 text-center min-w-[70px]">
                        <div className="text-xl font-bold">
                          {new Date(event.startDate).getDate()}
                        </div>
                        <div className="text-xs">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2">
                          {language === 'vi' ? event.title_vi : event.title_en}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {event.location && ` • ${event.location}`}
                        </p>
                        <p className="text-sm line-clamp-2">
                          {language === 'vi' ? event.description_vi : event.description_en}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}