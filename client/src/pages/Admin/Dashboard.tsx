import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Link } from "wouter"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, ImageIcon } from "lucide-react"
import PageEditor from "./PageEditor"
import BannerSlides from "./BannerSlides"
import type { Page } from "@shared/schema"

export default function AdminDashboard() {
  const { language } = useI18n()
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)

  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages']
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
              {/* Create New Page Button */}
              <div className="flex justify-end">
                <Link href="/admin/pages/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'vi' ? 'Tạo trang mới' : 'Create New Page'}
                  </Button>
                </Link>
              </div>

              {/* Main Pages */}
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

              {/* Sub Pages */}
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

        <TabsContent value="banners">
          <BannerSlides />
        </TabsContent>
      </Tabs>
    </div>
  )
}