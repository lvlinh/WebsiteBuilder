import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Page } from "@shared/schema"

export default function AdminDashboard() {
  const { language } = useI18n()
  const { toast } = useToast()
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)

  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ['/api/pages']
  })

  const createPageMutation = useMutation({
    mutationFn: async (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
      const res = await apiRequest("POST", "/api/admin/pages", page)
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: language === 'vi' ? 'Tạo trang thành công' : 'Page created successfully',
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Tạo trang thất bại' : 'Failed to create page',
      })
    }
  })

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...page }: Partial<Page> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/pages/${id}`, page)
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: language === 'vi' ? 'Cập nhật trang thành công' : 'Page updated successfully',
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật trang thất bại' : 'Failed to update page',
      })
    }
  })

  const handleCreatePage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createPageMutation.mutate({
      slug: formData.get('slug') as string,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      content_vi: formData.get('content_vi') as string,
      content_en: formData.get('content_en') as string,
      menu_order: parseInt(formData.get('menu_order') as string),
      published: true
    })
  }

  const handleUpdatePage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPage) return

    const formData = new FormData(e.currentTarget)
    updatePageMutation.mutate({
      id: selectedPage.id,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      content_vi: formData.get('content_vi') as string,
      content_en: formData.get('content_en') as string,
      published: formData.get('published') === 'true'
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container py-10">
      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">
            {language === 'vi' ? 'Quản lý trang' : 'Manage Pages'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'vi' ? 'Tạo trang mới' : 'Create New Page'}
              </CardTitle>
              <CardDescription>
                {language === 'vi' 
                  ? 'Tạo trang mới với nội dung song ngữ'
                  : 'Create a new bilingual page'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePage} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="menu_order">
                      {language === 'vi' ? 'Thứ tự menu' : 'Menu Order'}
                    </Label>
                    <Input 
                      id="menu_order" 
                      name="menu_order" 
                      type="number" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title_vi">
                      {language === 'vi' ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title'}
                    </Label>
                    <Input id="title_vi" name="title_vi" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_en">
                      {language === 'vi' ? 'Tiêu đề tiếng Anh' : 'English Title'}
                    </Label>
                    <Input id="title_en" name="title_en" required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="content_vi">
                      {language === 'vi' ? 'Nội dung tiếng Việt' : 'Vietnamese Content'}
                    </Label>
                    <Textarea 
                      id="content_vi" 
                      name="content_vi" 
                      required
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content_en">
                      {language === 'vi' ? 'Nội dung tiếng Anh' : 'English Content'}
                    </Label>
                    <Textarea 
                      id="content_en" 
                      name="content_en" 
                      required
                      className="min-h-[200px]"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={createPageMutation.isPending}>
                  {language === 'vi' ? 'Tạo trang' : 'Create Page'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'vi' ? 'Danh sách trang' : 'Page List'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages?.map(page => (
                  <Card key={page.id} className="cursor-pointer hover:bg-accent">
                    <CardHeader>
                      <CardTitle>{page.title_en}</CardTitle>
                      <CardDescription>Slug: {page.slug}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
