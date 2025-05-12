import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { useI18n } from "@/lib/i18n"
import { useTheme } from "@/lib/theme-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { apiRequest } from "@/lib/queryClient"
import type { Page } from "@shared/schema"
import Articles from "./Articles"
import Events from "./Events"

// Separate components for special pages to maintain proper React hooks
function ArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Articles />
      </div>
    </div>
  )
}

function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Events />
      </div>
    </div>
  )
}

// Regular page component
function RegularPage({ mainSlug, subSlug }: { mainSlug: string, subSlug?: string }) {
  const { language } = useI18n()
  const { toast } = useToast()
  const { getContentWidthClass } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState({ vi: "", en: "" })

  // Fetch all pages for navigation
  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages']
  })

  // Find the current page
  const { data: currentPage, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages', subSlug || mainSlug],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/pages/${subSlug || mainSlug}`)
        if (!response.ok) {
          console.error(`Page not found: ${subSlug || mainSlug}`)
          return null
        }
        return response.json()
      } catch (err) {
        console.error(`Error fetching page: ${err}`)
        return null
      }
    }
  })

  // Find parent page if this is a child page
  const parentPage = currentPage?.parentId ? pages?.find(p => p.id === currentPage.parentId) : null

  // Fetch articles from the linked category if this is a category page
  const { data: categoryArticles } = useQuery({
    queryKey: ['/api/articles/by-category', currentPage?.linkedCategoryId],
    queryFn: async () => {
      if (!currentPage?.linkedCategoryId) return []
      const response = await fetch(`/api/articles/by-category/${currentPage.linkedCategoryId}`)
      if (!response.ok) throw new Error('Failed to fetch articles')
      return response.json()
    },
    enabled: !!currentPage?.linkedCategoryId && currentPage?.pageType === 'category'
  })

  // Fetch the article category for display
  const { data: category } = useQuery({
    queryKey: ['/api/article-categories', currentPage?.linkedCategoryId],
    queryFn: async () => {
      if (!currentPage?.linkedCategoryId) return null
      const response = await fetch(`/api/article-categories/${currentPage.linkedCategoryId}`)
      if (!response.ok) throw new Error('Failed to fetch category')
      return response.json()
    },
    enabled: !!currentPage?.linkedCategoryId && currentPage?.pageType === 'category'
  })

  // Check if user is admin
  const { data: admin } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          return response.json()
        }
        return null
      } catch {
        return null
      }
    }
  })

  useEffect(() => {
    if (currentPage) {
      setEditedContent({
        vi: currentPage.content_vi,
        en: currentPage.content_en
      })
    }
  }, [currentPage])

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Page> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}`, data)
      return res.json()
    },
    onSuccess: () => {
      setIsEditing(false)
      toast({
        title: language === 'vi' ? 'Cập nhật thành công' : 'Update successful',
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật thất bại' : 'Update failed',
      })
    }
  })

  const handleSave = () => {
    if (!currentPage) return

    updatePageMutation.mutate({
      id: currentPage.id,
      content_vi: editedContent.vi,
      content_en: editedContent.en
    })
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentPage) {
    return (
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">
          {language === 'vi' ? 'Không tìm thấy trang' : 'Page not found'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' 
            ? 'Trang bạn đang tìm kiếm không tồn tại.'
            : 'The page you are looking for does not exist.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb navigation */}
        {parentPage && (
          <div className="mb-6 text-sm text-muted-foreground">
            <a href={`/${parentPage.slug}`} className="hover:underline">
              {language === 'vi' ? parentPage.title_vi : parentPage.title_en}
            </a>
            <span className="mx-2">/</span>
            <span>{language === 'vi' ? currentPage.title_vi : currentPage.title_en}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            {language === 'vi' ? currentPage.title_vi : currentPage.title_en}
          </h1>
          {admin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updatePageMutation.isPending}
                  >
                    {language === 'vi' ? 'Lưu' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  {language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                </Button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'vi' ? 'Nội dung tiếng Việt' : 'Vietnamese Content'}
              </h2>
              <RichTextEditor
                content={editedContent.vi}
                onChange={(html) => setEditedContent(prev => ({ ...prev, vi: html }))}
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {language === 'vi' ? 'Nội dung tiếng Anh' : 'English Content'}
              </h2>
              <RichTextEditor
                content={editedContent.en}
                onChange={(html) => setEditedContent(prev => ({ ...prev, en: html }))}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Regular page content */}
            {(currentPage.pageType === 'regular' || !currentPage.pageType) && (
              <div className="prose max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ 
                  __html: language === 'vi' ? currentPage.content_vi : currentPage.content_en 
                }} />
              </div>
            )}
            
            {/* Category page content - first show intro text, then article list */}
            {currentPage.pageType === 'category' && (
              <div className="space-y-8">
                {/* Intro content if any */}
                {(currentPage.content_vi || currentPage.content_en) && (
                  <div className="prose max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ 
                      __html: language === 'vi' ? currentPage.content_vi : currentPage.content_en 
                    }} />
                  </div>
                )}
                
                {/* Category title and description */}
                {category && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      {language === 'vi' ? category.title_vi : category.title_en}
                    </h2>
                  </div>
                )}
                
                {/* Articles grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryArticles?.map(article => (
                    <a 
                      key={article.id} 
                      href={`/nghien-cuu-xuat-ban/bai-viet/${article.slug}`}
                      className="group block overflow-hidden rounded-lg border border-muted bg-card transition-all hover:shadow-md"
                    >
                      {article.featuredImage && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={article.featuredImage} 
                            alt={language === 'vi' ? article.title_vi : article.title_en}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-xl font-semibold group-hover:text-primary">
                          {language === 'vi' ? article.title_vi : article.title_en}
                        </h3>
                        {(article.summary_vi || article.summary_en) && (
                          <p className="line-clamp-3 mt-2 text-muted-foreground">
                            {language === 'vi' ? article.summary_vi : article.summary_en}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(article.publishedAt).toLocaleDateString(
                              language === 'vi' ? 'vi-VN' : 'en-US', 
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </span>
                          <span className="text-primary font-medium">
                            {language === 'vi' ? 'Đọc thêm' : 'Read more'}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* Empty state if no articles */}
                {(!categoryArticles || categoryArticles.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>
                      {language === 'vi' 
                        ? 'Chưa có bài viết nào trong danh mục này.'
                        : 'No articles in this category yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Main component that determines which page to display
export default function DynamicPage() {
  const [location] = useLocation()
  
  // Parse the full path to handle nested routes
  const pathParts = location.substring(1).split('/')
  const mainSlug = pathParts[0]
  const subSlug = pathParts[1]

  // Special handling for articles page
  if (mainSlug === "nghien-cuu-xuat-ban" && subSlug === "bai-viet") {
    return <ArticlesPage />
  }

  // Special handling for events page
  if (mainSlug === "gia-dinh-sjjs" && subSlug === "su-kien") {
    return <EventsPage />
  }

  // Regular page
  return <RegularPage mainSlug={mainSlug} subSlug={subSlug} />
}