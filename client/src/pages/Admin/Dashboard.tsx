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
import type { Page, Article } from "@shared/schema"

export default function AdminDashboard() {
  const { language } = useI18n()
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages']
  })

  const { data: articles } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  })

  const mainPages = pages?.filter(p => !p.parentId) || []
  const subPages = pages?.filter(p => p.parentId) || []

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
          {selectedPage ? (
            <PageEditor page={selectedPage} onBack={() => setSelectedPage(null)} />
          ) : (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedPage({} as Page)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'vi' ? 'Tạo trang mới' : 'Create New Page'}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'vi' ? 'Trang chính' : 'Main Pages'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'vi' 
                      ? 'Các trang chính trong menu điều hướng'
                      : 'Main pages in the navigation menu'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mainPages.map(page => (
                      <Card 
                        key={page.id} 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedPage(page)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {language === 'vi' ? page.title_vi : page.title_en}
                              </CardTitle>
                              <CardDescription>/{page.slug}</CardDescription>
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

              {subPages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'vi' ? 'Trang con' : 'Sub Pages'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'vi' 
                        ? 'Các trang con của trang chính'
                        : 'Sub pages of main pages'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {subPages.map(page => {
                        const parentPage = mainPages.find(p => p.id === page.parentId)
                        return (
                          <Card 
                            key={page.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => setSelectedPage(page)}
                          >
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {language === 'vi' ? page.title_vi : page.title_en}
                                  </CardTitle>
                                  <CardDescription>
                                    {parentPage && (
                                      <span className="text-muted-foreground">
                                        {language === 'vi' ? parentPage.title_vi : parentPage.title_en}
                                      </span>
                                    )} / {page.slug}
                                  </CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                  {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
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