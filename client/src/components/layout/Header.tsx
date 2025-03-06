import { Link } from "wouter"
import { useI18n, translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import LocaleToggle from "./LocaleToggle"
import { Search } from 'lucide-react';
import { MainNav } from "./MainNav"

export default function Header() {
  const { language } = useI18n()
  const t = translations.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#8B4749]/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <span className="flex items-center space-x-2 cursor-pointer">
            <img 
              src="/assets/sjjs-logo.jpg" 
              alt="SJJS Logo" 
              className="h-12 w-auto"
            />
          </span>
        </Link>

        <MainNav />

        <div className="flex items-center gap-4">
          <Link href="/student/login">
            <Button variant="outline" size="sm" className="text-white bg-transparent border-white hover:bg-white hover:text-[#8B4749]">
              {t.studentPortal[language]}
            </Button>
          </Link>
          <LocaleToggle />
          <Link href="/search">
            <Button variant="ghost" size="sm" className="px-2 text-white hover:text-white/80">
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