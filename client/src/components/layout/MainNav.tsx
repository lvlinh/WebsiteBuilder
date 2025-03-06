import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuViewport } from "@/components/ui/navigation-menu"
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
      <NavigationMenuList className="hidden md:flex space-x-2">
        {mainSections.map(section => {
          const subsections = getSubsections(section.id)

          if (subsections.length === 0) {
            return (
              <NavigationMenuItem key={section.id}>
                <Link href={`/${section.slug}`}>
                  <NavigationMenuLink className="cursor-pointer px-4 py-2 text-white hover:text-white/80">
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
                <div className="bg-[#8B4749] rounded-md shadow-lg overflow-hidden min-w-[200px]">
                  <ul className="p-2 space-y-1">
                    <li>
                      <Link href={`/${section.slug}`}>
                        <NavigationMenuLink className="block w-full rounded-md p-2 hover:bg-white/10 text-white">
                          <div className="text-sm font-medium leading-none">
                            {language === 'vi' ? section.title_vi : section.title_en}
                          </div>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    {subsections.map(subsection => (
                      <li key={subsection.id}>
                        <Link href={`/${section.slug}/${subsection.slug}`}>
                          <NavigationMenuLink className="block w-full rounded-md p-2 hover:bg-white/10 text-white">
                            <div className="text-sm font-medium leading-none">
                              {language === 'vi' ? subsection.title_vi : subsection.title_en}
                            </div>
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
      <NavigationMenuViewport className="relative mt-2" />
    </NavigationMenu>
  )
}