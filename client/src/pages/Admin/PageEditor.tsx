import { useMutation, useQuery } from "@tanstack/react-query"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useToast } from "@/hooks/use-toast"
import { queryClient } from "@/lib/queryClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Page, ArticleCategory } from "@shared/schema"
import { useEffect, useState } from "react"

interface PageEditorProps {
  page: Page
  onBack: () => void
}

export default function PageEditor({ page, onBack }: PageEditorProps) {
  const { language } = useI18n()
  const { toast } = useToast()
  const [pageType, setPageType] = useState<string>(page.pageType || 'regular')
  
  // Fetch article categories for the select dropdown
  const { data: categories } = useQuery<ArticleCategory[]>({
    queryKey: ['/api/admin/article-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/article-categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    }
  })
  
  // Handle page type change to toggle category selector visibility
  const handlePageTypeChange = (value: string) => {
    setPageType(value)
  }

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Page> & { id: number }) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update page')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] })
      toast({ title: language === 'vi' ? 'Cập nhật thành công' : 'Update successful' })
      onBack()
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật thất bại' : 'Update failed'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Basic fields every page needs
    const updateData: Partial<Page> & { id: number } = {
      id: page.id,
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      published: formData.get('published') === 'on',
      pageType: formData.get('pageType') as string,
    }
    
    // Handle content based on page type
    if (formData.get('pageType') === 'regular') {
      updateData.content_vi = formData.get('content_vi') as string
      updateData.content_en = formData.get('content_en') as string
      updateData.linkedCategoryId = null // Clear any linked category
    } else if (formData.get('pageType') === 'category') {
      // For category pages, set the linked category ID
      const categoryId = formData.get('linkedCategoryId')
      updateData.linkedCategoryId = categoryId ? parseInt(categoryId as string, 10) : null
      
      // For category pages, keep minimal content (we'll display the articles instead)
      updateData.content_vi = formData.get('content_vi') as string || ''
      updateData.content_en = formData.get('content_en') as string || ''
    }
    
    updateMutation.mutate(updateData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {language === 'vi' ? 'Chỉnh sửa trang' : 'Edit Page'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title_vi">
              {language === 'vi' ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title'}
            </Label>
            <Input 
              id="title_vi" 
              name="title_vi" 
              defaultValue={page.title_vi}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_en">
              {language === 'vi' ? 'Tiêu đề tiếng Anh' : 'English Title'}
            </Label>
            <Input 
              id="title_en" 
              name="title_en" 
              defaultValue={page.title_en}
              required 
            />
          </div>
        </div>
        
        {/* Page Type Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              {language === 'vi' ? 'Loại trang' : 'Page Type'}
            </Label>
            <RadioGroup 
              defaultValue={page.pageType || 'regular'} 
              name="pageType" 
              className="flex flex-col space-y-1"
              onValueChange={handlePageTypeChange}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regular" id="page-type-regular" />
                <Label htmlFor="page-type-regular" className="cursor-pointer">
                  {language === 'vi' ? 'Trang thường' : 'Regular Page'} <span className="text-muted-foreground">({language === 'vi' ? 'nội dung tĩnh' : 'static content'})</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category" id="page-type-category" />
                <Label htmlFor="page-type-category" className="cursor-pointer">
                  {language === 'vi' ? 'Trang danh mục bài viết' : 'Article Category Page'} <span className="text-muted-foreground">({language === 'vi' ? 'hiển thị các bài viết từ danh mục' : 'displays articles from a category'})</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Category Selection (conditionally shown for category pages) */}
          {pageType === 'category' && (
            <div className="space-y-2 border-l-2 border-primary/20 pl-4 ml-1 mt-2" id="category-select-container">
              <Label htmlFor="linkedCategoryId" className="font-semibold">
                {language === 'vi' ? 'Danh mục bài viết' : 'Article Category'}
              </Label>
              <Select name="linkedCategoryId" defaultValue={page.linkedCategoryId?.toString() || ''}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'vi' ? "Chọn danh mục" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {language === 'vi' ? category.title_vi : category.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {language === 'vi' 
                  ? 'Trang sẽ hiển thị các bài viết từ danh mục đã chọn'
                  : 'The page will display articles from the selected category'}
              </p>
            </div>
          )}
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">{language === 'vi' ? 'Nội dung trang' : 'Page Content'}</TabsTrigger>
            <TabsTrigger value="settings">{language === 'vi' ? 'Cài đặt' : 'Settings'}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="content_vi">
                {language === 'vi' ? 'Nội dung tiếng Việt' : 'Vietnamese Content'}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'vi' 
                  ? 'Đối với trang danh mục, nội dung này sẽ hiển thị ở phần đầu trang trước danh sách bài viết'
                  : 'For category pages, this content will be displayed at the top of the page before the article list'}
              </p>
              <input 
                type="hidden" 
                name="content_vi" 
                id="content_vi" 
                value={page.content_vi} 
              />
              <RichTextEditor
                content={page.content_vi}
                onChange={(html) => {
                  const input = document.getElementById('content_vi') as HTMLInputElement
                  if (input) input.value = html
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_en">
                {language === 'vi' ? 'Nội dung tiếng Anh' : 'English Content'}
              </Label>
              <input 
                type="hidden" 
                name="content_en" 
                id="content_en" 
                value={page.content_en} 
              />
              <RichTextEditor
                content={page.content_en}
                onChange={(html) => {
                  const input = document.getElementById('content_en') as HTMLInputElement
                  if (input) input.value = html
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="published" 
                name="published"
                defaultChecked={page.published ?? true}
              />
              <Label htmlFor="published">
                {language === 'vi' ? 'Xuất bản' : 'Published'}
              </Label>
            </div>
            
            {/* Add more page settings as needed */}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button 
            type="submit"
            disabled={updateMutation.isPending}
          >
            {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
