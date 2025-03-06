import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { Link } from "wouter"
import type { Article } from "@shared/schema"
import { format } from "date-fns"

export default function NewsFeed() {
  const { language } = useI18n()
  const { data: articles, isLoading } = useQuery<Article[]>({ 
    queryKey: ['/api/articles'],
    select: (data) => data.filter(article => article.featured && article.published)
                         .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                         .slice(0, 3)
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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

  return (
    <div className="space-y-4">
      {articles?.map((article) => (
        <Link key={article.id} href={`/articles/${article.slug}`}>
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'vi' ? article.title_vi : article.title_en}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={article.publishedAt}>
                  {format(new Date(article.publishedAt), 'PPP')}
                </time>
                <span>•</span>
                <span className="capitalize">
                  {article.category.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">
                {language === 'vi' ? article.excerpt_vi : article.excerpt_en}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}