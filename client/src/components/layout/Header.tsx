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
import LocaleToggle from "./LocaleToggle"

export default function Header() {
  const { language } = useI18n()
  const t = translations.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-xl font-bold">SJJS</span>
          </a>
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

        <LocaleToggle />
      </div>
    </header>
  )
}
