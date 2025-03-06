import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Link } from "wouter"
import type { Page } from "@shared/schema"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export function MainNav() {
  const { language } = useI18n()

  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  })

  // Organize pages into a hierarchical structure
  const mainSections = pages?.filter(page => page.isSection) || []
  const getSubsections = (parentId: number) => {
    return pages?.filter(page => page.parentId === parentId) || []
  }

  return (
    <nav className="hidden md:flex items-center space-x-4">
      {mainSections.map(section => {
        const subsections = getSubsections(section.id)

        if (subsections.length === 0) {
          return (
            <Link 
              key={section.id} 
              href={`/${section.slug}`}
              className="text-sm font-medium text-white hover:text-white/80"
            >
              {language === 'vi' ? section.title_vi : section.title_en}
            </Link>
          )
        }

        return (
          <DropdownMenu key={section.id}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white hover:text-white/80 hover:bg-white/10 px-4 py-2"
              >
                <span>{language === 'vi' ? section.title_vi : section.title_en}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start"
              className="w-[200px] bg-[#8B4749] text-white border-none"
            >
              <Link href={`/${section.slug}`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                  {language === 'vi' ? section.title_vi : section.title_en}
                </DropdownMenuItem>
              </Link>
              {subsections.map(subsection => (
                <Link 
                  key={subsection.id} 
                  href={`/${section.slug}/${subsection.slug}`}
                >
                  <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                    {language === 'vi' ? subsection.title_vi : subsection.title_en}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
    </nav>
  )
}