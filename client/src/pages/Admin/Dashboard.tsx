import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, ImageIcon, FileEdit } from "lucide-react"
import PageEditor from "./PageEditor"
import BannerSlides from "./BannerSlides"
import ArticleEditor from "./ArticleEditor"
import ArticleCategories from "./ArticleCategories"
import PageManager from "@/components/Admin/PageManager"
import type { Page, Article } from "@shared/schema"

export default function AdminDashboard() {
  const { language } = useI18n()
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showLegacyPageEditor, setShowLegacyPageEditor] = useState(false)
  const [selectedLegacyPage, setSelectedLegacyPage] = useState<Page | null>(null)

  const { data: articles } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  })

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
            <FileText className="h-4 w-4 mr-2" />
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

        <TabsContent value="articles" className="space-y-6">
          {selectedArticle ? (
            <ArticleEditor article={selectedArticle} onBack={() => setSelectedArticle(null)} />
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedArticle({} as Article)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'vi' ? 'Tạo bài viết mới' : 'Create New Article'}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'vi' ? 'Bài viết' : 'Articles'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'vi' 
                      ? 'Quản lý tất cả bài viết'
                      : 'Manage all articles'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {articles?.map(article => (
                      <Card 
                        key={article.id} 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {language === 'vi' ? article.title_vi : article.title_en}
                              </CardTitle>
                              <CardDescription>/{article.slug}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                              {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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