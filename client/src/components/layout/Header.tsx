import { Link } from "wouter"
import { useI18n, translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import LocaleToggle from "./LocaleToggle"
import { Search, UserCircle2 } from 'lucide-react';
import { MainNav } from "./MainNav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-white bg-transparent border-white hover:bg-white hover:text-[#8B4749]">
                <UserCircle2 className="mr-2 h-4 w-4" />
                {language === 'vi' ? 'Đăng Nhập' : 'Login'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/student/login">
                <DropdownMenuItem className="cursor-pointer">
                  {language === 'vi' ? 'Cổng Thông Tin Sinh Viên' : 'Student Portal'}
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/login">
                <DropdownMenuItem className="cursor-pointer">
                  {language === 'vi' ? 'Quản Trị Viên' : 'Administrator'}
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

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