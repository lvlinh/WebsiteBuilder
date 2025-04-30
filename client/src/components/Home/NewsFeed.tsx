import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import type { Article } from "@shared/schema"
import { format } from "date-fns"

const ARTICLES_PER_PAGE = 6

export default function NewsFeed() {
  const { language } = useI18n()
  const [page, setPage] = useState(1)
  const { data: articles, isLoading } = useQuery<Article[]>({ 
    queryKey: ['/api/articles'],
    select: (data) => data.filter(article => article.published)
                         .sort((a, b) => {
                           const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date();
                           const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date();
                           return dateB.getTime() - dateA.getTime();
                         })
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted rounded-t-lg" />
            <CardHeader>
              <div className="h-6 w-2/3 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const displayedArticles = articles?.slice(0, page * ARTICLES_PER_PAGE)
  const hasMore = articles && displayedArticles && displayedArticles.length < articles.length

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {displayedArticles?.map((article) => (
          <Link key={article.id} href={`/articles/${article.slug}`}>
            <Card className="cursor-pointer hover:bg-accent transition-colors h-full flex flex-col">
              {article.featuredImage && (
                <div className="aspect-video">
                  <img
                    src={article.featuredImage}
                    alt={language === 'vi' ? article.title_vi : article.title_en}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {language === 'vi' ? article.title_vi : article.title_en}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <time dateTime={article.publishedAt?.toString()}>
                    {article.publishedAt ? format(new Date(article.publishedAt), 'PPP') : format(new Date(), 'PPP')}
                  </time>
                  <span>•</span>
                  <span className="capitalize">
                    {article.categoryId ? `Category ${article.categoryId}` : 'Uncategorized'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">
                  {language === 'vi' ? article.summary_vi || '' : article.summary_en || ''}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
          >
            {language === 'vi' ? 'Xem thêm' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}