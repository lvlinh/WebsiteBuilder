import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Link } from "wouter"
import type { Page } from "@shared/schema"

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
    <NavigationMenu>
      <NavigationMenuList>
        {mainSections.map(section => {
          const subsections = getSubsections(section.id)

          if (subsections.length === 0) {
            return (
              <NavigationMenuItem key={section.id}>
                <Link href={`/${section.slug}`}>
                  <NavigationMenuLink className="block px-4 py-2 text-white hover:text-white/80">
                    {language === 'vi' ? section.title_vi : section.title_en}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={section.id}>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10">
                {language === 'vi' ? section.title_vi : section.title_en}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-1 p-2 bg-[#8B4749] rounded-md shadow-lg">
                  <li>
                    <Link href={`/${section.slug}`}>
                      <NavigationMenuLink className="block w-full p-2 text-sm font-medium text-white rounded-md hover:bg-white/10">
                        {language === 'vi' ? section.title_vi : section.title_en}
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  {subsections.map(subsection => (
                    <li key={subsection.id}>
                      <Link href={`/${section.slug}/${subsection.slug}`}>
                        <NavigationMenuLink className="block w-full p-2 text-sm font-medium text-white rounded-md hover:bg-white/10">
                          {language === 'vi' ? subsection.title_vi : subsection.title_en}
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}