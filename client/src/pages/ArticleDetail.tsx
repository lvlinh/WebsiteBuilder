import { useQuery } from "@tanstack/react-query"
import { useParams } from "wouter"
import { useI18n } from "@/lib/i18n"
import { format, parseISO, isValid } from "date-fns"
import type { Article, ArticleCategory } from "@shared/schema"

export default function ArticleDetail() {
  const { language } = useI18n()
  const { slug } = useParams()

  // Fetch the specific article by slug
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['/api/articles', slug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }
      const data = await response.json()
      console.log('Fetched article data:', data) // Debug log
      return data
    },
    enabled: !!slug
  })

  // Fetch article categories
  const { data: categories } = useQuery<ArticleCategory[]>({
    queryKey: ['/api/article-categories']
  })

  if (isLoading) {
    return (
      <main className="container py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="aspect-video bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="container py-12">
        <h1 className="text-4xl font-bold text-center">
          {language === 'vi' ? 'Không tìm thấy bài viết' : 'Article not found'}
        </h1>
      </main>
    )
  }

  // Parse and validate the date
  const publishDate = article.publishedAt ? parseISO(article.publishedAt.toString()) : null
  const formattedDate = publishDate && isValid(publishDate) ? format(publishDate, 'PPP') : ''

  // Find the category details
  const category = categories?.find(cat => cat.slug === article.category)

  const content = language === 'vi' ? article.content_vi : article.content_en

  return (
    <main className="container py-12">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {language === 'vi' ? article.title_vi : article.title_en}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {article.author && (
              <>
                <span>{article.author}</span>
                <span>•</span>
              </>
            )}
            {formattedDate && (
              <>
                <time dateTime={article.publishedAt?.toString()}>
                  {formattedDate}
                </time>
                <span>•</span>
              </>
            )}
            {category && (
              <span className="capitalize">
                {language === 'vi' ? category.title_vi : category.title_en}
              </span>
            )}
          </div>
        </header>

        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt={language === 'vi' ? article.title_vi : article.title_en}
            className="w-full aspect-video object-cover rounded-lg mb-8"
          />
        )}

        {content ? (
          <div 
            dangerouslySetInnerHTML={{ __html: content }}
            className="prose prose-lg dark:prose-invert max-w-none"
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            {language === 'vi' ? 'Không có nội dung' : 'No content available'}
          </p>
        )}
      </article>
    </main>
  )
}