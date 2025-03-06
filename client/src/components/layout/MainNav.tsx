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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu } from "lucide-react"
import { useState } from "react"

export function MainNav() {
  const { language } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const { data: pages } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  })

  // Organize pages into a hierarchical structure
  const mainSections = pages?.filter(page => page.isSection) || []
  const getSubsections = (parentId: number) => {
    return pages?.filter(page => page.parentId === parentId) || []
  }

  // Mobile navigation content
  const MobileNavContent = () => (
    <div className="space-y-4 py-4">
      {mainSections.map(section => {
        const subsections = getSubsections(section.id)
        return (
          <div key={section.id} className="px-6 space-y-3">
            <Link 
              href={`/${section.slug}`}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-semibold text-white hover:text-white/80"
            >
              {language === 'vi' ? section.title_vi : section.title_en}
            </Link>
            {subsections.length > 0 && (
              <div className="pl-4 space-y-2">
                {subsections.map(subsection => (
                  <Link
                    key={subsection.id}
                    href={`/${section.slug}/${subsection.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block text-sm text-white/90 hover:text-white"
                  >
                    {language === 'vi' ? subsection.title_vi : subsection.title_en}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="text-white">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] bg-[#8B4749] p-0">
          <SheetHeader className="p-6 border-b border-white/10">
            <SheetTitle className="text-white">Menu</SheetTitle>
          </SheetHeader>
          <MobileNavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center space-x-6">
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
                className="w-[200px] bg-[#8B4749] text-white border-none shadow-lg"
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
    </>
  )
}