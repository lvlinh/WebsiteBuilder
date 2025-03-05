import { useState } from "react"
import { useLocation } from "wouter"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"

export default function AdminLogin() {
  const [_, setLocation] = useLocation()
  const { toast } = useToast()
  const { language } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { email, password })
      return res.json()
    },
    onSuccess: () => {
      setLocation("/admin/dashboard")
      toast({
        title: language === 'vi' ? 'Đăng nhập thành công' : 'Login successful',
        description: language === 'vi' 
          ? 'Chào mừng bạn đến với trang quản trị' 
          : 'Welcome to the admin dashboard',
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Đăng nhập thất bại' : 'Login failed',
        description: language === 'vi'
          ? 'Email hoặc mật khẩu không đúng'
          : 'Invalid email or password',
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate()
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {language === 'vi' ? 'Đăng nhập quản trị' : 'Admin Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'vi' ? 'Email' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'vi' ? 'Mật khẩu' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {language === 'vi' ? 'Đăng nhập' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
