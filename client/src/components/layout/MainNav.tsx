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
      <NavigationMenuList className="hidden md:flex">
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
            <NavigationMenuItem key={section.id} className="relative">
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10">
                {language === 'vi' ? section.title_vi : section.title_en}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-full w-[400px]">
                <ul className="grid gap-3 p-4 bg-[#8B4749]">
                  <li>
                    <Link href={`/${section.slug}`}>
                      <NavigationMenuLink className="cursor-pointer block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 text-white hover:text-white">
                        <div className="text-sm font-medium leading-none">
                          {language === 'vi' ? section.title_vi : section.title_en}
                        </div>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  {subsections.map(subsection => (
                    <li key={subsection.id}>
                      <Link href={`/${section.slug}/${subsection.slug}`}>
                        <NavigationMenuLink className="cursor-pointer block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 text-white hover:text-white">
                          <div className="text-sm font-medium leading-none">
                            {language === 'vi' ? subsection.title_vi : subsection.title_en}
                          </div>
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