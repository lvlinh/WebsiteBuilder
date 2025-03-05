import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { AdvancedSearch, type SearchFilters } from "@/components/ui/advanced-search"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { Article, Event, Course } from "@shared/schema"
import { format } from "date-fns"
import { Link } from "wouter"

type SearchResult = {
  type: 'article' | 'event' | 'course'
  id: number
  title: string
  description: string
  category?: string
  date?: Date
}

export default function SearchPage() {
  const { language } = useI18n()
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: undefined,
    category: undefined
  })

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...filters,
        query: filters.query || ''
      })
      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) throw new Error('Search failed')
      return response.json()
    },
    enabled: !!filters.query || !!filters.type || !!filters.category
  })

  const content = {
    title: {
      vi: 'Tìm kiếm',
      en: 'Search'
    },
    noResults: {
      vi: 'Không tìm thấy kết quả nào',
      en: 'No results found'
    },
    types: {
      article: {
        vi: 'Bài viết',
        en: 'Article'
      },
      event: {
        vi: 'Sự kiện',
        en: 'Event'
      },
      course: {
        vi: 'Khóa học',
        en: 'Course'
      }
    }
  }

  const renderResult = (result: SearchResult) => {
    const getLink = () => {
      switch (result.type) {
        case 'article':
          return `/articles/${result.id}`
        case 'event':
          return `/events/${result.id}`
        case 'course':
          return `/courses/${result.id}`
      }
    }

    return (
      <Card key={`${result.type}-${result.id}`}>
        <CardHeader>
          <CardTitle>
            <Link href={getLink()}>
              <a className="hover:underline">
                {result.title}
              </a>
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{content.types[result.type][language]}</span>
            {result.category && (
              <>
                <span>•</span>
                <span>{result.category}</span>
              </>
            )}
            {result.date && (
              <>
                <span>•</span>
                <span>{format(new Date(result.date), 'PPP')}</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2">
            {result.description}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <main className="container py-12">
      <h1 className="text-4xl font-bold mb-8">
        {content.title[language]}
      </h1>

      <div className="mb-8">
        <AdvancedSearch onSearch={setFilters} />
      </div>

      {isLoading ? (
        <div className="grid gap-6">
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
      ) : results?.length ? (
        <div className="grid gap-6">
          {results.map(renderResult)}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          {content.noResults[language]}
        </p>
      )}
    </main>
  )
}
