import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { apiRequest } from "@/lib/queryClient"
import type { Page } from "@shared/schema"

export default function DynamicPage() {
  const [location] = useLocation()
  const { language } = useI18n()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState({ vi: "", en: "" })

  // Parse the full path to handle nested routes
  const pathParts = location.substring(1).split('/')
  const mainSlug = pathParts[0]
  const subSlug = pathParts[1]

  // Fetch all pages for navigation
  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages']
  })

  // Find the current page
  const { data: currentPage, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages', subSlug || mainSlug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${subSlug || mainSlug}`)
      if (!response.ok) {
        throw new Error('Page not found')
      }
      return response.json()
    }
  })

  // Find parent page if this is a child page
  const parentPage = currentPage?.parentId ? pages?.find(p => p.id === currentPage.parentId) : null

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
        <div className="prose max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ 
            __html: language === 'vi' ? currentPage.content_vi : currentPage.content_en 
          }} />
        </div>
      )}
    </div>
  )
}