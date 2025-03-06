import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Link } from "wouter"
import type { Article } from "@shared/schema"
import { format } from "date-fns"

export default function Articles() {
  const { language } = useI18n()
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  })

  const categories = {
    news: {
      vi: 'Tin tức',
      en: 'News'
    },
    announcement: {
      vi: 'Thông báo',
      en: 'Announcements'
    },
    internal: {
      vi: 'Tin nội bộ',
      en: 'Internal News'
    },
    catholic: {
      vi: 'Tin công giáo',
      en: 'Catholic News'
    },
    admission: {
      vi: 'Tin tuyển sinh',
      en: 'Admission News'
    },
    academic: {
      vi: 'Tin học viện',
      en: 'Academic News'
    }
  }

  if (isLoading) {
    return (
      <main className="container py-12">
        <h1 className="text-4xl font-bold mb-8">
          {language === 'vi' ? 'Bài viết' : 'Articles'}
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

  const articlesByCategory = articles?.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, Article[]>) || {};

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'vi' ? 'Bài viết' : 'Articles'}
      </h1>

      <Tabs defaultValue="news" className="space-y-8">
        <TabsList className="bg-background border w-full flex-wrap h-auto p-1 mb-6">
          {Object.entries(categories).map(([key, labels]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {labels[language]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([category, labels]) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 md:grid-cols-2">
              {articlesByCategory[category]?.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    {article.thumbnail && (
                      <div className="aspect-video">
                        <img
                          src={article.thumbnail}
                          alt={language === 'vi' ? article.title_vi : article.title_en}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>
                        {language === 'vi' ? article.title_vi : article.title_en}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <time dateTime={article.publishedAt}>
                          {format(new Date(article.publishedAt), 'PPP')}
                        </time>
                        {article.author && (
                          <>
                            <span>•</span>
                            <span>{article.author}</span>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {language === 'vi' ? article.excerpt_vi : article.excerpt_en}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}