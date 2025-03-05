import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { useI18n } from "@/lib/i18n"
import type { Page } from "@shared/schema"

export default function DynamicPage() {
  const [location] = useLocation()
  const { language } = useI18n()
  const slug = location.substring(1) // Remove leading slash

  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: ['/api/pages', slug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${slug}`)
      if (!response.ok) {
        throw new Error('Page not found')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="container py-12">
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

  if (error || !page) {
    return (
      <div className="container py-12">
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
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'vi' ? page.title_vi : page.title_en}
      </h1>
      <div className="prose max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ 
          __html: language === 'vi' ? page.content_vi : page.content_en 
        }} />
      </div>
    </div>
  )
}
