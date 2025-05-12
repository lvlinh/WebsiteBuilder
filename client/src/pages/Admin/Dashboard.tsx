import { useState, useEffect } from "react"
import { useI18n } from "@/hooks/use-i18n"
import { useAdmin } from "@/hooks/use-admin"
import { useLocation } from "wouter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  ImageIcon, 
  FileEdit, 
  Tag, 
  LayoutDashboard, 
  Settings,
  CalendarDays,
  GraduationCap,
  Blocks,
  LogOut,
  Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading, 
  PageActions 
} from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"
import PageManager from "@/pages/Admin/PageManager"
import ArticleManager from "@/pages/Admin/ArticleManager"
import type { Page } from "@shared/schema"

export default function AdminDashboard() {
  const { t } = useI18n()
  const { admin, isLoading, logout } = useAdmin()
  const [, navigate] = useLocation()
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // If not logged in, redirect to admin login
  useEffect(() => {
    if (!isLoading && !admin) {
      navigate('/admin/login')
    }
  }, [admin, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!admin) return null
  
  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="container py-8">
      <PageHeader>
        <PageHeaderHeading>{t('Hệ thống quản trị nội dung', 'Content Management System')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t(
            'Quản lý nội dung và thông tin trang web của Học viện Thánh Giuse.',
            'Manage content and information for the Saint Joseph Seminary website.'
          )}
        </PageHeaderDescription>
        <PageActions>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            {t('Đăng xuất', 'Logout')}
          </Button>
        </PageActions>
      </PageHeader>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-3 lg:col-span-2">
          <div className="space-y-4">
            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-sm font-semibold">
                {t('Trang quản trị', 'Admin Panel')}
              </h3>
              <div className="space-y-1">
                <Button
                  variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {t('Tổng quan', 'Dashboard')}
                </Button>
                <Button
                  variant={activeTab === "pages" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("pages")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('Trang', 'Pages')}
                </Button>
                <Button
                  variant={activeTab === "articles" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("articles")}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  {t('Bài viết', 'Articles')}
                </Button>
                <Button
                  variant={activeTab === "categories" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("categories")}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {t('Danh mục', 'Categories')}
                </Button>
                <Button
                  variant={activeTab === "banners" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("banners")}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t('Banner', 'Banners')}
                </Button>
                <Button
                  variant={activeTab === "content-blocks" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("content-blocks")}
                >
                  <Blocks className="h-4 w-4 mr-2" />
                  {t('Khối nội dung', 'Content Blocks')}
                </Button>
                <Button
                  variant={activeTab === "events" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("events")}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {t('Sự kiện', 'Events')}
                </Button>
                <Button
                  variant={activeTab === "courses" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("courses")}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {t('Khóa học', 'Courses')}
                </Button>
              </div>
            </div>
            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-sm font-semibold">
                {t('Cài đặt', 'Settings')}
              </h3>
              <div className="space-y-1">
                <Button
                  variant={activeTab === "theme" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("theme")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t('Giao diện', 'Theme')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-9 lg:col-span-10">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('Trang', 'Pages')}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    {t('7 trang đã xuất bản, 5 bản nháp', '7 published, 5 drafts')}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab("pages")}>
                    {t('Quản lý trang', 'Manage Pages')}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('Bài viết', 'Articles')}
                  </CardTitle>
                  <FileEdit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    {t('20 bài đã xuất bản, 4 bản nháp', '20 published, 4 drafts')}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab("articles")}>
                    {t('Quản lý bài viết', 'Manage Articles')}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('Sự kiện', 'Events')}
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">
                    {t('3 sự kiện sắp tới, 2 đã kết thúc', '3 upcoming, 2 past')}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab("events")}>
                    {t('Quản lý sự kiện', 'Manage Events')}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {activeTab === "pages" && <PageManager />}
          
          {activeTab === "articles" && <ArticleManager />}
          
          {activeTab === "theme" && (
            <div className="bg-background border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{t('Cài đặt giao diện', 'Theme Settings')}</h2>
              <p className="text-muted-foreground mb-6">
                {t(
                  'Tùy chỉnh giao diện và màu sắc của trang web.',
                  'Customize the appearance and colors of your website.'
                )}
              </p>
              <Button onClick={() => navigate('/admin/theme')}>
                {t('Mở bộ tùy chỉnh giao diện', 'Open Theme Configurator')}
              </Button>
            </div>
          )}
          
          {(activeTab === "categories" || 
            activeTab === "banners" || 
            activeTab === "content-blocks" || 
            activeTab === "events" || 
            activeTab === "courses") && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "categories" && t('Quản lý danh mục', 'Manage Categories')}
                  {activeTab === "banners" && t('Quản lý banner', 'Manage Banners')}
                  {activeTab === "content-blocks" && t('Quản lý khối nội dung', 'Manage Content Blocks')}
                  {activeTab === "events" && t('Quản lý sự kiện', 'Manage Events')}
                  {activeTab === "courses" && t('Quản lý khóa học', 'Manage Courses')}
                </CardTitle>
                <CardDescription>
                  {t('Tính năng này đang được phát triển.', 'This feature is under development.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate(`/admin/${activeTab}`)}>
                  {t('Tiếp tục', 'Continue')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}