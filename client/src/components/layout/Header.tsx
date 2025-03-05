import { Link } from "wouter"
import { useI18n, translations } from "@/lib/i18n"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import LocaleToggle from "./LocaleToggle"
import { Search } from 'lucide-react';

export default function Header() {
  const { language } = useI18n()
  const t = translations.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <span className="flex items-center space-x-2 cursor-pointer">
            <span className="text-xl font-bold">SJJS</span>
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/about">
                <NavigationMenuLink className="cursor-pointer">
                  {t.about[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/admissions">
                <NavigationMenuLink className="cursor-pointer">
                  {t.admissions[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/education">
                <NavigationMenuLink className="cursor-pointer">
                  {t.education[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/faculty">
                <NavigationMenuLink className="cursor-pointer">
                  {t.faculty[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/articles">
                <NavigationMenuLink className="cursor-pointer">
                  {t.articles[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/events">
                <NavigationMenuLink className="cursor-pointer">
                  {t.events[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/family">
                <NavigationMenuLink className="cursor-pointer">
                  {t.family[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/resources">
                <NavigationMenuLink className="cursor-pointer">
                  {t.resources[language]}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Link href="/student/login">
            <Button variant="outline" size="sm">
              {t.studentPortal[language]}
            </Button>
          </Link>
          <LocaleToggle />
          <Link href="/search">
            <Button variant="ghost" size="sm" className="px-2">
              <Search className="h-4 w-4" />
              <span className="sr-only">
                {language === 'vi' ? 'Tìm kiếm' : 'Search'}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}