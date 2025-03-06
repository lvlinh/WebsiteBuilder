import { useLocation } from "wouter"
import { useI18n } from "@/lib/i18n"
import { useQuery } from "@tanstack/react-query"
import { type Page } from "@shared/schema"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link } from "wouter"

interface BreadcrumbItem {
  slug: string
  title_vi: string
  title_en: string
  path: string
}

export default function BreadcrumbNav() {
  const [location] = useLocation()
  const { language } = useI18n()
  
  // Fetch all pages for navigation
  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages']
  })

  if (location === '/') return null

  // Parse the path segments
  const pathSegments = location.substring(1).split('/')
  const breadcrumbItems: BreadcrumbItem[] = []

  // Build breadcrumb items
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Handle special routes
    if (segment === 'bai-viet' && pathSegments[index - 1] === 'nghien-cuu-xuat-ban') {
      breadcrumbItems.push({
        slug: 'bai-viet',
        title_vi: 'Bài viết',
        title_en: 'Articles',
        path: currentPath
      })
      return
    }

    if (segment === 'su-kien' && pathSegments[index - 1] === 'gia-dinh-sjjs') {
      breadcrumbItems.push({
        slug: 'su-kien',
        title_vi: 'Sự kiện',
        title_en: 'Events',
        path: currentPath
      })
      return
    }

    // Find matching page
    const page = pages?.find(p => p.slug === segment)
    if (page) {
      breadcrumbItems.push({
        slug: page.slug,
        title_vi: page.title_vi,
        title_en: page.title_en,
        path: currentPath
      })
    }
  })

  if (breadcrumbItems.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.path}>
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage>
                {language === 'vi' ? item.title_vi : item.title_en}
              </BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link href={item.path}>
                    {language === 'vi' ? item.title_vi : item.title_en}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
