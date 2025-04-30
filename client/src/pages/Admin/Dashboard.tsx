import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ImageIcon, FileEdit, Tag } from "lucide-react"
import PageEditor from "./PageEditor"
import BannerSlides from "./BannerSlides"
import ArticleCategories from "./ArticleCategories"
import PageManager from "@/components/Admin/PageManager"
import ArticleManager from "@/components/Admin/ArticleManager"
import type { Page } from "@shared/schema"

export default function AdminDashboard() {
  const { language } = useI18n()
  const [showLegacyPageEditor, setShowLegacyPageEditor] = useState(false)
  const [selectedLegacyPage, setSelectedLegacyPage] = useState<Page | null>(null)

  return (
    <div className="container py-10">
      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="pages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quản lý trang' : 'Manage Pages'}
          </TabsTrigger>
          <TabsTrigger value="articles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileEdit className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quản lý bài viết' : 'Manage Articles'}
          </TabsTrigger>
          <TabsTrigger value="article-categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Tag className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quản lý danh mục' : 'Manage Categories'}
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ImageIcon className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quản lý Banner' : 'Manage Banners'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-6">
          {showLegacyPageEditor ? (
            <PageEditor 
              page={selectedLegacyPage || {} as Page} 
              onBack={() => {
                setShowLegacyPageEditor(false)
                setSelectedLegacyPage(null)
              }} 
            />
          ) : (
            <PageManager />
          )}
        </TabsContent>

        <TabsContent value="articles">
          <ArticleManager />
        </TabsContent>

        <TabsContent value="article-categories">
          <ArticleCategories />
        </TabsContent>

        <TabsContent value="banners">
          <BannerSlides />
        </TabsContent>
      </Tabs>
    </div>
  )
}