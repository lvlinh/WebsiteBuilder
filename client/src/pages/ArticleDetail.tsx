import { useQuery } from "@tanstack/react-query"
import { useParams } from "wouter"
import { useI18n } from "@/lib/i18n"
import { format } from "date-fns"
import type { Article } from "@shared/schema"

export default function ArticleDetail() {
  const { language } = useI18n()
  const { slug } = useParams()

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['/api/articles', slug],
    enabled: !!slug
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

  return (
    <main className="container py-12">
      <article className="prose prose-lg dark:prose-invert mx-auto">
        <h1>{language === 'vi' ? article.title_vi : article.title_en}</h1>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground not-prose">
          {article.author && (
            <>
              <span>{article.author}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={article.publishedAt}>
            {format(new Date(article.publishedAt), 'PPP')}
          </time>
          <span>•</span>
          <span className="capitalize">
            {article.category.replace('_', ' ')}
          </span>
        </div>

        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt={language === 'vi' ? article.title_vi : article.title_en}
            className="w-full aspect-video object-cover rounded-lg my-8"
          />
        )}

        <div 
          dangerouslySetInnerHTML={{ 
            __html: language === 'vi' ? article.content_vi : article.content_en 
          }} 
        />
      </article>
    </main>
  )
}
