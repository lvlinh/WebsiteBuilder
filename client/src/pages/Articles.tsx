import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Article } from "@shared/schema"
import { format } from "date-fns"

export default function Articles() {
  const { language } = useI18n()
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  })

  const content = {
    title: {
      vi: 'Bài viết',
      en: 'Articles'
    },
    categories: {
      philosophy: {
        vi: 'Triết học',
        en: 'Philosophy'
      },
      theology: {
        vi: 'Thần học',
        en: 'Theology'
      },
      pastoral: {
        vi: 'Mục vụ',
        en: 'Pastoral'
      }
    }
  }

  if (isLoading) {
    return (
      <main className="container py-12">
        <h1 className="text-4xl font-bold mb-8">
          {content.title[language]}
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
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
      </main>
    )
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {articles?.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>
                {language === 'vi' ? article.title_vi : article.title_en}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {content.categories[article.category as keyof typeof content.categories][language]}
                </span>
                <span>•</span>
                <span>{format(new Date(article.publishedAt), 'PPP')}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3">
                {language === 'vi' ? article.content_vi : article.content_en}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
