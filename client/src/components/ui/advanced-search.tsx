import * as React from "react"
import { Search } from "./search"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"

export interface SearchFilters {
  query: string
  type?: 'article' | 'event' | 'course'
  category?: string
  startDate?: Date
  endDate?: Date
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories?: string[]
  showDateFilter?: boolean
}

export function AdvancedSearch({ 
  onSearch,
  categories = [],
  showDateFilter = false
}: AdvancedSearchProps) {
  const { language } = useI18n()
  const [filters, setFilters] = React.useState<SearchFilters>({
    query: "",
    type: undefined,
    category: undefined,
    startDate: undefined,
    endDate: undefined
  })

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, query }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleTypeChange = (type: 'article' | 'event' | 'course') => {
    const newFilters = { ...filters, type }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const content = {
    type: {
      label: {
        vi: 'Loại',
        en: 'Type'
      },
      options: {
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
    },
    category: {
      label: {
        vi: 'Danh mục',
        en: 'Category'
      }
    },
    search: {
      placeholder: {
        vi: 'Tìm kiếm...',
        en: 'Search...'
      }
    }
  }

  return (
    <div className="space-y-4">
      <Search 
        placeholder={content.search.placeholder[language]}
        onSearch={handleSearch}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{content.type.label[language]}</Label>
          <Select
            value={filters.type}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(content.type.options).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value[language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>{content.category.label[language]}</Label>
            <Select
              value={filters.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
