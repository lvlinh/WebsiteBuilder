import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import type { Article, ArticleCategory } from "@shared/schema"
import { format } from "date-fns"

const ARTICLES_PER_PAGE = 6

export default function Articles() {
  const { language } = useI18n()
  const [page, setPage] = useState(1)

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  })

  // Fetch dynamic categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<ArticleCategory[]>({
    queryKey: ['/api/article-categories']
  })

  if (articlesLoading || categoriesLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">
          {language === 'vi' ? 'Bài viết' : 'Articles'}
        </h1>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-6 w-2/3 bg-muted rounded" />
                <div className="h-4 w-1/3 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Group articles by category ID
  const articlesByCategory = (categories || []).reduce((acc, cat) => {
    acc[cat.slug] = (articles || []).filter(
      article => article.categoryId === cat.id
    )
    return acc
  }, {} as Record<string, Article[]>)

  // Sort articles by date within each category
  Object.values(articlesByCategory).forEach(categoryArticles => {
    categoryArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date();
      const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date();
      return dateB.getTime() - dateA.getTime();
    });
  });

  // Get total pages for current category
  const getTotalPages = (articles: Article[]) => {
    return Math.ceil(articles.length / ARTICLES_PER_PAGE);
  }

  // Get paginated articles
  const getPaginatedArticles = (articles: Article[]) => {
    const start = (page - 1) * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    return articles.slice(start, end);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">
        {language === 'vi' ? 'Bài viết' : 'Articles'}
      </h1>

      <Tabs defaultValue={categories?.[0]?.slug} className="space-y-8">
        <TabsList className="bg-background border w-full flex-wrap h-auto p-1">
          {categories?.map(category => (
            <TabsTrigger 
              key={category.slug} 
              value={category.slug}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => setPage(1)} // Reset page when changing category
            >
              {language === 'vi' ? category.title_vi : category.title_en}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories?.map(category => {
          const categoryArticles = articlesByCategory[category.slug] || [];
          const totalPages = getTotalPages(categoryArticles);
          const displayedArticles = getPaginatedArticles(categoryArticles);

          return (
            <TabsContent key={category.slug} value={category.slug}>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map((article) => (
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
                          {article.author && (
                            <>
                              <span>•</span>
                              <span>{article.author}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground line-clamp-3">
                          {language === 'vi' ? article.summary_vi : article.summary_en}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {page < totalPages && (
                <div className="mt-8 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => setPage(prev => prev + 1)}
                  >
                    {language === 'vi' ? 'Xem thêm' : 'Load more'}
                  </Button>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  )
}