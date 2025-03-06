import { Link } from "wouter"
import { useI18n, translations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import LocaleToggle from "./LocaleToggle"
import { Search, UserCircle2, LogOut } from 'lucide-react';
import { MainNav } from "./MainNav"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { language } = useI18n()
  const t = translations.nav

  // Check if admin is logged in
  const { data: admin } = useQuery({
    queryKey: ['/api/admin/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/me')
        if (response.ok) {
          return response.json()
        }
        return null
      } catch {
        return null
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  // Check if student is logged in
  const { data: student } = useQuery({
    queryKey: ['/api/students/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/students/me')
        if (response.ok) {
          return response.json()
        }
        return null
      } catch {
        return null
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })

  // Logout mutations
  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/admin/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] })
    }
  })

  const studentLogoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students/me'] })
    }
  })

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
                {admin ? (
                  admin.name
                ) : student ? (
                  student.fullName
                ) : (
                  language === 'vi' ? 'Đăng Nhập' : 'Login'
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {admin ? (
                <>
                  <Link href="/admin/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      {language === 'vi' ? 'Bảng Điều Khiển' : 'Dashboard'}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={() => adminLogoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'vi' ? 'Đăng Xuất' : 'Logout'}
                  </DropdownMenuItem>
                </>
              ) : student ? (
                <>
                  <Link href="/student/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      {language === 'vi' ? 'Bảng Điều Khiển' : 'Dashboard'}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={() => studentLogoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'vi' ? 'Đăng Xuất' : 'Logout'}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
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
                </>
              )}
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