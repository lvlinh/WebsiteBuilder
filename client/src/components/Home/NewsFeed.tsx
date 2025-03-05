import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import type { News } from "@shared/schema"
import { format } from "date-fns"

export default function NewsFeed() {
  const { language } = useI18n()
  const { data: news, isLoading } = useQuery<News[]>({ 
    queryKey: ['/api/news']
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
      {news?.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>
              {language === 'vi' ? item.title_vi : item.title_en}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {format(new Date(item.publishedAt), 'PPP')}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'vi' ? item.content_vi : item.content_en}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
